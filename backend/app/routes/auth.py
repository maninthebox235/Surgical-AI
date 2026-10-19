"""Auth0 bearer auth for the legacy ``app.routes`` package.

Not mounted by ``app.main`` (which wires ``app.routers`` instead). Sibling
modules under ``app.routes`` still depend on ``get_current_user``, so tokens
here must verify signature + aud/iss/exp via ``verify_auth0_token``.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.auth0 import Auth0TokenError, verify_auth0_token
from app.core.database import get_db
from app.models.models import User

router = APIRouter()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = verify_auth0_token(credentials.credentials)
    except Auth0TokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        ) from exc

    email = payload.get("email")
    if email is None or not isinstance(email, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        # Create new user if they don't exist (only after successful verification)
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
    }
