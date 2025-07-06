from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl
from ..models.video import VideoStatus

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None

class VideoCreate(VideoBase):
    pass

class VideoUpdate(VideoBase):
    status: Optional[VideoStatus] = None

class VideoInDB(VideoBase):
    id: int
    file_path: str
    thumbnail_path: Optional[str]
    duration: Optional[str]
    status: VideoStatus
    uploaded_by_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class VideoResponse(VideoInDB):
    thumbnail_url: Optional[HttpUrl] = None
    video_url: Optional[HttpUrl] = None

class VideoUploadResponse(BaseModel):
    upload_url: HttpUrl
    video_id: int 