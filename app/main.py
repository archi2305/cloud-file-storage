from fastapi import FastAPI

from . import auth, config, file_routes, models
from .database import engine

# Create database tables on startup.
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth.router)
app.include_router(file_routes.router)