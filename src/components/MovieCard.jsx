import React, { useState } from 'react';
import { Star, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function MovieCard({ movie, onSelectMovie, compact = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const matchScore = movie.vibeMatchScore || movie.recommendationReason?.similarityScore || 88;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectMovie && onSelectMovie(movie)}
      className="gpu-accelerated"
      style={{
        position: 'relative',
        backgroundColor: 'var(--vyora-surface)',
        border: '1px solid var(--vyora-border-strong)',
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.25, 1, 0.3, 1), border-color 0.3s ease',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isHovered ? 'var(--shadow-md), var(--vyora-glow)' : 'var(--shadow-sm)',
        borderColor: isHovered ? 'var(--vyora-accent)' : 'var(--vyora-border-strong)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none'
      }}
    >
      {/* Top Poster Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: compact ? '125%' : '142%',
          overflow: 'hidden',
          backgroundColor: 'var(--vyora-bg-secondary)'
        }}
      >
        <img
          src={movie.poster}
          alt={`${movie.title} Movie Poster`}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.3, 1)',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)'
          }}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isHovered
              ? 'linear-gradient(to top, rgba(18, 10, 24, 0.95) 0%, rgba(18, 10, 24, 0.4) 60%, transparent 100%)'
              : 'linear-gradient(to top, rgba(18, 10, 24, 0.75) 0%, transparent 55%)',
            transition: 'opacity 0.4s ease',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'var(--vyora-text)'
          }}
        >
          {/* Top Badges: Vibe Match % + Rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
            <span
              style={{
                backgroundColor: 'var(--vyora-accent)',
                color: '#120A18',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '3px 7px',
                borderRadius: '3px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                boxShadow: 'var(--vyora-glow)'
              }}
            >
              <ShieldCheck size={11} />
              {matchScore}% MATCH ✦
            </span>

            {/* Rating Tag */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                backgroundColor: 'rgba(18, 10, 24, 0.85)',
                backdropFilter: 'blur(4px)',
                padding: '3px 7px',
                borderRadius: '3px',
                border: '1px solid rgba(231, 196, 106, 0.4)'
              }}
            >
              <Star size={12} fill="var(--vyora-gold)" color="var(--vyora-gold)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--vyora-gold)' }}>
                {movie.rating}
              </span>
            </div>
          </div>

          {/* Quick Explore Action on Hover */}
          <div
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(239, 231, 219, 0.15)',
              paddingTop: '8px'
            }}
          >
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--vyora-gold)', fontWeight: 'bold' }}>
              ✦ VYORA'S TAKE & DNA
            </span>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--vyora-accent)',
                color: '#120A18',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Card Info Section */}
      <div
        style={{
          padding: '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: 1
        }}
      >
        <div>
          {/* Genre Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              marginBottom: '6px'
            }}
          >
            {movie.genres?.slice(0, 2).map(g => (
              <span
                key={g}
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--vyora-accent)',
                  backgroundColor: 'rgba(168, 117, 255, 0.1)',
                  padding: '2px 5px',
                  borderRadius: '2px'
                }}
              >
                {g}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3
            className="font-display"
            style={{
              fontSize: compact ? '1.05rem' : '1.2rem',
              fontWeight: 400,
              color: 'var(--vyora-text)',
              lineHeight: 1.15,
              marginBottom: '4px'
            }}
          >
            {movie.title} <span style={{ fontSize: '0.8em', color: 'var(--vyora-text-muted)' }}>({movie.year})</span>
          </h3>

          {/* Director & Runtime */}
          <p style={{ fontSize: '0.78rem', color: 'var(--vyora-text-muted)', margin: 0 }}>
            {movie.director} • {movie.runtime}
          </p>
        </div>

        {/* Tagline */}
        {!compact && movie.tagline && (
          <p
            style={{
              fontSize: '0.75rem',
              fontStyle: 'italic',
              color: 'var(--vyora-accent-secondary)',
              borderTop: '1px dashed var(--vyora-border)',
              paddingTop: '6px',
              margin: '8px 0 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            "{movie.tagline}"
          </p>
        )}
      </div>
    </div>
  );
}
