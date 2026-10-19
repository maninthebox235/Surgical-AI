import enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel

if TYPE_CHECKING:
    from .analysis import Analysis, AnalysisResult
    from .annotation import Annotation
    from .user import User


class VideoStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Video(BaseModel):
    __tablename__ = "videos"

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    thumbnail_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[VideoStatus] = mapped_column(Enum(VideoStatus), default=VideoStatus.PENDING)
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )

    user: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[user_id], back_populates="videos"
    )
    annotations: Mapped[List["Annotation"]] = relationship(
        "Annotation", back_populates="video", cascade="all, delete-orphan"
    )
    analysis_results: Mapped[List["AnalysisResult"]] = relationship(
        "AnalysisResult", back_populates="video"
    )
    analysis: Mapped[Optional["Analysis"]] = relationship(
        "Analysis", back_populates="video", uselist=False
    )
