import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.recommender import HybridRecommendationEngine

router = APIRouter()

DATA_FILE = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "movies.json"
)


def load_movies() -> List[Dict[str, Any]]:
    if not DATA_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Movie dataset file not found on server"
        )
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


# =========================
# RESPONSE SCHEMAS
# =========================

class ComponentScores(BaseModel):
    genres: float = Field(..., description="Jaccard genre similarity score (0.0 to 1.0)")
    moods: float = Field(..., description="Jaccard mood similarity score (0.0 to 1.0)")
    atmosphere: float = Field(..., description="Atmosphere DNA overlap score (0.0 to 1.0)")
    text: float = Field(..., description="Cosine similarity of narrative text (0.0 to 1.0)")
    metrics: float = Field(..., description="Proximity on shared DNA metrics (0.0 to 1.0)")
    constellation: float = Field(..., description="Constellation network link prior (0.0 to 1.0)")
    director: float = Field(..., description="Director / auteur match score (0.0 to 1.0)")


class RecommendationItem(BaseModel):
    movie_id: str = Field(..., description="Unique movie identifier")
    id: str = Field(..., description="Alias for movie_id")
    title: str = Field(..., description="Movie title")
    year: int = Field(..., description="Release year")
    final_similarity_score: float = Field(..., description="Overall weighted similarity score (0 to 100)")
    finalScore: float = Field(..., description="Alias for final_similarity_score")
    component_scores: ComponentScores = Field(..., description="Breakdown of all 7 similarity components")
    components: ComponentScores = Field(..., description="Alias for component_scores")
    explanation: str = Field(..., description="Human-readable explanation of key matching factors")
    movie: Optional[Dict[str, Any]] = Field(None, description="Full candidate movie metadata")


# =========================
# ROUTES
# =========================

@router.get(
    "/movie/{movie_id}",
    response_model=List[RecommendationItem],
    summary="Get movie recommendations",
    description="Calculates hybrid similarity recommendations for a given movie using the 7-dimensional HybridRecommendationEngine.",
    responses={
        200: {"description": "Successfully calculated and ranked hybrid recommendations."},
        400: {"description": "Invalid parameter value, e.g. top_n <= 0."},
        404: {"description": "Specified movie ID not found or no movies available."},
        500: {"description": "Dataset file missing or unreadable on the server."},
    }
)
def get_movie_recommendations(
    movie_id: str,
    top_n: Optional[int] = Query(
        default=None,
        description="Optional limit on the number of recommendations returned. Must be greater than 0."
    )
):
    # Validate top_n if provided
    if top_n is not None and top_n <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid top_n value. top_n must be a positive integer greater than 0."
        )

    movies = load_movies()
    if not movies:
        raise HTTPException(
            status_code=404,
            detail="No movies available in dataset"
        )

    # Initialize the engine
    engine = HybridRecommendationEngine(movies)

    # Execute recommendation engine
    try:
        raw_recommendations = engine.get_recommendations(movie_id=movie_id, top_n=top_n)
    except ValueError as err:
        raise HTTPException(
            status_code=404,
            detail=str(err)
        )

    # Transform recommendations to match required response format
    results: List[RecommendationItem] = []
    for rec in raw_recommendations:
        candidate = rec["movie"]
        comps = rec["components"]
        results.append(
            RecommendationItem(
                movie_id=candidate["id"],
                id=candidate["id"],
                title=candidate["title"],
                year=candidate["year"],
                final_similarity_score=rec["finalScore"],
                finalScore=rec["finalScore"],
                component_scores=ComponentScores(**comps),
                components=ComponentScores(**comps),
                explanation=rec["explanation"],
                movie=candidate,
            )
        )

    return results


# =========================
# VIBE MIXER SCHEMAS & ROUTE
# =========================

class VibeRequest(BaseModel):
    mindBending: float = Field(default=50.0, ge=0.0, le=100.0, description="Mind-bending sensory weight (0 to 100)")
    emotional: float = Field(default=50.0, ge=0.0, le=100.0, description="Emotional resonance weight (0 to 100)")
    action: float = Field(default=50.0, ge=0.0, le=100.0, description="Action/kinetic weight (0 to 100)")
    comedy: float = Field(default=50.0, ge=0.0, le=100.0, description="Comedy/levity weight (0 to 100)")
    dark: float = Field(default=50.0, ge=0.0, le=100.0, description="Dark/noir tension weight (0 to 100)")
    romantic: float = Field(default=50.0, ge=0.0, le=100.0, description="Romance/intimacy weight (0 to 100)")
    adventure: float = Field(default=50.0, ge=0.0, le=100.0, description="Adventure/scale weight (0 to 100)")
    top_n: Optional[int] = Field(default=None, gt=0, description="Optional maximum number of recommendations")


class VibeRecommendationItem(BaseModel):
    movie_id: str
    id: str
    title: str
    year: int
    vibeMatchScore: float
    finalScore: float
    components: Dict[str, float]
    movieVibeProfile: Dict[str, float]
    explanation: str
    movie: Dict[str, Any]


@router.post(
    "/vibe",
    response_model=List[VibeRecommendationItem],
    summary="Get Vibe Mixer recommendations",
    description="Calculates recommendations based on the 7 sensory slider dimensions from the Vibe Mixer.",
)
def get_vibe_recommendations(payload: VibeRequest):
    movies = load_movies()
    if not movies:
        raise HTTPException(status_code=404, detail="No movies available in dataset")

    engine = HybridRecommendationEngine(movies)
    dimensions = {
        "mindBending": payload.mindBending,
        "emotional": payload.emotional,
        "action": payload.action,
        "comedy": payload.comedy,
        "dark": payload.dark,
        "romantic": payload.romantic,
        "adventure": payload.adventure,
    }

    raw = engine.get_vibe_recommendations(slider_dimensions=dimensions, top_n=payload.top_n)

    results: List[VibeRecommendationItem] = []
    for item in raw:
        cand = item["movie"]
        results.append(
            VibeRecommendationItem(
                movie_id=cand["id"],
                id=cand["id"],
                title=cand["title"],
                year=cand["year"],
                vibeMatchScore=item["vibeMatchScore"],
                finalScore=item["finalScore"],
                components=item["components"],
                movieVibeProfile=item["movieVibeProfile"],
                explanation=item["explanation"],
                movie=cand,
            )
        )
    return results


# =========================
# USER UNIVERSE SCHEMAS & ROUTE
# =========================

class UserTasteRequest(BaseModel):
    liked_ids: List[str] = Field(default_factory=list, description="List of movie IDs liked or in watchlist")
    watched_ids: List[str] = Field(default_factory=list, description="List of movie IDs already watched")
    ratings: Dict[str, float] = Field(default_factory=dict, description="User ratings keyed by movie ID")
    top_n: Optional[int] = Field(default=None, gt=0, description="Optional limit")


class UserRecommendationItem(BaseModel):
    movie_id: str
    id: str
    title: str
    year: int
    finalScore: float
    explanation: str
    primaryAnchorMovie: Optional[str] = None
    movie: Dict[str, Any]


@router.post(
    "/user",
    response_model=List[UserRecommendationItem],
    summary="Get personalized user recommendations",
    description="Calculates recommendations tailored to the user's liked and watched history (Taste Centroid).",
)
def get_user_taste_recommendations(payload: UserTasteRequest):
    movies = load_movies()
    if not movies:
        raise HTTPException(status_code=404, detail="No movies available in dataset")

    engine = HybridRecommendationEngine(movies)
    combined_liked = list(set(payload.liked_ids + payload.watched_ids))

    raw = engine.get_user_recommendations(
        liked_movie_ids=combined_liked,
        user_ratings=payload.ratings,
        top_n=payload.top_n
    )

    results: List[UserRecommendationItem] = []
    for item in raw:
        cand = item["movie"]
        results.append(
            UserRecommendationItem(
                movie_id=cand["id"],
                id=cand["id"],
                title=cand["title"],
                year=cand["year"],
                finalScore=item["finalScore"],
                explanation=item["explanation"],
                primaryAnchorMovie=item.get("primaryAnchorMovie"),
                movie=cand,
            )
        )
    return results


# =========================
# MOOD ENGINE ROUTE
# =========================

@router.get(
    "/mood/{mood_id}",
    response_model=List[Dict[str, Any]],
    summary="Get algorithmic mood recommendations",
    description="Returns movies ranked algorithmically for a specific mood filter.",
)
def get_mood_recommendations(
    mood_id: str,
    top_n: Optional[int] = Query(default=None, gt=0, description="Limit of recommendations")
):
    movies = load_movies()
    if not movies:
        raise HTTPException(status_code=404, detail="No movies available in dataset")

    engine = HybridRecommendationEngine(movies)
    return engine.get_mood_recommendations(mood_id=mood_id, top_n=top_n)
