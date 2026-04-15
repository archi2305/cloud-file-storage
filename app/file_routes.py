from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, RedirectResponse
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
    # Reject duplicate file names for the same owner only.
    duplicate = (
        db.query(models.FileRecord)
        .filter(
            models.FileRecord.filename == file.filename,
            models.FileRecord.owner == email,
        )
        .first()
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="A file with this name already exists")

    try:
        stored_filename = save_file(file)
    except StorageError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    new_file = models.FileRecord(
        filename=file.filename,
        owner=email,
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
    files = db.query(models.FileRecord).filter(models.FileRecord.owner == email).all()
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
        file_reference = get_file(file_record.stored_filename)
    except StorageNotFoundError:
        raise HTTPException(status_code=404, detail="File is missing in storage")
    except StorageError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    # S3 mode returns URL; local mode returns a file path.
    if file_reference.startswith("http://") or file_reference.startswith("https://"):
        return RedirectResponse(url=file_reference)
    return FileResponse(path=file_reference, filename=file_record.filename)
