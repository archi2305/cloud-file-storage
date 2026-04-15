import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

# Required environment variables:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_REGION
# - S3_BUCKET_NAME
import os


class StorageError(Exception):
    """
    Generic storage layer error (for upload or URL generation failures).
    """


class StorageNotFoundError(StorageError):
    """
    Raised when the requested object does not exist in S3.
    """


def _get_s3_config() -> tuple[str, str]:
    """
    Read and validate required AWS/S3 environment variables.
    """
    region = os.getenv("AWS_REGION")
    bucket = os.getenv("S3_BUCKET_NAME")

    if not region or not bucket:
        raise StorageError("Missing AWS_REGION or S3_BUCKET_NAME environment variable")

    return region, bucket


def _get_s3_client():
    """
    Create an S3 client using environment-based AWS credentials.
    boto3 automatically reads AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.
    """
    region, _ = _get_s3_config()
    return boto3.client("s3", region_name=region)


def save_file(file: UploadFile) -> str:
    """
    Upload a file to S3 with a unique object key and return that key.
    """
    _, bucket = _get_s3_config()
    s3_client = _get_s3_client()

    # Keep original extension and add UUID prefix to avoid object key collisions.
    extension = os.path.splitext(file.filename)[1]
    unique_key = f"{uuid.uuid4().hex}{extension}"

    try:
        file.file.seek(0)
        s3_client.upload_fileobj(file.file, bucket, unique_key)
    except (ClientError, BotoCoreError) as exc:
        raise StorageError("Failed to upload file to S3") from exc

    return unique_key


def get_file(filename: str) -> str:
    """
    Return a short-lived pre-signed download URL for an S3 object.
    """
    _, bucket = _get_s3_config()
    s3_client = _get_s3_client()

    try:
        # First verify the object exists so we can return a clear 404.
        s3_client.head_object(Bucket=bucket, Key=filename)
        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": filename},
            ExpiresIn=3600,
        )
        return presigned_url
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code")
        if error_code in {"404", "NoSuchKey", "NotFound"}:
            raise StorageNotFoundError("Requested file does not exist in S3") from exc
        raise StorageError("Failed to generate S3 download URL") from exc
    except BotoCoreError as exc:
        raise StorageError("Failed to generate S3 download URL") from exc
