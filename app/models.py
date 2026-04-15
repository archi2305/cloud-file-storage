from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String)


class FileRecord(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)
    owner = Column(String, index=True, nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    stored_filename = Column(String, nullable=False)