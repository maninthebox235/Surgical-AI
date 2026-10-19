from typing import Any, List
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, Video, VideoStatus
from app.utils.s3 import upload_to_s3
from app.routes.auth import get_current_user

router = APIRouter()


@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    content_type = file.content_type or ""
    if not content_type.startswith("video/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be a video")

    try:
        # Upload to S3
        file_path = await upload_to_s3(file, int(current_user.id))

        # Create video record
        video = Video(
            title=file.filename,
            file_path=file_path,
            user_id=current_user.id,
            status=VideoStatus.PENDING,
        )
        db.add(video)
        db.commit()
        db.refresh(video)

        return {"id": video.id, "title": video.title, "status": video.status}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/videos")
async def list_videos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    videos = db.query(Video).filter(Video.user_id == current_user.id).all()
    return [
        {
            "id": video.id,
            "title": video.title,
            "status": video.status,
            "progress": video.progress,
            "created_at": video.created_at,
        }
        for video in videos
    ]


@router.get("/videos/{video_id}")
async def get_video(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == current_user.id).first()

    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")

    return {
        "id": video.id,
        "title": video.title,
        "status": video.status,
        "progress": video.progress,
        "created_at": video.created_at,
        "analysis": video.analysis.feedback if video.analysis else None,
    }
