from typing import Any
from sqlalchemy import Column, String, ForeignKey, Text, JSON, Float, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum


class AnnotationType(str, enum.Enum):
    STEP = "step"
    MILESTONE = "milestone"
    FEEDBACK = "feedback"
    COMMENT = "comment"
    QUESTION = "question"


class Annotation(BaseModel):
    __allow_unmapped__ = True
    __tablename__ = "annotations"

    video_id: Any = Column(ForeignKey("videos.id"), nullable=False)
    user_id: Any = Column(ForeignKey("users.id"), nullable=False)
    timestamp = Column(Float, nullable=False)  # Time in seconds from video start
    annotation_type = Column(String, nullable=False)  # e.g., "step", "milestone", "feedback"
    content = Column(Text, nullable=False)
    annotation_metadata = Column(JSON)  # Additional structured data

    # Relationships
    video = relationship("Video", back_populates="annotations")
    user = relationship("User", back_populates="annotations")
    comments = relationship("Comment", back_populates="annotation", cascade="all, delete-orphan")
