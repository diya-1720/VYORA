import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMovieById,
  MOVIES,
  rateMovie,
  toggleWatchlist,
  markMovieWatched,
  isMovieInWatchlist,
  isMovieWatched,
  getMovieRating,
} from '../services/api';
import MovieDNA from '../components/MovieDNA';
import RecommendationExplanation from '../components/RecommendationExplanation';
import MovieConstellation from '../components/MovieConstellation';
import MovieRecommendations from '../components/MovieRecommendations';
import WatchPlatforms from '../components/WatchPlatforms';
import { Star, Bookmark, CheckCircle, ArrowLeft, Heart, Users, Sparkles } from 'lucide-react';

export default function MovieDetails({ onSelectMovie }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    async function load() {
      const activeId = id || 'interstellar-2014';
      try {
        const data = await getMovieById(activeId);
        setMovie(data);
      } catch (err) {
        setMovie(MOVIES[0]);
      }

      setInWatchlist(isMovieInWatchlist(activeId));
      setIsWatched(isMovieWatched(activeId));
      setUserRating(getMovieRating(activeId));
    }
    load();
  }, [id]);

  if (!movie) return null;

  const handleRate = async (score) => {
    setUserRating(score);
    await rateMovie(movie.id, score);
  };

  const handleToggleWatchlist = async () => {
    const res = await toggleWatchlist(movie.id);
    setInWatchlist(res.inWatchlist);
  };

  const handleToggleWatched = async () => {
    const nextWatched = !isWatched;
    setIsWatched(nextWatched);
    await markMovieWatched(movie.id, nextWatched);
  };

  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px 24px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn-cinematic-ghost"
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={16} />
        <span>BACK TO DISCOVERY</span>
      </button>

      {/* Hero Banner Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '4px',
          padding: '36px',
          marginBottom: '36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '32px',
          alignItems: 'center'
        }}
      >
        <div style={{ gridColumn: 'span 4' }}>
          <img
            src={movie.poster}
            alt={movie.title}
            style={{
              width: '100%',
              borderRadius: '4px',
              border: '4px solid var(--bg-sand)',
              boxShadow: 'var(--shadow-lg)'
            }}
          />
        </div>

        <div style={{ gridColumn: 'span 8' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="stamp-badge-gold">{movie.year}</span>
            {movie.genres?.map(g => (
              <span key={g} className="stamp-badge">{g}</span>
            ))}
            {movie.subVibe && (
              <span className="stamp-badge-wine">{movie.subVibe}</span>
            )}
          </div>

          <h1 className="heading-editorial" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.8rem)', color: 'var(--text-charcoal)', marginBottom: '8px' }}>
            {movie.title}
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--accent-deep-wine)', fontWeight: 600, marginBottom: '16px' }}>
            Directed by {movie.director} • {movie.runtime} • Rating: <Star size={16} fill="var(--highlight-gold)" color="var(--highlight-gold)" style={{ display: 'inline' }} /> {movie.rating} / 10
          </p>

          {movie.tagline && (
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--accent-burnt-orange)', fontFamily: 'var(--font-editorial)', marginBottom: '16px' }}>
              "{movie.tagline}"
            </p>
          )}

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            {movie.description}
          </p>

          {/* Social Circle Insight Callout */}
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-sand)', borderLeft: '3px solid var(--highlight-gold)', borderRadius: '2px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={18} color="var(--accent-burnt-orange)" />
            <span style={{ fontSize: '0.88rem', color: 'var(--text-charcoal)' }}>
              <strong>Vibe Circle Insight:</strong> Diya and Aarav in your Vibe Circle gave this film top vector scores.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handleToggleWatchlist}
              className={inWatchlist ? 'btn-cinematic-secondary' : 'btn-cinematic-primary'}
            >
              <Bookmark size={18} />
              <span>{inWatchlist ? "IN WATCHLIST" : "ADD TO WATCHLIST"}</span>
            </button>

            <button
              onClick={handleToggleWatched}
              className="btn-cinematic-secondary"
            >
              <CheckCircle size={18} color={isWatched ? "var(--accent-burnt-orange)" : "currentColor"} />
              <span>{isWatched ? "WATCHED" : "MARK AS WATCHED"}</span>
            </button>

            {/* Interactive Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 16px', backgroundColor: 'var(--bg-sand)', borderRadius: '2px', border: '1px solid var(--border-medium)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', marginRight: '6px' }}>
                YOUR RATING:
              </span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                >
                  <Star size={18} fill={userRating >= star ? "var(--highlight-gold)" : "none"} color="var(--highlight-gold)" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: DNA + VYORA'S TAKE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '28px', marginBottom: '40px' }}>
        <div style={{ gridColumn: 'span 6' }}>
          <MovieDNA movie={movie} />
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <RecommendationExplanation movie={movie} />
        </div>
      </div>

      {/* Where to Watch */}
      <div style={{ marginBottom: '40px' }}>
        <WatchPlatforms platforms={movie.whereToWatch} />
      </div>

      {/* Interactive Constellation */}
      <MovieConstellation
        currentMovie={movie}
        constellationData={movie.constellation}
        onSelectConnectedMovie={(connId) => {
          navigate(`/movie/${connId}`);
        }}
      />

      {/* Recommended For You - Hybrid Similarity Engine */}
      <MovieRecommendations
        currentMovie={movie}
        onSelectMovie={(selectedMovie) => {
          navigate(`/movie/${selectedMovie.id}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </main>
  );
}
