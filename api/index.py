"""Vercel entrypoint for the existing AirVeda FastAPI application."""

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1] / "app" / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.main import app  # noqa: E402
