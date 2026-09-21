"""
TMDB (The Movie Database) Integration Adapter for VYORA
Fetches real high-res posters, backdrops, and live metadata.
Gracefully operates in offline/mock mode if no TMDB_API_KEY is configured.
"""

from typing import Any, Dict, Optional
import httpx
from app.config import TMDB_API_KEY, TMDB_ENABLED

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"

# In-memory cache to avoid repeated API requests
_CACHE: Dict[str, Dict[str, Any]] = {}


def is_tmdb_configured() -> bool:
    """Check if a valid TMDB API key is active."""
    return TMDB_ENABLED and bool(TMDB_API_KEY)


def fetch_tmdb_details(title: str, year: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """
    Search TMDB for a movie by title and optional year.
    Returns TMDB movie details including poster_url, backdrop_url, overview, and tmdb_id.
    """
    if not is_tmdb_configured():
        return None

    cache_key = f"{title.lower()}_{year}"
    if cache_key in _CACHE:
        return _CACHE[cache_key]

    try:
        params = {
            "api_key": TMDB_API_KEY,
            "query": title,
            "include_adult": False,
        }
        if year:
            params["year"] = year

        response = httpx.get(
            f"{TMDB_BASE_URL}/search/movie",
            params=params,
            timeout=4.0
        )

        if response.status_code != 200:
            return None

        data = response.json()
        results = data.get("results", [])
        if not results:
            return None

        top = results[0]
        poster_path = top.get("poster_path")
        backdrop_path = top.get("backdrop_path")

        result = {
            "tmdb_id": top.get("id"),
            "poster": f"{TMDB_IMAGE_BASE}/w780{poster_path}" if poster_path else None,
            "backdrop": f"{TMDB_IMAGE_BASE}/w1280{backdrop_path}" if backdrop_path else None,
            "tmdb_rating": top.get("vote_average"),
            "vote_count": top.get("vote_count"),
            "overview": top.get("overview"),
        }

        _CACHE[cache_key] = result
        return result

    except Exception:
        # On any network or timeout error, fail open without breaking recommendation engine
        return None


def enrich_movie(movie: Dict[str, Any]) -> Dict[str, Any]:
    """
    If TMDB is enabled, enriches movie dictionary with official TMDB posters and backdrops.
    If TMDB is disabled or request fails, returns movie untouched.
    """
    if not is_tmdb_configured():
        return movie

    details = fetch_tmdb_details(movie.get("title", ""), movie.get("year"))
    if not details:
        return movie

    enriched = dict(movie)
    if details.get("poster"):
        enriched["poster"] = details["poster"]
    if details.get("backdrop"):
        enriched["backdrop"] = details["backdrop"]
    if details.get("tmdb_id"):
        enriched["tmdb_id"] = details["tmdb_id"]

    return enriched
