import os
from datetime import datetime
from typing import Optional, Tuple

import boto3
import cv2
import numpy as np
from PIL import Image

from ..core.config import settings

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


def generate_thumbnail(
    video_path: str, output_path: str, size: Tuple[int, int] = (320, 180)
) -> bool:
    """
    Generate a thumbnail from the first frame of the video using Pillow resize.
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return False

        ret, frame = cap.read()
        cap.release()
        if not ret:
            return False

        # OpenCV is BGR; convert for Pillow and resize on the app thumbnail path.
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(np.asarray(rgb_frame))
        image = image.resize(size, Image.Resampling.LANCZOS)

        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        image.save(output_path, format="JPEG")
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
        duration_seconds = frame_count / fps if fps else 0

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
        ExpiresIn=3600,
    )

    return presigned_url, object_key


def get_video_url(object_key: str) -> str:
    """
    Generate a URL for video access from S3.
    """
    return f"https://{settings.S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{object_key}"
