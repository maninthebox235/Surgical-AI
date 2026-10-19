from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.annotation import Annotation
from ..models.user import User
from ..schemas.annotation import AnnotationBase, AnnotationFilter


def create_annotation(
    db: Session, annotation_data: AnnotationBase, video_id: int, user_id: int
) -> Annotation:
    """
    Create a new annotation.
    """
    annotation = Annotation(
        video_id=video_id,
        user_id=user_id,
        timestamp=annotation_data.timestamp,
        annotation_type=annotation_data.annotation_type,
        content=annotation_data.content,
        metadata=annotation_data.metadata,
    )
    db.add(annotation)
    db.commit()
    db.refresh(annotation)
    return annotation


def get_annotations(db: Session, filter_params: AnnotationFilter) -> List[Annotation]:
    """
    Get annotations based on filter parameters.
    """
    query = db.query(Annotation)

    if filter_params.video_id is not None:
        query = query.filter(Annotation.video_id == filter_params.video_id)

    if filter_params.user_id is not None:
        query = query.filter(Annotation.user_id == filter_params.user_id)

    if filter_params.annotation_type is not None:
        query = query.filter(Annotation.annotation_type == filter_params.annotation_type)

    if filter_params.start_time is not None:
        query = query.filter(Annotation.timestamp >= filter_params.start_time)

    if filter_params.end_time is not None:
        query = query.filter(Annotation.timestamp <= filter_params.end_time)

    return query.order_by(Annotation.timestamp).all()


def update_annotation(
    db: Session, annotation_id: int, update_data: Dict[str, Any]
) -> Optional[Annotation]:
    """
    Update an existing annotation.
    """
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        return None

    for field, value in update_data.items():
        if value is not None:
            setattr(annotation, field, value)

    annotation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(annotation)
    return annotation


def delete_annotation(db: Session, annotation_id: int) -> bool:
    """
    Delete an annotation.
    """
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        return False

    db.delete(annotation)
    db.commit()
    return True


def get_annotation_with_user(db: Session, annotation_id: int) -> Optional[Dict[str, Any]]:
    """
    Get an annotation with user information.
    """
    result = (
        db.query(Annotation, User.full_name)
        .join(User, Annotation.user_id == User.id)
        .filter(Annotation.id == annotation_id)
        .first()
    )

    if not result:
        return None

    annotation, user_name = result
    return {**annotation.__dict__, "user_name": user_name}


def bulk_create_annotations(
    db: Session, annotations: List[AnnotationBase], video_id: int, user_id: int
) -> List[Annotation]:
    """
    Create multiple annotations in bulk.
    """
    new_annotations = [
        Annotation(
            video_id=video_id,
            user_id=user_id,
            timestamp=ann.timestamp,
            annotation_type=ann.annotation_type,
            content=ann.content,
            metadata=ann.metadata,
        )
        for ann in annotations
    ]

    db.bulk_save_objects(new_annotations)
    db.commit()

    # Refresh all annotations to get their IDs
    for annotation in new_annotations:
        db.refresh(annotation)

    return new_annotations
