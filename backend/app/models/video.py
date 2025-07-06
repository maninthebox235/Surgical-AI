from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base

class VideoStatus(str, enum.Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    file_path = Column(String, nullable=False)
    thumbnail_path = Column(String)
    duration = Column(String)  # Store as ISO 8601 duration string
    status = Column(Enum(VideoStatus), default=VideoStatus.UPLOADING)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="videos")
    analysis = relationship("Analysis", back_populates="video", uselist=False)
    annotations = relationship("Annotation", back_populates="video", cascade="all, delete-orphan")
    analysis_results = relationship("AnalysisResult", back_populates="video")

    class Config:
        orm_mode = True 