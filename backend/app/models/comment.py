from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import BaseModel

if TYPE_CHECKING:
    from .annotation import Annotation
    from .user import User


class Comment(BaseModel):
    __tablename__ = "comments"

    annotation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("annotations.id"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    annotation: Mapped["Annotation"] = relationship("Annotation", back_populates="comments")
    user: Mapped["User"] = relationship("User")
