from pydantic import BaseModel


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
    owner_email: str