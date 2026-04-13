import os
import shutil
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db

router = APIRouter()
UPLOAD_FOLDER = "uploads"


@router.post("/upload", response_model=schemas.MessageResponse)
def upload_file(
    email: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a file for a specific user email and store metadata in SQLite.
    """
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Prefix user id to reduce filename collisions across users.
    safe_filename = f"{user.id}_{file.filename}"
    destination_path = os.path.join(UPLOAD_FOLDER, safe_filename)

    with open(destination_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_file = models.StoredFile(
        filename=file.filename,
        file_path=destination_path,
        owner_id=user.id,
    )
    db.add(new_file)
    db.commit()

    return {"message": "File uploaded successfully"}


@router.get("/files", response_model=List[schemas.FileItem])
def list_files(email: str, db: Session = Depends(get_db)):
    """
    List all files uploaded by a user email.
    """
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    files = db.query(models.StoredFile).filter(models.StoredFile.owner_id == user.id).all()
    return [{"filename": item.filename, "owner_email": user.email} for item in files]


@router.get("/download/{filename}")
def download_file(filename: str, db: Session = Depends(get_db)):
    """
    Download a file by its original filename.
    """
    file_record = db.query(models.StoredFile).filter(models.StoredFile.filename == filename).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File metadata not found")

    if not os.path.exists(file_record.file_path):
        raise HTTPException(status_code=404, detail="File is missing on disk")

    return FileResponse(path=file_record.file_path, filename=file_record.filename)
