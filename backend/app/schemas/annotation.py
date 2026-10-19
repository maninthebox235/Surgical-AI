from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

from ..models.annotation import AnnotationType


class AnnotationBase(BaseModel):
    timestamp: float = Field(..., description="Time in seconds from video start")
    annotation_type: str = Field(
        ..., description="Type of annotation (e.g., step, milestone, feedback)"
    )
    content: str = Field(..., description="Annotation content")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional structured data")


class AnnotationCreate(AnnotationBase):
    video_id: int


class AnnotationUpdate(BaseModel):
    timestamp: Optional[float] = None
    annotation_type: Optional[str] = None
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class AnnotationInDB(AnnotationBase):
    id: int
    video_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnnotationResponse(AnnotationInDB):
    user_name: str


class AnnotationFilter(BaseModel):
    video_id: Optional[int] = None
    user_id: Optional[int] = None
    annotation_type: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None


class AnnotationBulkCreate(BaseModel):
    video_id: int
    annotations: List[AnnotationBase]


class AnnotationBulkUpdate(BaseModel):
    annotations: List[AnnotationUpdate]
