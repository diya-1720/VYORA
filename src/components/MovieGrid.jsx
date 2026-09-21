import React, { useState } from 'react';
import SectionTitle from './SectionTitle';
import MovieCard from './MovieCard';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

export default function MovieGrid({ movies, selectedMood, onSelectMovie, isPreFiltered = false }) {
  const [activeGenreFilter, setActiveGenreFilter] = useState('All');

  const genres = ['All', 'Sci-Fi', 'Drama', 'Comedy', 'Mystery', 'Adventure', 'Action'];

  const filteredMovies = movies.filter(movie => {
    const matchesGenre = activeGenreFilter === 'All' || movie.genres?.includes(activeGenreFilter);
    const matchesMood = (!selectedMood || isPreFiltered) ? true : movie.moods?.includes(selectedMood.id);
    return matchesGenre && matchesMood;
  });

  return (
    <section
      id="movie-discovery"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '30px 16px 60px 16px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px'
        }}
      >
        <SectionTitle
          badgeText="CURATED SELECTION"
          title="DISCOVER SOMETHING"
          subtitle={
            selectedMood
              ? `Showing recommendations tailored for "${selectedMood.title}"`
              : "Hand-picked cinematic masterworks decoded with vector attribute maps."
          }
        />

        {/* Genre Filter Bar - Horizontally Scrollable on Mobile */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            width: '100%',
            paddingBottom: '8px',
            marginTop: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', color: 'var(--vyora-text-muted)', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
            <SlidersHorizontal size={14} color="var(--vyora-accent)" />
            <span>GENRE:</span>
          </div>

          {genres.map(genre => {
            const isActive = activeGenreFilter === genre;
            return (
              <button
                key={genre}
                onClick={() => setActiveGenreFilter(genre)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '3px',
                  border: isActive ? '1px solid var(--vyora-accent)' : '1px solid var(--vyora-border)',
                  backgroundColor: isActive ? 'var(--vyora-accent)' : 'var(--vyora-bg-secondary)',
                  color: isActive ? '#120A18' : 'var(--vyora-text)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Movie Grid - Universal Responsiveness */}
      {filteredMovies.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px, 45vw, 240px), 1fr))',
            gap: '20px'
          }}
        >
          {filteredMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} onSelectMovie={onSelectMovie} />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            backgroundColor: 'var(--vyora-surface)',
            border: '1px dashed var(--vyora-border-strong)',
            borderRadius: '4px'
          }}
        >
          <Sparkles size={32} color="var(--vyora-accent)" style={{ marginBottom: '12px' }} />
          <h3 className="font-editorial" style={{ fontSize: '1.4rem', color: 'var(--vyora-text)', marginBottom: '8px' }}>
            No movies match this filter combination.
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--vyora-text-muted)' }}>
            Try selecting a different genre or clearing your active mood filter.
          </p>
        </div>
      )}
    </section>
  );
}
