import os
from pathlib import Path

from dotenv import dotenv_values, load_dotenv

# Load environment variables from project-root .env file.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)
DOTENV_VALUES = dotenv_values(ENV_PATH)

# Expose required AWS/S3 configuration values.
AWS_ACCESS_KEY_ID = DOTENV_VALUES.get("AWS_ACCESS_KEY_ID") or os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = DOTENV_VALUES.get("AWS_SECRET_ACCESS_KEY") or os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = DOTENV_VALUES.get("AWS_REGION") or os.getenv("AWS_REGION")
S3_BUCKET_NAME = DOTENV_VALUES.get("S3_BUCKET_NAME") or os.getenv("S3_BUCKET_NAME")

# Startup debug logs.
print("AWS_ACCESS_KEY_ID:", AWS_ACCESS_KEY_ID)
print("AWS_REGION:", AWS_REGION)
print("S3_BUCKET_NAME:", S3_BUCKET_NAME)


def _is_placeholder(value: str | None) -> bool:
    """
    Detect template values that indicate .env is not configured.
    """
    if not value:
        return True

    placeholders = {
        "your_access_key",
        "your_access_key_id",
        "your_secret_access_key",
        "your_bucket_name",
        "your_region",
    }
    return value.strip().lower() in placeholders


if any(
    [
        _is_placeholder(AWS_ACCESS_KEY_ID),
        _is_placeholder(AWS_SECRET_ACCESS_KEY),
        _is_placeholder(AWS_REGION),
        _is_placeholder(S3_BUCKET_NAME),
    ]
):
    raise ValueError("AWS environment variables not configured properly")
