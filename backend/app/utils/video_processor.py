import cv2
import os
from typing import Tuple, Optional
import boto3
from ..core.config import settings
from datetime import datetime

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


def generate_thumbnail(video_path: str, output_path: str) -> bool:
    """
    Generate a thumbnail from the first frame of the video.
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return False

        ret, frame = cap.read()
        if not ret:
            return False

        cv2.imwrite(output_path, frame)
        cap.release()
        return True
    except Exception as e:
        print(f"Error generating thumbnail: {e}")
        return False


def get_video_duration(video_path: str) -> Optional[str]:
    """
    Get the duration of the video in ISO 8601 format.
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_seconds = frame_count / fps

        hours = int(duration_seconds // 3600)
        minutes = int((duration_seconds % 3600) // 60)
        seconds = int(duration_seconds % 60)

        duration_str = f"PT{hours}H{minutes}M{seconds}S"
        cap.release()
        return duration_str
    except Exception as e:
        print(f"Error getting video duration: {e}")
        return None


def generate_presigned_url(video_id: int, file_extension: str) -> Tuple[str, str]:
    """
    Generate a presigned URL for video upload to S3.
    """
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    object_key = f"videos/{video_id}/{timestamp}{file_extension}"

    presigned_url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.S3_BUCKET,
            "Key": object_key,
            "ContentType": f"video/{file_extension[1:]}",
        },
        ExpiresIn=3600,  # URL expires in 1 hour
    )

    return presigned_url, object_key


def get_video_url(object_key: str) -> str:
    """
    Generate a URL for video access from S3.
    """
    return f"https://{settings.S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{object_key}"
