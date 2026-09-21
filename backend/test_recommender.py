"""
Test and Demo Script for the Hybrid Recommendation Engine
Demonstrates dynamic recommendation calculation for 'interstellar-2014'.
"""

import json
from pathlib import Path
from app.recommender import HybridRecommendationEngine, WEIGHTS


def main():
    data_path = Path(__file__).parent / "data" / "movies.json"
    with open(data_path, "r", encoding="utf-8") as f:
        movies = json.load(f)

    print("=" * 80)
    print(f"Loaded {len(movies)} movies from {data_path.name}")
    print("Component Weights:", WEIGHTS)
    print("Sum of Weights:", sum(WEIGHTS.values()))
    print("=" * 80)

    engine = HybridRecommendationEngine(movies)
    source_id = "interstellar-2014"

    source_movie = engine.movies_by_id[source_id]
    print(f"\nSOURCE MOVIE: {source_movie['title']} ({source_movie['year']})")
    print(f"Director: {source_movie['director']}")
    print(f"Genres: {source_movie['genres']}")
    print(f"Moods: {source_movie['moods']}")
    print(f"Atmosphere: {source_movie.get('dna', {}).get('atmosphere', [])}")
    print("-" * 80)

    # Compute recommendations for all other movies
    all_recommendations = engine.get_recommendations(source_id)

    print(f"\nDYNAMIC RECOMMENDATIONS FOR '{source_movie['title']}' (Total: {len(all_recommendations)}):\n")

    for rank, rec in enumerate(all_recommendations, 1):
        m = rec["movie"]
        score = rec["finalScore"]
        comps = rec["components"]
        explanation = rec["explanation"]

        print(f"#{rank:<2} {m['title']} ({m['year']}) - Final Score: {score:.2f}%")
        print(f"    Director:    {m['director']}")
        print(f"    Genres:      {m['genres']}")
        print(f"    Explanation: {explanation}")
        print(f"    Components (0-1):")
        print(
            f"      [Genres: {comps['genres']:.3f}] [Moods: {comps['moods']:.3f}] "
            f"[Atmosphere: {comps['atmosphere']:.3f}] [Text: {comps['text']:.3f}]"
        )
        print(
            f"      [Metrics: {comps['metrics']:.3f}] [Constellation: {comps['constellation']:.3f}] "
            f"[Director: {comps['director']:.3f}]"
        )
        print("-" * 80)

    # Assertions / Sanity Checks
    top_ids = [rec["movie"]["id"] for rec in all_recommendations]
    assert source_id not in top_ids, "Source movie must not be in recommendations"
    assert len(all_recommendations) == len(movies) - 1, "Should score all other movies"

    # Top recommendations for Interstellar should be Arrival, Dune, Blade Runner 2049, or The Prestige
    assert all_recommendations[0]["movie"]["id"] in ["arrival-2016", "dune-2021", "blade-runner-2049"], (
        f"Expected top sci-fi match, got {all_recommendations[0]['movie']['id']}"
    )

    # Verify top_n works
    top_3 = engine.get_recommendations(source_id, top_n=3)
    assert len(top_3) == 3, "top_n should return exactly 3 items"

    print("\n[SUCCESS] Engine verified! Recommendations are dynamically calculated, ranked, and explained.")


if __name__ == "__main__":
    main()
