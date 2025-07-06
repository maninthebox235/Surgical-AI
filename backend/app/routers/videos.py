from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Any
import os
import tempfile
import requests
from ..core.deps import get_current_active_user
from ..database import get_db
from ..models.user import User
from ..models.video import Video, VideoStatus
from ..schemas.video import VideoCreate, VideoResponse, VideoUpdate, VideoUploadResponse
from ..utils.video_processor import (
    generate_thumbnail,
    get_video_duration,
    generate_presigned_url,
    get_video_url
)

router = APIRouter()

@router.post("/", response_model=VideoUploadResponse)
def create_video(
    *,
    db: Session = Depends(get_db),
    video_in: VideoCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a new video entry and get a presigned URL for upload.
    """
    video = Video(
        title=video_in.title,
        description=video_in.description,
        uploaded_by_id=current_user.id,
        status=VideoStatus.UPLOADING
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    
    # Generate presigned URL for video upload
    presigned_url, object_key = generate_presigned_url(video.id, ".mp4")
    
    # Update video with file path
    video.file_path = object_key
    db.commit()
    
    return {
        "upload_url": presigned_url,
        "video_id": video.id
    }

@router.post("/{video_id}/process")
def process_video(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Start video processing (generate thumbnail, get duration, etc.).
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if video.status != VideoStatus.UPLOADING:
        raise HTTPException(status_code=400, detail="Video is not in uploading state")
    
    # Update status to processing
    video.status = VideoStatus.PROCESSING
    db.commit()
    
    # Start background processing
    background_tasks.add_task(process_video_background, video_id, db)
    
    return {"message": "Video processing started"}

@router.get("/", response_model=List[VideoResponse])
def list_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all videos for the current user.
    """
    videos = db.query(Video).filter(
        Video.uploaded_by_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return [
        VideoResponse(
            **video.__dict__,
            video_url=get_video_url(video.file_path) if video.file_path else None,
            thumbnail_url=get_video_url(video.thumbnail_path) if video.thumbnail_path else None
        )
        for video in videos
    ]

@router.get("/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get a specific video by ID.
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return VideoResponse(
        **video.__dict__,
        video_url=get_video_url(video.file_path) if video.file_path else None,
        thumbnail_url=get_video_url(video.thumbnail_path) if video.thumbnail_path else None
    )

@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a video.
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(video)
    db.commit()
    
    return {"message": "Video deleted successfully"}

@router.post("/{video_id}/share")
def share_video(
    video_id: int,
    share_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Share a video.
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # TODO: Implement actual sharing logic (email, link generation, etc.)
    return {"message": "Video shared successfully", "share_link": f"/videos/{video_id}/shared"}

@router.get("/{video_id}/export")
def export_video_report(
    video_id: int,
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Export video analysis report.
    """
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # TODO: Implement actual PDF generation
    from fastapi.responses import Response
    
    # Mock PDF content for now
    pdf_content = b"Mock PDF report content"
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=video_{video_id}_report.pdf"}
    )

def process_video_background(video_id: int, db: Session) -> None:
    """
    Background task to process the video.
    """
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            return
        
        # Download video to temporary file
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_video:
            response = requests.get(get_video_url(video.file_path))
            temp_video.write(response.content)
            temp_video_path = temp_video.name
        
        # Generate thumbnail
        thumbnail_path = f"thumbnails/{video_id}.jpg"
        if generate_thumbnail(temp_video_path, thumbnail_path):
            video.thumbnail_path = thumbnail_path
        
        # Get video duration
        duration = get_video_duration(temp_video_path)
        if duration:
            video.duration = duration
        
        # Update video status
        video.status = VideoStatus.READY
        db.commit()
        
        # Clean up temporary file
        os.unlink(temp_video_path)
        
    except Exception as e:
        print(f"Error processing video {video_id}: {e}")
        video.status = VideoStatus.FAILED
        db.commit() 