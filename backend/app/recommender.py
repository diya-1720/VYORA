"""
Hybrid Similarity Recommendation Engine for Vyora
Calculates dynamic similarity scores across 7 normalized dimensions:
1. genres (weight: 0.22)
2. moods (weight: 0.18)
3. dna.atmosphere (weight: 0.15)
4. text similarity (tagline + description + thematic reasons) (weight: 0.18)
5. dna.metrics (weight: 0.12)
6. constellation prior (weight: 0.10)
7. director match (weight: 0.05)
"""

import math
import re
from typing import Dict, List, Any, Optional, Set

# Component Weights (Sum = 1.0)
WEIGHTS = {
    "genres": 0.22,
    "moods": 0.18,
    "atmosphere": 0.15,
    "text": 0.18,
    "metrics": 0.12,
    "constellation": 0.10,
    "director": 0.05,
}

# English stopwords for lightweight text tokenization
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
    "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", 
    "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", 
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", 
    "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", 
    "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "s", "same", "she", 
    "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", 
    "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", 
    "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", 
    "why", "will", "with", "would", "you", "your", "yours", "yourself", "yourselves"
}


def tokenize_text(text: str) -> List[str]:
    """Extract lowercase alpha tokens, removing stopwords."""
    if not text:
        return []
    tokens = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
    return [t for t in tokens if t not in STOPWORDS]


def compute_tf_vector(tokens: List[str]) -> Dict[str, float]:
    """Calculate term frequencies for a token list."""
    tf: Dict[str, float] = {}
    for t in tokens:
        tf[t] = tf.get(t, 0.0) + 1.0
    return tf


def cosine_similarity(tf_a: Dict[str, float], tf_b: Dict[str, float]) -> float:
    """Compute cosine similarity between two term frequency dictionaries."""
    if not tf_a or not tf_b:
        return 0.0

    intersection = set(tf_a.keys()) & set(tf_b.keys())
    dot_product = sum(tf_a[k] * tf_b[k] for k in intersection)

    norm_a = math.sqrt(sum(v * v for v in tf_a.values()))
    norm_b = math.sqrt(sum(v * v for v in tf_b.values()))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return dot_product / (norm_a * norm_b)


def jaccard_similarity(set_a: Set[str], set_b: Set[str]) -> float:
    """Compute Jaccard similarity between two sets."""
    if not set_a or not set_b:
        return 0.0
    union = set_a | set_b
    if not union:
        return 0.0
    return len(set_a & set_b) / len(union)


class HybridRecommendationEngine:
    """
    Standalone Hybrid Recommendation Engine that dynamically scores and ranks movies.
    """

    def __init__(self, movies: List[Dict[str, Any]]):
        self.movies = movies
        self.movies_by_id = {m["id"]: m for m in movies}
        self._precompute_texts()

    def _precompute_texts(self):
        """Precompute tokenized text vectors for fast TF-IDF / term-frequency similarity."""
        self.text_vectors = {}
        for m in self.movies:
            reasons_text = " ".join(m.get("recommendationReason", {}).get("reasons", []))
            vector_match = m.get("recommendationReason", {}).get("vectorMatch", "")
            combined = (
                f"{m.get('title', '')} {m.get('tagline', '')} {m.get('description', '')} "
                f"{vector_match} {reasons_text}"
            )
            tokens = tokenize_text(combined)
            self.text_vectors[m["id"]] = compute_tf_vector(tokens)

    def calculate_genre_similarity(self, a: Dict[str, Any], b: Dict[str, Any]) -> float:
        """1. Jaccard similarity of genres (0.0 to 1.0)."""
        genres_a = {g.strip().lower() for g in a.get("genres", []) if g}
        genres_b = {g.strip().lower() for g in b.get("genres", []) if g}
        return jaccard_similarity(genres_a, genres_b)

    def calculate_mood_similarity(self, a: Dict[str, Any], b: Dict[str, Any]) -> float:
        """2. Jaccard similarity of moods (0.0 to 1.0)."""
        moods_a = {m.strip().lower() for m in a.get("moods", []) if m}
        moods_b = {m.strip().lower() for m in b.get("moods", []) if m}
        return jaccard_similarity(moods_a, moods_b)

    def calculate_atmosphere_similarity(self, a: Dict[str, Any], b: Dict[str, Any]) -> float:
        """3. Token & phrase overlap of dna.atmosphere (0.0 to 1.0)."""
        atm_list_a = [item.strip().lower() for item in a.get("dna", {}).get("atmosphere", []) if item]
        atm_list_b = [item.strip().lower() for item in b.get("dna", {}).get("atmosphere", []) if item]

        if not atm_list_a or not atm_list_b:
            return 0.0

        # Exact phrase set
        phrases_a = set(atm_list_a)
        phrases_b = set(atm_list_b)
        phrase_sim = jaccard_similarity(phrases_a, phrases_b)

        # Token set (handling e.g. "mind-bending" -> "mind", "bending")
        tokens_a = set(re.findall(r"\b[a-zA-Z]{3,}\b", " ".join(atm_list_a)))
        tokens_b = set(re.findall(r"\b[a-zA-Z]{3,}\b", " ".join(atm_list_b)))
        token_sim = jaccard_similarity(tokens_a, tokens_b)

        return max(phrase_sim, token_sim)

    def calculate_text_similarity(self, a: Dict[str, Any], b: Dict[str, Any]) -> float:
        """4. Cosine similarity of tagline + description + narrative text (0.0 to 1.0)."""
        tf_a = self.text_vectors.get(a["id"], {})
        tf_b = self.text_vectors.get(b["id"], {})
        return cosine_similarity(tf_a, tf_b)

    def calculate_metric_similarity(self, a: Dict[str, Any], b: Dict[str, Any]) -> float:
        """5. Quantitative distance on shared DNA metrics with label coverage scaling (0.0 to 1.0)."""
        metrics_a = {
            m["label"].strip().lower(): float(m.get("value", 0))
            for m in a.get("dna", {}).get("metrics", [])
            if "label" in m
        }
        metrics_b = {
            m["label"].strip().lower(): float(m.get("value", 0))
            for m in b.get("dna", {}).get("metrics", [])
            if "label" in m
        }

        if not metrics_a or not metrics_b:
            return 0.0

        shared_labels = set(metrics_a.keys()) & set(metrics_b.keys())
        if not shared_labels:
            return 0.0

        # Average proximity on shared metrics (1 - |diff|/100)
        proximity_sum = sum(
            max(0.0, 1.0 - (abs(metrics_a[lbl] - metrics_b[lbl]) / 100.0))
            for lbl in shared_labels
        )
        avg_proximity = proximity_sum / len(shared_labels)

        # Coverage factor = shared_count / max(len_a, len_b)
        max_labels = max(len(metrics_a), len(metrics_b))
        coverage = len(shared_labels) / max_labels if max_labels > 0 else 1.0

        return avg_proximity * coverage

    def calculate_constellation_prior(self, a: Dict[str, Any], b: Dict[str, Any]) -> float:
        """6. Curated graph edge similarity from constellation links (0.0 to 1.0)."""
        # Check direct link a -> b
        const_a = a.get("constellation", [])
        score_a_to_b = 0.0
        for edge in const_a:
            if edge.get("id") == b.get("id"):
                score_a_to_b = float(edge.get("similarity", 0.0))
                break

        # Check reverse link b -> a
        const_b = b.get("constellation", [])
        score_b_to_a = 0.0
        for edge in const_b:
            if edge.get("id") == a.get("id"):
                score_b_to_a = float(edge.get("similarity", 0.0))
                break

        return max(score_a_to_b, score_b_to_a)

    def calculate_director_match(self, a: Dict[str, Any], b: Dict[str, Any]) -> float:
        """7. Director matching / auteur similarity (0.0 to 1.0)."""
        dirs_a = {d.strip().lower() for d in a.get("director", "").split(",") if d.strip()}
        dirs_b = {d.strip().lower() for d in b.get("director", "").split(",") if d.strip()}
        if not dirs_a or not dirs_b:
            return 0.0
        return jaccard_similarity(dirs_a, dirs_b)

    def compute_pair_similarity(
        self, source: Dict[str, Any], candidate: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Compute all 7 normalized components and the final hybrid score."""
        s_genre = self.calculate_genre_similarity(source, candidate)
        s_mood = self.calculate_mood_similarity(source, candidate)
        s_atm = self.calculate_atmosphere_similarity(source, candidate)
        s_text = self.calculate_text_similarity(source, candidate)
        s_metrics = self.calculate_metric_similarity(source, candidate)
        s_const = self.calculate_constellation_prior(source, candidate)
        s_dir = self.calculate_director_match(source, candidate)

        component_scores = {
            "genres": round(s_genre, 4),
            "moods": round(s_mood, 4),
            "atmosphere": round(s_atm, 4),
            "text": round(s_text, 4),
            "metrics": round(s_metrics, 4),
            "constellation": round(s_const, 4),
            "director": round(s_dir, 4),
        }

        weighted_sum = (
            WEIGHTS["genres"] * s_genre
            + WEIGHTS["moods"] * s_mood
            + WEIGHTS["atmosphere"] * s_atm
            + WEIGHTS["text"] * s_text
            + WEIGHTS["metrics"] * s_metrics
            + WEIGHTS["constellation"] * s_const
            + WEIGHTS["director"] * s_dir
        )

        final_score = round(weighted_sum * 100.0, 2)
        explanation = self._generate_explanation(source, candidate, component_scores)

        return {
            "movie": candidate,
            "finalScore": final_score,
            "components": component_scores,
            "explanation": explanation,
        }

    def _generate_explanation(
        self,
        source: Dict[str, Any],
        candidate: Dict[str, Any],
        scores: Dict[str, float],
    ) -> str:
        """Generate human-readable explanation of the strongest matching factors."""
        factors = []

        # 1. Director Match
        if scores["director"] > 0:
            factors.append(f"Matching director ({candidate.get('director')})")

        # 2. Shared Genres
        genres_shared = set(g.lower() for g in source.get("genres", [])) & set(
            g.lower() for g in candidate.get("genres", [])
        )
        if genres_shared:
            genres_formatted = ", ".join(g.capitalize() for g in sorted(genres_shared))
            factors.append(f"Shared {genres_formatted} genres")

        # 3. Shared Moods
        moods_shared = set(m.lower() for m in source.get("moods", [])) & set(
            m.lower() for m in candidate.get("moods", [])
        )
        if moods_shared:
            moods_formatted = ", ".join(m.replace("-", " ") for m in sorted(moods_shared))
            factors.append(f"Aligned moods ({moods_formatted})")

        # 4. Constellation Prior
        if scores["constellation"] >= 0.8:
            factors.append(f"Strong constellation resonance ({int(scores['constellation'] * 100)}%)")

        # 5. Shared Atmosphere
        atm_shared = set(a.lower() for a in source.get("dna", {}).get("atmosphere", [])) & set(
            a.lower() for a in candidate.get("dna", {}).get("atmosphere", [])
        )
        if atm_shared:
            atm_formatted = ", ".join(a.capitalize() for a in sorted(atm_shared))
            factors.append(f"Shared atmosphere ({atm_formatted})")

        # 6. Text / Narrative Vector
        if scores["text"] > 0.15:
            factors.append("High narrative thematic overlap")

        if not factors:
            return "General thematic compatibility."

        return " | ".join(factors[:3])

    def get_recommendations(
        self, movie_id: str, top_n: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Given a source movie ID:
        - Compares with all other movies
        - Excludes source movie
        - Sorts by finalScore descending
        - Returns top N recommendation objects
        """
        source = self.movies_by_id.get(movie_id)
        if not source:
            raise ValueError(f"Movie with ID '{movie_id}' not found in dataset.")

        results = []
        for candidate in self.movies:
            if candidate["id"] == movie_id:
                continue
            scored = self.compute_pair_similarity(source, candidate)
            results.append(scored)

        results.sort(key=lambda x: x["finalScore"], reverse=True)

        if top_n is not None:
            return results[:top_n]
        return results

    def extract_vibe_profile(self, movie: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract normalized (0.0 to 100.0) 7-dimensional sensory vibe vector for a movie:
        [mindBending, emotional, action, comedy, dark, romantic, adventure]
        """
        genres = {g.lower() for g in movie.get("genres", [])}
        moods = {m.lower() for m in movie.get("moods", [])}
        atmosphere = {a.lower() for a in movie.get("dna", {}).get("atmosphere", [])}
        metrics = {
            m.get("label", "").lower(): float(m.get("value", 50))
            for m in movie.get("dna", {}).get("metrics", [])
        }

        # 1. mindBending
        mb = metrics.get("sci-fi", 0.0) * 0.4 + metrics.get("mystery", 0.0) * 0.3
        if "mind-bending" in moods:
            mb += 40.0
        if "escape-reality" in moods:
            mb += 15.0
        if any(a in atmosphere for a in ["cosmic", "philosophical", "psychological", "surreal", "non-linear"]):
            mb += 25.0
        if any(g in genres for g in ["sci-fi", "mystery"]):
            mb += 20.0
        mind_bending = min(100.0, max(15.0, mb))

        # 2. emotional
        em = metrics.get("drama", 0.0) * 0.4 + metrics.get("romance", 0.0) * 0.3
        if "feel-something" in moods:
            em += 45.0
        if any(a in atmosphere for a in ["melancholic", "poetic", "heartfelt", "intimate", "reflective"]):
            em += 25.0
        if "drama" in genres:
            em += 25.0
        emotional = min(100.0, max(10.0, em))

        # 3. action
        ac = metrics.get("action", 0.0) * 0.5 + metrics.get("adventure", 0.0) * 0.3
        if "adrenaline-rush" in moods:
            ac += 45.0
        if any(a in atmosphere for a in ["visceral", "intense", "dynamic", "kinetic", "thrilling"]):
            ac += 25.0
        if "action" in genres:
            ac += 30.0
        action = min(100.0, max(10.0, ac))

        # 4. comedy
        co = metrics.get("comedy", 0.0) * 0.5
        if "laugh-out-loud" in moods or "light-easy" in moods:
            co += 50.0
        if any(a in atmosphere for a in ["witty", "satirical", "playful", "absurdist", "lighthearted"]):
            co += 25.0
        if "comedy" in genres:
            co += 40.0
        comedy = min(100.0, max(5.0, co))

        # 5. dark
        dk = metrics.get("thriller", 0.0) * 0.3 + metrics.get("mystery", 0.0) * 0.2
        if "dark-twisted" in moods or "late-night" in moods:
            dk += 45.0
        if any(a in atmosphere for a in ["bleak", "neo-noir", "tense", "grim", "haunting", "ominous", "violent"]):
            dk += 30.0
        if any(g in genres for g in ["thriller", "horror", "crime"]):
            dk += 25.0
        dark = min(100.0, max(10.0, dk))

        # 6. romantic
        ro = metrics.get("romance", 0.0) * 0.5
        if "romantic" in moods or "feel-something" in moods:
            ro += 35.0
        if any(a in atmosphere for a in ["sensual", "intimate", "tender", "passionate", "warm"]):
            ro += 30.0
        if "romance" in genres:
            ro += 40.0
        romantic = min(100.0, max(5.0, ro))

        # 7. adventure
        ad = metrics.get("adventure", 0.0) * 0.4 + metrics.get("sci-fi", 0.0) * 0.2
        if "escape-reality" in moods or "adrenaline-rush" in moods:
            ad += 40.0
        if any(a in atmosphere for a in ["epic", "grand", "sweeping", "exploration", "otherworldly"]):
            ad += 25.0
        if "adventure" in genres:
            ad += 30.0
        adventure = min(100.0, max(15.0, ad))

        return {
            "mindBending": round(mind_bending, 1),
            "emotional": round(emotional, 1),
            "action": round(action, 1),
            "comedy": round(comedy, 1),
            "dark": round(dark, 1),
            "romantic": round(romantic, 1),
            "adventure": round(adventure, 1),
        }

    def get_vibe_recommendations(
        self, slider_dimensions: Dict[str, float], top_n: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Calculates recommendations based on the 7 sensory slider dimensions of the Vibe Mixer:
        - Compares user slider values (0-100) with each movie's vibe profile
        - Emphasizes dimensions where the user expressed strong preference
        - Returns ranked movies with component match breakdown and explanation
        """
        dimensions = [
            "mindBending", "emotional", "action", "comedy", "dark", "romantic", "adventure"
        ]
        user_vector = {d: float(slider_dimensions.get(d, 50.0)) for d in dimensions}

        results = []
        for movie in self.movies:
            movie_vector = self.extract_vibe_profile(movie)

            # Component proximity: 1 - |diff|/100
            dim_scores = {}
            weighted_diff_sum = 0.0
            total_weight = 0.0

            for d in dimensions:
                u_val = user_vector[d]
                m_val = movie_vector[d]
                prox = max(0.0, 1.0 - (abs(u_val - m_val) / 100.0))
                dim_scores[d] = round(prox, 4)

                # Weight is higher for dimensions where user moved away from neutral 50
                emphasis_weight = 1.0 + (abs(u_val - 50.0) / 25.0)
                weighted_diff_sum += prox * emphasis_weight
                total_weight += emphasis_weight

            vibe_match_score = round((weighted_diff_sum / total_weight) * 100.0, 2)

            # Find top matching dimensions
            sorted_dims = sorted(
                dimensions,
                key=lambda d: (user_vector[d] >= 60, dim_scores[d]),
                reverse=True
            )
            top_dim_names = [d.replace("mindBending", "Mind-Bending").capitalize() for d in sorted_dims[:2]]
            explanation = f"Resonates with your {top_dim_names[0]} and {top_dim_names[1]} sensory tuning ({int(vibe_match_score)}% match)."

            results.append({
                "movie": movie,
                "vibeMatchScore": vibe_match_score,
                "finalScore": vibe_match_score,
                "components": dim_scores,
                "movieVibeProfile": movie_vector,
                "explanation": explanation,
            })

        results.sort(key=lambda x: x["vibeMatchScore"], reverse=True)

        if top_n is not None:
            return results[:top_n]
        return results

    def get_user_recommendations(
        self,
        liked_movie_ids: List[str],
        user_ratings: Optional[Dict[str, float]] = None,
        top_n: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Personalized 'Curated For Your Universe' recommendation engine:
        - Takes the user's liked movies / watchlist IDs and optional ratings (1-5 or 1-10)
        - Computes similarity of all unviewed movies to the user's taste history
        - Returns ranked recommendations with personalized reasonings
        """
        user_ratings = user_ratings or {}
        valid_sources = [self.movies_by_id[m_id] for m_id in liked_movie_ids if m_id in self.movies_by_id]

        # Cold start fallback if user has no liked movies yet
        if not valid_sources:
            fallback = sorted(self.movies, key=lambda m: float(m.get("rating", 0.0)), reverse=True)
            results = [
                {
                    "movie": m,
                    "finalScore": round(float(m.get("rating", 8.0)) * 10.0, 1),
                    "components": {
                        "genres": 0.8,
                        "moods": 0.8,
                        "atmosphere": 0.8,
                        "text": 0.8,
                        "metrics": 0.8,
                        "constellation": 0.8,
                        "director": 0.5,
                    },
                    "explanation": f"Critically acclaimed standout ({m.get('rating')} rating) to initiate your Vibe Universe.",
                }
                for m in fallback
            ]
            if top_n is not None:
                return results[:top_n]
            return results

        # Score candidate movies (excluding already liked/watched)
        excluded_ids = set(liked_movie_ids)
        results = []

        for candidate in self.movies:
            if candidate["id"] in excluded_ids:
                continue

            similarities_to_sources = []
            for src in valid_sources:
                pair_result = self.compute_pair_similarity(src, candidate)
                weight = float(user_ratings.get(src["id"], 5.0)) / 5.0
                similarities_to_sources.append((src, pair_result, weight))

            # Sort by highest match to individual films in user history
            similarities_to_sources.sort(key=lambda item: item[1]["finalScore"], reverse=True)
            top_sources = similarities_to_sources[:3]

            # Weighted average of top resonant user films
            total_weight = sum(w for _, _, w in top_sources) or 1.0
            aggregated_score = sum(pr["finalScore"] * w for _, pr, w in top_sources) / total_weight
            best_source, best_pair_result, _ = top_sources[0]

            explanation = f"Recommended based on your affinity for {best_source.get('title')} ({best_pair_result['explanation']})."

            results.append({
                "movie": candidate,
                "finalScore": round(aggregated_score, 2),
                "components": best_pair_result["components"],
                "explanation": explanation,
                "primaryAnchorMovie": best_source.get("title"),
            })

        results.sort(key=lambda x: x["finalScore"], reverse=True)

        if top_n is not None:
            return results[:top_n]
        return results

    def get_mood_recommendations(
        self, mood_id: str, top_n: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Algorithmic server-side ranking for a selected mood filter:
        - Boosts films that explicitly carry the mood
        - Incorporates atmospheric resonance and rating quality
        - Returns ranked movies with custom editorial explanation
        """
        target_mood = mood_id.strip().lower()
        results = []

        for movie in self.movies:
            movie_moods = {m.lower() for m in movie.get("moods", [])}
            is_exact_mood = target_mood in movie_moods

            # Atmospheric proximity
            atm_list = [a.lower() for a in movie.get("dna", {}).get("atmosphere", [])]
            atm_overlap = any(target_mood.replace("-", " ") in a or a in target_mood for a in atm_list)

            # Rating quality factor
            rating = float(movie.get("rating", 7.0))

            base_score = 70.0 if is_exact_mood else 40.0
            if atm_overlap:
                base_score += 15.0
            base_score += (rating - 7.0) * 8.0
            final_score = min(99.0, max(45.0, round(base_score, 1)))

            mood_title = target_mood.replace("-", " ").capitalize()
            explanation = f"Curated for {mood_title} mood: {movie.get('tagline', movie.get('description', ''))[:80]}..."

            results.append({
                "movie": movie,
                "finalScore": final_score,
                "vibeMatchScore": final_score,
                "explanation": explanation,
            })

        results.sort(key=lambda x: x["finalScore"], reverse=True)

        if top_n is not None:
            return results[:top_n]
        return results
