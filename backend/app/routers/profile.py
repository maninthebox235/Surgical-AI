from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from ..core.deps import get_current_active_user
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserUpdate, UserResponse

router = APIRouter()


@router.get("/", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user profile.
    """
    return current_user


@router.put("/", response_model=UserResponse)
def update_profile(
    *,
    db: Session = Depends(get_db),
    profile_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update current user profile.
    """
    update_data = profile_in.dict(exclude_unset=True)

    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user
