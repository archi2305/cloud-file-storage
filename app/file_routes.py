from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db
from .storage import StorageError, StorageNotFoundError, get_file, save_file

router = APIRouter()


@router.post("/upload", response_model=schemas.MessageResponse)
def upload_file(
    email: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a file and store metadata in the database.
    """
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Keep API behavior simple: reject duplicate original file names.
    duplicate = db.query(models.FileRecord).filter(models.FileRecord.filename == file.filename).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="A file with this name already exists")

    try:
        stored_filename = save_file(file)
    except StorageError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    new_file = models.FileRecord(
        filename=file.filename,
        owner=user.email,
        stored_filename=stored_filename,
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

    files = db.query(models.FileRecord).filter(models.FileRecord.owner == user.email).all()
    return [{"filename": item.filename, "owner": item.owner, "upload_time": item.upload_time} for item in files]


@router.get("/download/{filename}")
def download_file(filename: str, db: Session = Depends(get_db)):
    """
    Download a file by its original filename.
    """
    file_record = db.query(models.FileRecord).filter(models.FileRecord.filename == filename).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File metadata not found")

    try:
        download_url = get_file(file_record.stored_filename)
    except StorageNotFoundError:
        raise HTTPException(status_code=404, detail="File is missing in S3")
    except StorageError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    # Redirect the client to a temporary signed S3 URL for downloading.
    return RedirectResponse(url=download_url)
