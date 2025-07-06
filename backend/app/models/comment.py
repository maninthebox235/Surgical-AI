from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from .base import BaseModel

class Comment(BaseModel):
    __tablename__ = "comments"

    annotation_id = Column(Integer, ForeignKey("annotations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    annotation = relationship("Annotation", back_populates="comments")
    user = relationship("User") 