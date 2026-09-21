import React, { useState, useEffect } from 'react';
import MovieDNA from './MovieDNA';
import RecommendationExplanation from './RecommendationExplanation';
import MovieConstellation from './MovieConstellation';
import MovieRecommendations from './MovieRecommendations';
import {
  toggleWatchlist,
  markMovieWatched,
  rateMovie,
  isMovieInWatchlist,
  isMovieWatched,
  getMovieRating,
} from '../services/api';
import { X, Star, Bookmark, CheckCircle, ShieldCheck } from 'lucide-react';

export default function MovieDetailsModal({ movie, onClose, onSelectConnectedMovie }) {
  const [userRating, setUserRating] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    if (movie?.id) {
      setInWatchlist(isMovieInWatchlist(movie.id));
      setWatched(isMovieWatched(movie.id));
      setUserRating(getMovieRating(movie.id) || null);
    }
  }, [movie?.id]);

  if (!movie) return null;

  const handleToggleWatchlist = async () => {
    const res = await toggleWatchlist(movie.id);
    setInWatchlist(res.inWatchlist);
  };

  const handleToggleWatched = async () => {
    const nextWatched = !watched;
    setWatched(nextWatched);
    await markMovieWatched(movie.id, nextWatched);
  };

  const handleRate = async (star) => {
    setUserRating(star);
    await rateMovie(movie.id, star);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(18, 10, 24, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      className="animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90dvh',
          backgroundColor: 'var(--vyora-bg)',
          border: '1px solid var(--vyora-border-strong)',
          borderRadius: '8px',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
      >
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--vyora-surface)',
            color: 'var(--vyora-text)',
            border: '1px solid var(--vyora-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <X size={18} />
        </button>

        {/* Hero Backdrop Header */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '280px',
            backgroundColor: 'var(--vyora-bg-secondary)',
            overflow: 'hidden'
          }}
        >
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0,
              opacity: 0.55
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, var(--vyora-bg) 0%, transparent 85%)'
            }}
          />

          {/* Poster & Header Info Overlay */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              padding: '24px 24px 20px 24px',
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              marginTop: '80px'
            }}
          >
            {/* Poster thumbnail */}
            <img
              src={movie.poster}
              alt={movie.title}
              style={{
                width: '120px',
                height: '175px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: '3px solid var(--vyora-surface)',
                boxShadow: 'var(--shadow-md)',
                flexShrink: 0
              }}
            />

            <div style={{ flex: '1 1 280px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span className="stamp-badge-gold">{movie.year}</span>
                {movie.genres?.map(g => (
                  <span key={g} className="stamp-badge">{g}</span>
                ))}
              </div>

              <h1
                className="heading-editorial"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--vyora-text)', lineHeight: 1.05 }}
              >
                {movie.title}
              </h1>

              <p style={{ fontSize: '0.9rem', color: 'var(--vyora-accent-secondary)', fontWeight: 600, marginTop: '6px' }}>
                Directed by {movie.director} • {movie.runtime} • Rating: <Star size={14} fill="var(--vyora-gold)" color="var(--vyora-gold)" style={{ display: 'inline' }} /> {movie.rating} / 10
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '24px' }}>
          {/* Tagline & Synopsis */}
          {movie.tagline && (
            <p
              style={{
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: 'var(--vyora-accent)',
                fontFamily: 'var(--font-display)',
                marginBottom: '14px'
              }}
            >
              "{movie.tagline}"
            </p>
          )}

          <p style={{ fontSize: '0.95rem', color: 'var(--vyora-text)', lineHeight: 1.6, marginBottom: '28px' }}>
            {movie.description}
          </p>

          {/* User Interaction Controls */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              padding: '16px',
              backgroundColor: 'var(--vyora-surface)',
              borderRadius: '6px',
              border: '1px solid var(--vyora-border)',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <button
              onClick={handleToggleWatchlist}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: inWatchlist ? 'var(--vyora-accent-secondary)' : 'var(--vyora-bg-secondary)',
                color: 'var(--vyora-text)',
                border: '1px solid var(--vyora-border-strong)',
                borderRadius: '3px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Bookmark size={15} fill={inWatchlist ? 'var(--vyora-text)' : 'none'} />
              <span>{inWatchlist ? 'IN WATCHLIST' : 'ADD TO WATCHLIST'}</span>
            </button>

            <button
              onClick={handleToggleWatched}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: watched ? 'var(--vyora-accent)' : 'var(--vyora-bg-secondary)',
                color: watched ? '#120A18' : 'var(--vyora-text)',
                border: '1px solid var(--vyora-border-strong)',
                borderRadius: '3px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <CheckCircle size={15} />
              <span>{watched ? 'MARKED WATCHED' : 'MARK AS WATCHED'}</span>
            </button>

            {/* Quick Star Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--vyora-text-muted)' }}>YOUR RATING:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    <Star
                      size={18}
                      fill={userRating && userRating >= star ? 'var(--vyora-gold)' : 'none'}
                      color="var(--vyora-gold)"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deep Breakdown Grid (DNA + Why You'll Like This) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '24px',
              marginBottom: '32px'
            }}
          >
            <div style={{ flex: '1 1 340px' }}>
              <MovieDNA movie={movie} />
            </div>

            <div style={{ flex: '1 1 340px' }}>
              <RecommendationExplanation movie={movie} />
            </div>
          </div>

          {/* Movie Constellation Interactive Similarity Section */}
          <MovieConstellation
            currentMovie={movie}
            constellationData={movie.constellation}
            onSelectConnectedMovie={onSelectConnectedMovie}
          />

          {/* Recommended For You - Hybrid Similarity Engine */}
          <MovieRecommendations
            currentMovie={movie}
            onSelectMovie={(recMovie) => {
              onSelectConnectedMovie && onSelectConnectedMovie(recMovie.id);
            }}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}
