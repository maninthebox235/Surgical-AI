from typing import Any
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.models.base import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"


class VideoStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class User(Base):
    __tablename__ = "users_legacy"
    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    role: Any = Column(Enum(UserRole), default=UserRole.STUDENT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    videos = relationship("Video", back_populates="user")


class Video(Base):
    __tablename__ = "videos_legacy"
    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    file_path = Column(String)
    status: Any = Column(Enum(VideoStatus), default=VideoStatus.PENDING)
    progress: Any = Column(Float, default=0.0)
    user_id: Any = Column(Integer, ForeignKey("users_legacy.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="videos")
    analysis = relationship("Analysis", back_populates="video", uselist=False)


class Analysis(Base):
    __tablename__ = "analyses_legacy"
    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True, index=True)
    video_id: Any = Column(Integer, ForeignKey("videos_legacy.id"))
    feedback = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    video = relationship("Video", back_populates="analysis")
