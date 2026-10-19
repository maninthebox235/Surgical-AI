"""Compatibility re-exports. Canonical models live in user/video/analysis modules."""

from app.models.analysis import Analysis, AnalysisResult, AnalysisType
from app.models.user import User, UserRole
from app.models.video import Video, VideoStatus

__all__ = [
    "Analysis",
    "AnalysisResult",
    "AnalysisType",
    "User",
    "UserRole",
    "Video",
    "VideoStatus",
]
