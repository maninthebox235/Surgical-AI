from typing import Any
from sqlalchemy import Column, String, Boolean, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum


class UserRole(str, enum.Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"


class User(BaseModel):
    __tablename__ = "users"
    __allow_unmapped__ = True

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role: Any = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    videos = relationship("Video", foreign_keys="Video.user_id", back_populates="user")
    annotations = relationship("Annotation", back_populates="user")
