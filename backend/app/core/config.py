from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "Surgical Education Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./surgical_education.db")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Auth0 (access-token / API authorization)
    # AUTH0_DOMAIN: tenant host only, e.g. your-tenant.auth0.com (no scheme)
    # AUTH0_AUDIENCE: API identifier configured in Auth0
    AUTH0_DOMAIN: Optional[str] = os.getenv("AUTH0_DOMAIN")
    AUTH0_AUDIENCE: Optional[str] = os.getenv("AUTH0_AUDIENCE")
    AUTH0_JWKS_CACHE_TTL_SECONDS: int = int(os.getenv("AUTH0_JWKS_CACHE_TTL_SECONDS", "3600"))
    # Cooldown between JWKS refreshes triggered by an unknown kid (seconds)
    AUTH0_JWKS_UNKNOWN_KID_COOLDOWN_SECONDS: int = int(
        os.getenv("AUTH0_JWKS_UNKNOWN_KID_COOLDOWN_SECONDS", "60")
    )

    # AWS
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "surgical-education-videos")

    # AI Model
    AI_MODEL_ENDPOINT: Optional[str] = os.getenv("AI_MODEL_ENDPOINT")

    class Config:
        case_sensitive = True


settings = Settings()
