"""Auth0 access-token verification tests (PyJWT + PyJWKClient).

Verification itself is not mocked: tokens are signed with a real RSA keypair and
JWKS is served through a patched ``PyJWKClient.fetch_data``.
"""

from __future__ import annotations

import base64
import json
import time
from typing import Any, Dict, Generator, Iterator, List
from unittest.mock import patch

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import FastAPI
from fastapi.testclient import TestClient
from jwt import PyJWKClient
from jwt.algorithms import RSAAlgorithm
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.auth0 import reset_jwks_cache_for_tests
from app.core.config import settings
from app.core.database import get_db
from app.models.base import Base
from app.models.models import User
from app.routes.auth import router as auth_router

AUTH0_DOMAIN = "test-tenant.auth0.com"
AUTH0_AUDIENCE = "https://api.surgical-education.test"
KID = "test-key-1"
OTHER_KID = "unknown-kid"


@pytest.fixture()
def rsa_keys() -> Dict[str, Any]:
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_jwk = json.loads(RSAAlgorithm.to_jwk(private_key.public_key()))
    public_jwk["kid"] = KID
    public_jwk["use"] = "sig"
    public_jwk["alg"] = "RS256"
    return {
        "private_key": private_key,
        "jwks": {"keys": [public_jwk]},
    }


@pytest.fixture()
def auth_settings(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    monkeypatch.setattr(settings, "AUTH0_DOMAIN", AUTH0_DOMAIN)
    monkeypatch.setattr(settings, "AUTH0_AUDIENCE", AUTH0_AUDIENCE)
    monkeypatch.setattr(settings, "AUTH0_JWKS_CACHE_TTL_SECONDS", 3600)
    monkeypatch.setattr(settings, "AUTH0_JWKS_UNKNOWN_KID_COOLDOWN_SECONDS", 60)
    reset_jwks_cache_for_tests()
    yield
    reset_jwks_cache_for_tests()


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def client(
    db_session: Session, rsa_keys: Dict[str, Any], auth_settings: None
) -> Generator[TestClient, None, None]:
    app = FastAPI()
    app.include_router(auth_router, prefix="/api/v1/auth")

    def _override_get_db() -> Generator[Session, None, None]:
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db

    with patch.object(PyJWKClient, "fetch_data", return_value=rsa_keys["jwks"]):
        with TestClient(app) as test_client:
            yield test_client


def _b64url_json(data: Dict[str, Any]) -> str:
    return (
        base64.urlsafe_b64encode(json.dumps(data, separators=(",", ":")).encode("utf-8"))
        .rstrip(b"=")
        .decode("ascii")
    )


def _base_claims(**overrides: Any) -> Dict[str, Any]:
    now = int(time.time())
    claims: Dict[str, Any] = {
        "sub": "auth0|user-1",
        "email": "surgeon@example.com",
        "aud": AUTH0_AUDIENCE,
        "iss": f"https://{AUTH0_DOMAIN}/",
        "iat": now,
        "exp": now + 3600,
        "nbf": now - 10,
    }
    claims.update(overrides)
    return claims


def _sign_rs256(claims: Dict[str, Any], private_key: Any, kid: str = KID) -> str:
    return jwt.encode(claims, private_key, algorithm="RS256", headers={"kid": kid})


def _user_count(db_session: Session) -> int:
    return db_session.query(User).count()


def test_valid_token_creates_user(
    client: TestClient, db_session: Session, rsa_keys: Dict[str, Any]
) -> None:
    token = _sign_rs256(_base_claims(), rsa_keys["private_key"])
    assert _user_count(db_session) == 0

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "surgeon@example.com"
    assert _user_count(db_session) == 1

    response2 = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response2.status_code == 200
    assert _user_count(db_session) == 1
    assert response2.json()["id"] == body["id"]


@pytest.mark.parametrize(
    "case",
    [
        "invalid",
        "expired",
        "wrong_audience",
        "wrong_issuer",
        "bad_signature",
        "alg_none",
        "hs256_confusion",
        "unknown_kid",
    ],
)
def test_rejected_tokens_return_401_and_do_not_create_user(
    case: str,
    client: TestClient,
    db_session: Session,
    rsa_keys: Dict[str, Any],
) -> None:
    private_key = rsa_keys["private_key"]
    now = int(time.time())

    if case == "invalid":
        token = "not.a.jwt"
    elif case == "expired":
        token = _sign_rs256(
            _base_claims(exp=now - 120, iat=now - 240, nbf=now - 240),
            private_key,
        )
    elif case == "wrong_audience":
        token = _sign_rs256(_base_claims(aud="https://wrong.audience"), private_key)
    elif case == "wrong_issuer":
        token = _sign_rs256(_base_claims(iss="https://evil-tenant.auth0.com/"), private_key)
    elif case == "bad_signature":
        good = _sign_rs256(_base_claims(), private_key)
        header, payload, signature = good.split(".")
        flipped = ("A" if signature[0] != "A" else "B") + signature[1:]
        token = f"{header}.{payload}.{flipped}"
    elif case == "alg_none":
        header = _b64url_json({"alg": "none", "typ": "JWT"})
        payload = _b64url_json(_base_claims())
        token = f"{header}.{payload}."
    elif case == "hs256_confusion":
        # HS256 token with kid pointing at an RSA JWK — must be rejected (RS256 only).
        token = jwt.encode(
            _base_claims(),
            "not-an-rsa-hmac-secret-value",
            algorithm="HS256",
            headers={"kid": KID},
        )
    elif case == "unknown_kid":
        token = _sign_rs256(_base_claims(), private_key, kid=OTHER_KID)
    else:
        raise AssertionError(f"unexpected case: {case}")

    assert _user_count(db_session) == 0
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401, case
    assert _user_count(db_session) == 0, case


def test_unknown_kid_refreshes_jwks_then_accepts(
    db_session: Session, rsa_keys: Dict[str, Any], auth_settings: None
) -> None:
    """After key rotation, an unknown kid triggers JWKS refresh and succeeds."""
    rotated_private = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    rotated_jwk = json.loads(RSAAlgorithm.to_jwk(rotated_private.public_key()))
    rotated_kid = "rotated-key"
    rotated_jwk["kid"] = rotated_kid
    rotated_jwk["use"] = "sig"
    rotated_jwk["alg"] = "RS256"

    fetch_calls: List[Dict[str, Any]] = []

    def fake_fetch(self: PyJWKClient) -> Dict[str, Any]:
        if not fetch_calls:
            fetch_calls.append(rsa_keys["jwks"])
            return rsa_keys["jwks"]
        rotated = {"keys": list(rsa_keys["jwks"]["keys"]) + [rotated_jwk]}
        fetch_calls.append(rotated)
        return rotated

    app = FastAPI()
    app.include_router(auth_router, prefix="/api/v1/auth")

    def _override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    reset_jwks_cache_for_tests()

    token = _sign_rs256(_base_claims(), rotated_private, kid=rotated_kid)

    with patch.object(PyJWKClient, "fetch_data", fake_fetch):
        with TestClient(app) as test_client:
            response = test_client.get(
                "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
            )

    assert response.status_code == 200
    assert len(fetch_calls) == 2
    assert _user_count(db_session) == 1


def test_unknown_kid_refresh_respects_cooldown(
    db_session: Session,
    rsa_keys: Dict[str, Any],
    auth_settings: None,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Unknown kids must not force a JWKS fetch on every request during cooldown."""
    monkeypatch.setattr(settings, "AUTH0_JWKS_UNKNOWN_KID_COOLDOWN_SECONDS", 60)

    fetch_count = {"n": 0}

    def fake_fetch(self: PyJWKClient) -> Dict[str, Any]:
        fetch_count["n"] += 1
        return rsa_keys["jwks"]

    # Controllable monotonic clock for cooldown.
    clock = {"t": 1000.0}

    def fake_monotonic() -> float:
        return clock["t"]

    app = FastAPI()
    app.include_router(auth_router, prefix="/api/v1/auth")

    def _override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    reset_jwks_cache_for_tests()

    # Sign with a key that is never published in JWKS.
    orphan_private = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    token = _sign_rs256(_base_claims(), orphan_private, kid="never-published")

    with patch.object(PyJWKClient, "fetch_data", fake_fetch):
        with patch("jwt.jwks_client.time.monotonic", fake_monotonic):
            with TestClient(app) as test_client:
                # First unknown kid: initial fetch + one refresh attempt.
                r1 = test_client.get(
                    "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
                )
                fetches_after_first = fetch_count["n"]
                assert r1.status_code == 401
                assert fetches_after_first >= 1

                # Still within cooldown — no additional refresh fetch.
                clock["t"] += 10
                r2 = test_client.get(
                    "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
                )
                assert r2.status_code == 401
                assert fetch_count["n"] == fetches_after_first

                # After cooldown elapses, another refresh is allowed.
                clock["t"] += 60
                r3 = test_client.get(
                    "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
                )
                assert r3.status_code == 401
                assert fetch_count["n"] > fetches_after_first

    assert _user_count(db_session) == 0
