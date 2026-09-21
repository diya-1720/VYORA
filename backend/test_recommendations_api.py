"""
Automated Test Suite for FastAPI Recommendation Endpoint:
GET /api/recommendations/movie/{movie_id}

Verifies:
1. Retrieval of hybrid recommendations for 'interstellar-2014'
2. Presence and types of required fields (movie_id, title, year, final_similarity_score, component_scores, explanation)
3. Correct behavior with optional top_n parameter (e.g. top_n=3)
4. Validation and 400 Bad Request error for invalid top_n (e.g. top_n=0, top_n=-5)
5. Validation and 404 Not Found error for non-existent movie_id
6. OpenAPI schema verification for Swagger/docs integration
"""

import sys
from pathlib import Path

# Ensure backend root is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_interstellar_recommendations():
    print("Testing GET /api/recommendations/movie/interstellar-2014 ...")
    response = client.get("/api/recommendations/movie/interstellar-2014")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert isinstance(data, list), "Response data must be a list"
    assert len(data) > 0, "Response data should not be empty"

    # Source movie should not be recommended to itself
    recommended_ids = [item["movie_id"] for item in data]
    assert "interstellar-2014" not in recommended_ids, "Source movie must not be in recommendations"

    # Validate structure of first item
    first = data[0]
    required_fields = [
        "movie_id",
        "title",
        "year",
        "final_similarity_score",
        "component_scores",
        "explanation",
    ]
    for field in required_fields:
        assert field in first, f"Missing required field: {field}"

    # Validate component_scores
    comp_scores = first["component_scores"]
    required_components = [
        "genres",
        "moods",
        "atmosphere",
        "text",
        "metrics",
        "constellation",
        "director",
    ]
    for comp in required_components:
        assert comp in comp_scores, f"Missing component score: {comp}"
        assert isinstance(comp_scores[comp], (int, float)), f"Component {comp} must be numeric"
        assert 0.0 <= comp_scores[comp] <= 1.0, f"Component {comp} out of bounds: {comp_scores[comp]}"

    assert isinstance(first["final_similarity_score"], (int, float))
    assert 0.0 <= first["final_similarity_score"] <= 100.0

    print(f"  Passed! Top match: {first['title']} ({first['year']}) with score {first['final_similarity_score']}%")
    print(f"  Explanation: {first['explanation']}")


def test_top_n_parameter():
    print("Testing top_n parameter (top_n=3) ...")
    response = client.get("/api/recommendations/movie/interstellar-2014?top_n=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3, f"Expected exactly 3 recommendations, got {len(data)}"
    print("  Passed! Exactly 3 recommendations returned.")


def test_invalid_top_n_zero():
    print("Testing invalid top_n=0 (expecting 400 Bad Request) ...")
    response = client.get("/api/recommendations/movie/interstellar-2014?top_n=0")
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    detail = response.json().get("detail", "")
    assert "top_n" in detail.lower(), f"Unexpected error message: {detail}"
    print(f"  Passed! 400 returned with detail: '{detail}'")


def test_invalid_top_n_negative():
    print("Testing invalid top_n=-5 (expecting 400 Bad Request) ...")
    response = client.get("/api/recommendations/movie/interstellar-2014?top_n=-5")
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    detail = response.json().get("detail", "")
    assert "top_n" in detail.lower(), f"Unexpected error message: {detail}"
    print(f"  Passed! 400 returned with detail: '{detail}'")


def test_invalid_movie_id():
    print("Testing invalid movie ID 'non-existent-movie-9999' (expecting 404 Not Found) ...")
    response = client.get("/api/recommendations/movie/non-existent-movie-9999")
    assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    detail = response.json().get("detail", "")
    assert "not found" in detail.lower(), f"Unexpected error message: {detail}"
    print(f"  Passed! 404 returned with detail: '{detail}'")


def test_openapi_docs():
    print("Testing OpenAPI / Swagger docs specification ...")
    response = client.get("/openapi.json")
    assert response.status_code == 200
    spec = response.json()
    route_key = "/api/recommendations/movie/{movie_id}"
    assert route_key in spec["paths"], f"Route {route_key} not documented in OpenAPI spec"
    endpoint_spec = spec["paths"][route_key]["get"]
    assert "summary" in endpoint_spec
    assert "parameters" in endpoint_spec
    param_names = [p["name"] for p in endpoint_spec["parameters"]]
    assert "movie_id" in param_names
    assert "top_n" in param_names
    print("  Passed! OpenAPI schema correctly registers the endpoint and parameters.")


def test_vibe_mixer_recommendations():
    print("Testing POST /api/recommendations/vibe ...")
    payload = {
        "mindBending": 90.0,
        "emotional": 20.0,
        "action": 80.0,
        "comedy": 10.0,
        "dark": 65.0,
        "romantic": 15.0,
        "adventure": 85.0,
        "top_n": 3
    }
    response = client.post("/api/recommendations/vibe", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3, f"Expected 3 items, got {len(data)}"

    first = data[0]
    for key in ["movie_id", "title", "year", "vibeMatchScore", "finalScore", "components", "movieVibeProfile", "explanation", "movie"]:
        assert key in first, f"Missing key in vibe recommendation: {key}"

    assert 0.0 <= first["vibeMatchScore"] <= 100.0
    assert len(first["components"]) == 7
    print(f"  Passed! Top match: {first['title']} ({first['vibeMatchScore']}%) - {first['explanation']}")


def test_user_taste_recommendations():
    print("Testing POST /api/recommendations/user (Taste Centroid) ...")
    payload = {
        "liked_ids": ["blade-runner-2049", "knives-out-2019"],
        "watched_ids": ["interstellar-2014"],
        "ratings": {"interstellar-2014": 5.0, "blade-runner-2049": 4.5},
        "top_n": 4
    }
    response = client.post("/api/recommendations/user", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 4

    first = data[0]
    for key in ["movie_id", "title", "year", "finalScore", "explanation", "primaryAnchorMovie", "movie"]:
        assert key in first, f"Missing key in user taste recommendation: {key}"

    # Verify liked / watched IDs are excluded from recommendations
    recommended_ids = [item["movie_id"] for item in data]
    assert "interstellar-2014" not in recommended_ids
    assert "blade-runner-2049" not in recommended_ids
    assert "knives-out-2019" not in recommended_ids

    print(f"  Passed! Top match: {first['title']} ({first['finalScore']}%) anchored on {first['primaryAnchorMovie']}")


def test_mood_recommendations():
    print("Testing GET /api/recommendations/mood/mind-bending ...")
    response = client.get("/api/recommendations/mood/mind-bending?top_n=3")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3

    first = data[0]
    for key in ["movie", "finalScore", "vibeMatchScore", "explanation"]:
        assert key in first, f"Missing key in mood recommendation: {key}"

    assert 0.0 <= first["finalScore"] <= 100.0
    print(f"  Passed! Top match for mind-bending: {first['movie']['title']} ({first['finalScore']}%)")


def run_all_tests():
    print("=" * 70)
    print("RUNNING AUTOMATED TEST SUITE FOR RECOMMENDATION API")
    print("=" * 70)
    test_interstellar_recommendations()
    test_top_n_parameter()
    test_invalid_top_n_zero()
    test_invalid_top_n_negative()
    test_invalid_movie_id()
    test_openapi_docs()
    test_vibe_mixer_recommendations()
    test_user_taste_recommendations()
    test_mood_recommendations()
    print("=" * 70)
    print("ALL 9 TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_tests()

