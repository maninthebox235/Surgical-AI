import enum
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel

if TYPE_CHECKING:
    from .comment import Comment
    from .user import User
    from .video import Video


class AnnotationType(str, enum.Enum):
    STEP = "step"
    MILESTONE = "milestone"
    FEEDBACK = "feedback"
    COMMENT = "comment"
    QUESTION = "question"


class Annotation(BaseModel):
    __tablename__ = "annotations"

    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    timestamp: Mapped[float] = mapped_column(Float, nullable=False)
    annotation_type: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    annotation_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    video: Mapped["Video"] = relationship("Video", back_populates="annotations")
    user: Mapped["User"] = relationship("User", back_populates="annotations")
    comments: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="annotation", cascade="all, delete-orphan"
    )
