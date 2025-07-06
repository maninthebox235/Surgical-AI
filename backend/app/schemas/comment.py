from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    annotation_id: int
    user_id: int
    content: str
    created_at: datetime
    user: Optional[dict]  # Can be replaced with a User schema if needed

    class Config:
        orm_mode = True 