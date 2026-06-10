"""start.py — run from project root:  python -m backend.start"""
import os
import uvicorn
from dotenv import load_dotenv

# Load .env so TOMTOM_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY are available
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

# Map VITE_ prefixed keys to plain names the backend uses
if not os.getenv("SUPABASE_URL"):
    os.environ["SUPABASE_URL"]     = os.getenv("VITE_SUPABASE_URL", "")
if not os.getenv("SUPABASE_ANON_KEY"):
    os.environ["SUPABASE_ANON_KEY"] = os.getenv("VITE_SUPABASE_ANON_KEY", "")
if not os.getenv("TOMTOM_API_KEY"):
    os.environ["TOMTOM_API_KEY"]   = os.getenv("VITE_TOMTOM_API_KEY", "")

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
