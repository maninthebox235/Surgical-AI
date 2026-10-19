from typing import Any
import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, UserRole

router = APIRouter()
security = HTTPBearer()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Any:
    try:
        token = credentials.credentials
        # Dev/test path: signature verification disabled; key omitted intentionally.
        payload = jwt.decode(
            token,
            key="",
            options={"verify_signature": False},
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/",
        )
        email = payload.get("email")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        user = db.query(User).filter(User.email == email).first()
        if user is None:
            # Create new user if they don't exist
            user = User(email=email)
            db.add(user)
            db.commit()
            db.refresh(user)

        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    return {"id": current_user.id, "email": current_user.email, "role": current_user.role}
