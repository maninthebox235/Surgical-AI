from typing import Any
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
import enum

from .base import BaseModel


class VideoStatus(str, enum.Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"
    PENDING = "pending"
    COMPLETED = "completed"


class Video(BaseModel):
    __tablename__ = "videos"
    __allow_unmapped__ = True

    title = Column(String, nullable=False)
    description = Column(Text)
    file_path = Column(String, nullable=False)
    thumbnail_path = Column(String)
    duration = Column(String)  # Store as ISO 8601 duration string
    status: Any = Column(Enum(VideoStatus), default=VideoStatus.UPLOADING)
    user_id: Any = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    uploaded_by_id: Any = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    progress: Any = Column(Integer, default=0)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="videos")
    annotations = relationship("Annotation", back_populates="video", cascade="all, delete-orphan")
    analysis_results = relationship("AnalysisResult", back_populates="video")

    class Config:
        orm_mode = True
