"""Auth0 access-token verification via JWKS (RS256) using PyJWT."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import jwt
from jwt import PyJWKClient
from jwt.exceptions import InvalidAlgorithmError, PyJWKClientError, PyJWTError

from .config import settings

AUTH0_ALGORITHMS: List[str] = ["RS256"]


class Auth0TokenError(Exception):
    """Raised when an Auth0 access token fails verification."""


class JWKSClientCache:
    """Process-wide PyJWKClient with TTL cache and unknown-kid refresh cooldown."""

    def __init__(self) -> None:
        self._client: Optional[PyJWKClient] = None
        self._domain: Optional[str] = None

    def clear(self) -> None:
        self._client = None
        self._domain = None

    def get_client(self, domain: str) -> PyJWKClient:
        if self._client is None or self._domain != domain:
            self._client = PyJWKClient(
                uri=f"https://{domain}/.well-known/jwks.json",
                cache_keys=True,
                cache_jwk_set=True,
                lifespan=float(settings.AUTH0_JWKS_CACHE_TTL_SECONDS),
                cooldown_duration=float(settings.AUTH0_JWKS_UNKNOWN_KID_COOLDOWN_SECONDS),
            )
            self._domain = domain
        return self._client


_jwks_cache = JWKSClientCache()


def get_jwks_cache() -> JWKSClientCache:
    return _jwks_cache


def reset_jwks_cache_for_tests() -> None:
    """Clear the process-wide JWKS client (tests only)."""
    _jwks_cache.clear()


def verify_auth0_token(token: str) -> Dict[str, Any]:
    """
    Verify an Auth0 access token.

    Enforces RS256 only, signature via tenant JWKS (PyJWKClient), audience,
    issuer, exp, and nbf. Unknown ``kid`` triggers at most one JWKS refresh per
    ``AUTH0_JWKS_UNKNOWN_KID_COOLDOWN_SECONDS`` window.
    """
    domain = settings.AUTH0_DOMAIN
    audience = settings.AUTH0_AUDIENCE
    if not domain or not audience:
        raise Auth0TokenError("Auth0 is not configured")

    try:
        header = jwt.get_unverified_header(token)
    except PyJWTError as exc:
        raise Auth0TokenError("Invalid token header") from exc

    alg = header.get("alg")
    if alg != "RS256":
        raise Auth0TokenError("Unsupported token algorithm")

    kid = header.get("kid")
    if not kid or not isinstance(kid, str):
        raise Auth0TokenError("Token missing key id")

    client = _jwks_cache.get_client(domain)
    try:
        signing_key = client.get_signing_key_from_jwt(token)
    except PyJWKClientError as exc:
        raise Auth0TokenError("Unknown token key id") from exc

    issuer = f"https://{domain}/"
    try:
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=AUTH0_ALGORITHMS,
            audience=audience,
            issuer=issuer,
            options={
                "require": ["exp", "aud", "iss"],
                "verify_signature": True,
                "verify_aud": True,
                "verify_iss": True,
                "verify_exp": True,
                "verify_nbf": True,
            },
        )
    except InvalidAlgorithmError as exc:
        raise Auth0TokenError("Unsupported token algorithm") from exc
    except PyJWTError as exc:
        raise Auth0TokenError("Token verification failed") from exc

    if not isinstance(payload, dict):
        raise Auth0TokenError("Invalid token payload")
    return payload
