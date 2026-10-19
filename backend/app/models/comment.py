from typing import Any
from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from .base import BaseModel


class Comment(BaseModel):
    __allow_unmapped__ = True
    __tablename__ = "comments"

    annotation_id = Column(Integer, ForeignKey("annotations.id"), nullable=False)
    user_id: Any = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)

    annotation = relationship("Annotation", back_populates="comments")
    user = relationship("User")
