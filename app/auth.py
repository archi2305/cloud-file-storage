from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db

# Use a stable built-in Passlib scheme to avoid bcrypt backend issues.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
router = APIRouter()

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


@router.post("/signup", response_model=schemas.MessageResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with a unique email and hashed password.
    """
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    new_user = models.User(email=user.email, password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}


@router.post("/login", response_model=schemas.MessageResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Validate user credentials (simple login, no JWT for now).
    """
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {"message": "Login successful"}