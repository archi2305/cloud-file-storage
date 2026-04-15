from pydantic import BaseModel
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


class MessageResponse(BaseModel):
    message: str


class FileItem(BaseModel):
    filename: str
    owner: str
    upload_time: datetime


class UploadUrlResponse(BaseModel):
    upload_url: str
    file_key: str


class SaveFileRequest(BaseModel):
    filename: str
    file_key: str
    email: str