from typing import cast

import boto3
from fastapi import UploadFile
import os
from datetime import datetime
import uuid

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1"),
)

BUCKET_NAME = os.getenv("AWS_S3_BUCKET")


async def upload_to_s3(file: UploadFile, user_id: int) -> str:
    """
    Upload a video file to S3 and return the file path
    """
    if not BUCKET_NAME:
        raise ValueError("AWS_S3_BUCKET environment variable is not set")

    # Generate a unique file name
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = file.filename or ""
    file_extension = os.path.splitext(filename)[1]
    s3_key = f"videos/{user_id}/{timestamp}_{unique_id}{file_extension}"

    # Upload file to S3
    try:
        contents = await file.read()
        s3_client.put_object(
            Bucket=BUCKET_NAME, Key=s3_key, Body=contents, ContentType=file.content_type
        )
        return s3_key
    except Exception as e:
        raise Exception(f"Failed to upload file to S3: {str(e)}")


def get_presigned_url(s3_key: str, expiration: int = 3600) -> str:
    """
    Generate a presigned URL for accessing the video
    """
    try:
        url = s3_client.generate_presigned_url(
            "get_object", Params={"Bucket": BUCKET_NAME, "Key": s3_key}, ExpiresIn=expiration
        )
        return cast(str, url)
    except Exception as e:
        raise Exception(f"Failed to generate presigned URL: {str(e)}")
