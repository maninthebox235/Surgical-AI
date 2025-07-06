from sqlalchemy import Column, String, ForeignKey, JSON, Float, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum

class AnalysisType(str, enum.Enum):
    INSTRUMENT_DETECTION = "instrument_detection"
    STEP_RECOGNITION = "step_recognition"
    SKILL_ASSESSMENT = "skill_assessment"
    COMPLICATION_DETECTION = "complication_detection"

class AnalysisResult(BaseModel):
    __tablename__ = "analysis_results"

    video_id = Column(ForeignKey("videos.id"), nullable=False)
    analysis_type = Column(Enum(AnalysisType), nullable=False)
    start_time = Column(Float, nullable=False)  # Time in seconds from video start
    end_time = Column(Float, nullable=False)  # Time in seconds from video start
    confidence_score = Column(Float)  # AI model confidence score
    results = Column(JSON, nullable=False)  # Structured analysis results
    analysis_metadata = Column(JSON)  # Additional analysis metadata
    
    # Relationships
    video = relationship("Video", back_populates="analysis_results")
