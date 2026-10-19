from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from ..models.analysis import AnalysisType


class AnalysisBase(BaseModel):
    video_id: int
    status: str
    progress: float = 0.0
    result: Optional[dict] = None
    error: Optional[str] = None


class AnalysisCreate(AnalysisBase):
    pass


class AnalysisUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[float] = None
    result: Optional[dict] = None
    error: Optional[str] = None


class AnalysisInDB(AnalysisBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        from_attributes = True


class AnalysisResponse(AnalysisInDB):
    pass


class AnalysisResultBase(BaseModel):
    analysis_type: AnalysisType
    start_time: float
    end_time: float
    confidence_score: Optional[float] = None
    results: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None


class AnalysisResultCreate(AnalysisResultBase):
    video_id: int


class AnalysisResultUpdate(BaseModel):
    confidence_score: Optional[float] = None
    results: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class AnalysisResultInDB(AnalysisResultBase):
    id: int
    video_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InstrumentDetectionResult(BaseModel):
    instrument_type: str
    confidence: float
    bounding_box: List[float] = Field(..., min_items=4, max_items=4)  # [x, y, width, height]


class StepRecognitionResult(BaseModel):
    step_name: str
    confidence: float
    start_time: float
    end_time: float
    instruments_used: List[str]


class SkillAssessmentResult(BaseModel):
    metric_name: str
    score: float
    feedback: str
    details: Dict[str, Any]


class ComplicationDetectionResult(BaseModel):
    complication_type: str
    confidence: float
    timestamp: float
    severity: str
    description: str


class AnalysisRequest(BaseModel):
    video_id: int
    analysis_types: List[AnalysisType]
