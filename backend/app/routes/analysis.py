from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Video, Analysis, VideoStatus
from app.utils.s3 import get_presigned_url
from app.utils.analysis import analyze_video
from typing import Optional

router = APIRouter()

@router.post("/videos/{video_id}/analyze")
async def start_analysis(
    video_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    if video.status != VideoStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video is already being analyzed or has been analyzed"
        )
    
    # Get presigned URL for the video
    video_url = get_presigned_url(video.file_path)
    
    # Update video status
    video.status = VideoStatus.PROCESSING
    db.commit()
    
    # Start analysis in background
    background_tasks.add_task(
        analyze_video,
        video_id=video.id,
        video_url=video_url,
        db=db
    )
    
    return {
        "message": "Analysis started",
        "video_id": video.id,
        "status": video.status
    }

@router.get("/videos/{video_id}/analysis")
async def get_analysis(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(
        Video.id == video_id,
        Video.user_id == current_user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    if not video.analysis:
        return {
            "status": video.status,
            "progress": video.progress,
            "feedback": None
        }
    
    return {
        "status": video.status,
        "progress": video.progress,
        "feedback": video.analysis.feedback
    } 