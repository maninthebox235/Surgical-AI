from typing import Any, Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .core.config import settings
from .models.base import Base

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

__all__ = ["Base", "SessionLocal", "engine", "get_db"]


def get_db() -> Generator[Any, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
