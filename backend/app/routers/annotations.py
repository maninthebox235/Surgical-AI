from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from ..core.deps import get_current_active_user
from ..database import get_db
from ..models.user import User
from ..models.video import Video
from ..models.annotation import Annotation
from ..schemas.annotation import (
    AnnotationCreate,
    AnnotationUpdate,
    AnnotationResponse,
    AnnotationFilter,
    AnnotationBulkCreate,
    AnnotationBulkUpdate,
)
from ..utils.annotation_processor import (
    create_annotation,
    get_annotations,
    update_annotation,
    delete_annotation,
    get_annotation_with_user,
    bulk_create_annotations,
)

router = APIRouter()


@router.post("/", response_model=AnnotationResponse)
def create_new_annotation(
    *,
    db: Session = Depends(get_db),
    annotation_in: AnnotationCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a new annotation.
    """
    # Verify video exists and user has access
    video = db.query(Video).filter(Video.id == annotation_in.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Create annotation
    annotation = create_annotation(
        db=db,
        annotation_data=annotation_in,
        video_id=annotation_in.video_id,
        user_id=current_user.id,
    )

    # Get annotation with user info
    return get_annotation_with_user(db, annotation.id)


@router.post("/bulk", response_model=List[AnnotationResponse])
def create_bulk_annotations(
    *,
    db: Session = Depends(get_db),
    bulk_create: AnnotationBulkCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create multiple annotations in bulk.
    """
    # Verify video exists and user has access
    video = db.query(Video).filter(Video.id == bulk_create.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if video.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Create annotations
    annotations = bulk_create_annotations(
        db=db,
        annotations=bulk_create.annotations,
        video_id=bulk_create.video_id,
        user_id=current_user.id,
    )

    # Get annotations with user info
    return [get_annotation_with_user(db, ann.id) for ann in annotations]


@router.get("/", response_model=List[AnnotationResponse])
def list_annotations(
    *,
    db: Session = Depends(get_db),
    filter_params: AnnotationFilter = Depends(),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    List annotations based on filter parameters.
    """
    # If video_id is provided, verify access
    if filter_params.video_id:
        video = db.query(Video).filter(Video.id == filter_params.video_id).first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")

        if video.uploaded_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")

    # Get annotations
    annotations = get_annotations(db, filter_params)

    # Get annotations with user info
    return [get_annotation_with_user(db, ann.id) for ann in annotations]


@router.get("/{annotation_id}", response_model=AnnotationResponse)
def get_annotation(
    annotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get a specific annotation.
    """
    annotation = get_annotation_with_user(db, annotation_id)
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")

    # Verify video access
    video = db.query(Video).filter(Video.id == annotation["video_id"]).first()
    if video.uploaded_by_id != current_user.id:  # type: ignore[union-attr]
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return annotation


@router.put("/{annotation_id}", response_model=AnnotationResponse)
def update_existing_annotation(
    *,
    db: Session = Depends(get_db),
    annotation_id: int,
    annotation_in: AnnotationUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update an existing annotation.
    """
    # Get current annotation
    current_annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not current_annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")

    # Verify video access
    video = db.query(Video).filter(Video.id == current_annotation.video_id).first()
    if video.uploaded_by_id != current_user.id:  # type: ignore[union-attr]
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Update annotation
    annotation = update_annotation(
        db=db, annotation_id=annotation_id, update_data=annotation_in.dict(exclude_unset=True)
    )

    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")

    return get_annotation_with_user(db, annotation.id)


@router.delete("/{annotation_id}", response_model=AnnotationResponse)
def delete_existing_annotation(
    *,
    db: Session = Depends(get_db),
    annotation_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete an existing annotation.
    """
    # Get current annotation
    current_annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not current_annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")

    # Verify video access
    video = db.query(Video).filter(Video.id == current_annotation.video_id).first()
    if video.uploaded_by_id != current_user.id:  # type: ignore[union-attr]
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Get annotation with user info before deleting
    annotation_with_user = get_annotation_with_user(db, annotation_id)

    # Delete annotation
    if not delete_annotation(db, annotation_id):
        raise HTTPException(status_code=404, detail="Annotation not found")

    return annotation_with_user
