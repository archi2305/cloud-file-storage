import os
import uuid

from fastapi import UploadFile

UPLOAD_FOLDER = "uploads"


def save_file(file: UploadFile) -> str:
    """
    Save an uploaded file to local disk with a unique name.

    This function is intentionally isolated so it can be replaced later
    with a cloud storage implementation (for example AWS S3).
    """
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Keep original extension and add UUID prefix to avoid overwriting files.
    extension = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{extension}"
    destination_path = os.path.join(UPLOAD_FOLDER, unique_name)

    with open(destination_path, "wb") as buffer:
        buffer.write(file.file.read())

    return unique_name


def get_file(filename: str) -> str | None:
    """
    Return full file path if file exists, otherwise None.
    """
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return None
    return file_path
