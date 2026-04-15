from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, schemas
from .database import get_db

# Use bcrypt for new passwords, but still accept legacy pbkdf2 hashes.
# This allows old users to log in and get migrated transparently.
pwd_context = CryptContext(
    schemes=["bcrypt", "pbkdf2_sha256"],
    deprecated="auto",
)
router = APIRouter()


def normalize_email(email: str) -> str:
    """
    Normalize emails so signup/login behave consistently.
    """
    return email.strip().lower()


def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


@router.post("/signup", response_model=schemas.MessageResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with a unique email and hashed password.
    """
    normalized_email = normalize_email(user.email)

    existing_user = (
        db.query(models.User)
        .filter(func.lower(func.trim(models.User.email)) == normalized_email)
        .first()
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = models.User(email=normalized_email, password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}


@router.post("/login", response_model=schemas.MessageResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Validate user credentials (simple login, no JWT for now).
    """
    normalized_email = normalize_email(user.email)
    db_user = (
        db.query(models.User)
        .filter(func.lower(func.trim(models.User.email)) == normalized_email)
        .first()
    )
    if not db_user:
        print(f"[AUTH DEBUG] User not found: {normalized_email}")
        raise HTTPException(status_code=404, detail="User not found")

    try:
        is_valid_password = verify_password(user.password, db_user.password)
    except (ValueError, UnknownHashError):
        raise HTTPException(
            status_code=400,
            detail="Please re-register, password data corrupted",
        )

    if not is_valid_password:
        print(f"[AUTH DEBUG] Password mismatch for: {normalized_email}")
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Auto-upgrade legacy hashes (e.g., pbkdf2) to bcrypt after successful login.
    if pwd_context.needs_update(db_user.password):
        db_user.password = hash_password(user.password)
        db.commit()

    # Keep old records consistent after successful login.
    if db_user.email != normalized_email:
        db_user.email = normalized_email
        db.commit()

    return {"message": "Login successful"}