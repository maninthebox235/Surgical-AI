import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BaseModel

if TYPE_CHECKING:
    from .video import Video


class AnalysisType(str, enum.Enum):
    INSTRUMENT_DETECTION = "instrument_detection"
    STEP_RECOGNITION = "step_recognition"
    SKILL_ASSESSMENT = "skill_assessment"
    COMPLICATION_DETECTION = "complication_detection"


class Analysis(Base):
    """Row in the `analyses` table created by the initial migration."""

    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    video_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("videos.id"), nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=True
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    video: Mapped[Optional["Video"]] = relationship("Video", back_populates="analysis")


class AnalysisResult(BaseModel):
    __tablename__ = "analysis_results"

    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    analysis_type: Mapped[AnalysisType] = mapped_column(Enum(AnalysisType), nullable=False)
    start_time: Mapped[float] = mapped_column(Float, nullable=False)
    end_time: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    results: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    analysis_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    video: Mapped["Video"] = relationship("Video", back_populates="analysis_results")
