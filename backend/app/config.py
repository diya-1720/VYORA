import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env if it exists
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH)

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
PORT = int(os.getenv("PORT", "8000"))

# Service availability flags
TMDB_ENABLED = bool(TMDB_API_KEY)
GEMINI_ENABLED = bool(GEMINI_API_KEY)
