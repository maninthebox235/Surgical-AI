from datetime import timedelta

import jwt
import pytest

from app.core import security
from app.core.config import settings


def test_create_and_verify_access_token_round_trip() -> None:
    token = security.create_access_token({"sub": "surgeon@example.com", "role": "student"})
    payload = security.verify_token(token)

    assert payload is not None
    assert payload["sub"] == "surgeon@example.com"
    assert payload["role"] == "student"
    assert "exp" in payload


def test_verify_token_rejects_expired_token() -> None:
    token = security.create_access_token(
        {"sub": "expired@example.com"},
        expires_delta=timedelta(seconds=-30),
    )

    assert security.verify_token(token) is None


def test_verify_token_rejects_tampered_token() -> None:
    token = security.create_access_token({"sub": "tamper@example.com"})
    parts = token.split(".")
    assert len(parts) == 3

    # Flip a character in the payload segment so the signature no longer matches.
    tampered_payload = parts[1][:-1] + ("A" if parts[1][-1] != "A" else "B")
    tampered = ".".join([parts[0], tampered_payload, parts[2]])

    with pytest.raises(jwt.PyJWTError):
        jwt.decode(tampered, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

    assert security.verify_token(tampered) is None
