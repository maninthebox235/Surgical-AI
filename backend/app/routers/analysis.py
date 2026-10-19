from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Any
from ..core.deps import get_current_active_user
from ..database import get_db
from ..models.user import User
from ..models.video import Video, VideoStatus
from ..models.analysis import AnalysisResult, AnalysisType
from ..schemas.analysis import (
    AnalysisRequest,
    AnalysisResultCreate,
    AnalysisResultInDB,
    AnalysisResultUpdate,
)
from ..utils.ai_analyzer import ai_analyzer
from ..utils.video_processor import get_video_url

router = APIRouter()


@router.post("/analyze", response_model=List[AnalysisResultInDB])
def analyze_video(
    *,
    db: Session = Depends(get_db),
    analysis_request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Start AI analysis of a video.
    """
    # Verify video exists and user has access
    video = db.query(Video).filter(Video.id == analysis_request.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if video.status != VideoStatus.READY:
        raise HTTPException(status_code=400, detail="Video must be in READY state for analysis")

    # Start background analysis
    background_tasks.add_task(
        process_analysis_background, analysis_request.video_id, analysis_request.analysis_types, db
    )

    # Return existing analysis results if any
    existing_results = (
        db.query(AnalysisResult)
        .filter(
            AnalysisResult.video_id == analysis_request.video_id,
            AnalysisResult.analysis_type.in_(analysis_request.analysis_types),
        )
        .all()
    )

    return existing_results


@router.get("/video/{video_id}", response_model=List[AnalysisResultInDB])
def get_video_analysis(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get all analysis results for a video.
    """
    # Verify video exists and user has access
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Get all analysis results
    results = db.query(AnalysisResult).filter(AnalysisResult.video_id == video_id).all()

    return results


@router.get("/video/{video_id}/type/{analysis_type}", response_model=AnalysisResultInDB)
def get_video_analysis_by_type(
    video_id: int,
    analysis_type: AnalysisType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get specific type of analysis results for a video.
    """
    # Verify video exists and user has access
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Get analysis result
    result = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.video_id == video_id, AnalysisResult.analysis_type == analysis_type)
        .first()
    )

    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found")

    return result


def process_analysis_background(
    video_id: int, analysis_types: List[AnalysisType], db: Session
) -> None:
    """
    Background task to process video analysis.
    """
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            return

        # Get video URL
        video_url = get_video_url(video.file_path)  # type: ignore[arg-type]

        # Run AI analysis
        analysis_results = ai_analyzer.analyze_video(video_url, analysis_types)

        # Save results to database
        for analysis_type, result in analysis_results.items():
            # Check if analysis result already exists
            existing_result = (
                db.query(AnalysisResult)
                .filter(
                    AnalysisResult.video_id == video_id,
                    AnalysisResult.analysis_type == analysis_type,
                )
                .first()
            )

            if existing_result:
                # Update existing result
                existing_result.confidence_score = result.get("confidence_score")  # type: ignore[assignment]
                existing_result.results = result  # type: ignore[assignment]
            else:
                # Create new result
                new_result = AnalysisResult(
                    video_id=video_id,
                    analysis_type=analysis_type,
                    start_time=0.0,  # TODO: Get actual start time
                    end_time=0.0,  # TODO: Get actual end time
                    confidence_score=result.get("confidence_score"),
                    results=result,
                )
                db.add(new_result)

        db.commit()

    except Exception as e:
        print(f"Error processing analysis for video {video_id}: {e}")
        db.rollback()
