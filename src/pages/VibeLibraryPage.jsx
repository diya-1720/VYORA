import React, { useState, useEffect } from 'react';
import SectionTitle from '../components/SectionTitle';
import MovieGrid from '../components/MovieGrid';
import { getMovies, SUB_VIBES } from '../services/api';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function VibeLibraryPage({ onSelectMovie }) {
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('Sci-Fi');
  const [selectedSubVibe, setSelectedSubVibe] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const mainGenres = [
    'Horror',
    'Sci-Fi',
    'Romance',
    'Thriller',
    'Comedy',
    'Drama',
    'Mystery',
    'Action',
    'Animation',
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadMovies() {
      try {
        setLoading(true);
        setError('');

        const data = await getMovies({
          genre: selectedGenre,
          subVibe: selectedSubVibe,
          search: searchQuery,
          sortBy,
        });

        if (!cancelled) {
          setMovies(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load Vibe Library:', err);

        if (!cancelled) {
          setMovies([]);
          setError(
            'Unable to load movies. Please make sure the FastAPI backend is running.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(loadMovies, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    selectedGenre,
    selectedSubVibe,
    searchQuery,
    sortBy,
  ]);

  const currentSubVibes = SUB_VIBES[selectedGenre] || [];

  return (
    <main
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '30px 16px 80px 16px',
      }}
    >
      <SectionTitle
        badgeText="ARCHIVAL TAXONOMY"
        title="VIBE LIBRARY"
        subtitle="Deep exploration of films organized by major genres and nuanced sub-vibe micro-categories."
      />

      {/* TOP CONTROL BAR: SEARCH + SORT */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-card)',
          padding: '16px 20px',
          border: '1px solid var(--border-medium)',
          borderRadius: '6px',
        }}
      >
        {/* SEARCH */}
        <div
          style={{
            position: 'relative',
            flexGrow: 1,
            maxWidth: '500px',
          }}
        >
          <Search
            size={16}
            color="var(--accent-burnt-orange)"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />

          <input
            type="text"
            placeholder={`Search within ${selectedGenre}...`}
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              backgroundColor: 'var(--bg-sand)',
              border: '1px solid var(--border-medium)',
              borderRadius: '4px',
              fontSize: '0.9rem',
              color: 'var(--text-charcoal)',
              outline: 'none',
            }}
          />
        </div>

        {/* SORT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <SlidersHorizontal size={14} color="var(--accent-burnt-orange)" />
          <span
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}
          >
            Sort by:
          </span>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
            style={{
              padding: '8px 14px',
              backgroundColor: 'var(--bg-sand)',
              border: '1px solid var(--border-medium)',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: 'var(--text-charcoal)',
              cursor: 'pointer'
            }}
          >
            <option value="rating">
              Highest Rating
            </option>
            <option value="match">
              Highest Vibe Match
            </option>
            <option value="year">
              Release Year
            </option>
            <option value="title">
              Title A-Z
            </option>
          </select>
        </div>
      </div>

      {/* MAIN GENRE TABS */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '20px',
        }}
      >
        {mainGenres.map((genre) => {
          const isActive = selectedGenre === genre;

          return (
            <button
              key={genre}
              onClick={() => {
                setSelectedGenre(genre);
                setSelectedSubVibe('All');
              }}
              style={{
                padding: '8px 18px',
                backgroundColor: isActive
                  ? 'var(--accent-burnt-orange)'
                  : 'var(--bg-card)',
                color: isActive
                  ? '#120A18'
                  : 'var(--text-charcoal)',
                border: isActive
                  ? '1px solid var(--accent-burnt-orange)'
                  : '1px solid var(--border-medium)',
                borderRadius: '4px',
                fontWeight: isActive ? '700' : '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {genre.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* SUB-VIBE FILTERS */}
      {currentSubVibes.length > 0 && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--bg-sand)',
            border: '1px solid var(--border-medium)',
            borderRadius: '6px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginRight: '4px'
            }}
          >
            SUB-VIBE:
          </span>

          <button
            onClick={() => setSelectedSubVibe('All')}
            style={{
              padding: '4px 10px',
              backgroundColor:
                selectedSubVibe === 'All'
                  ? 'var(--accent-deep-wine)'
                  : 'transparent',
              color:
                selectedSubVibe === 'All'
                  ? 'var(--vyora-text)'
                  : 'var(--text-charcoal)',
              border: '1px solid var(--border-medium)',
              borderRadius: '3px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All {selectedGenre}
          </button>

          {currentSubVibes.map((subVibe) => {
            const isActive =
              selectedSubVibe === subVibe;

            return (
              <button
                key={subVibe}
                onClick={() =>
                  setSelectedSubVibe(subVibe)
                }
                style={{
                  padding: '4px 10px',
                  backgroundColor: isActive
                    ? 'var(--accent-deep-wine)'
                    : 'var(--bg-card)',
                  color: isActive
                    ? 'var(--vyora-text)'
                    : 'var(--text-charcoal)',
                  border:
                    '1px solid var(--border-medium)',
                  borderRadius: '3px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {subVibe}
              </button>
            );
          })}
        </div>
      )}

      {/* RESULT STATUS */}
      <div
        style={{
          marginBottom: '20px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600
        }}
      >
        {loading
          ? 'LOADING ARCHIVE...'
          : `SHOWING ${movies.length} FILMS`}
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid var(--accent-burnt-orange)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-charcoal)',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && !error && (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Finding films from the VYORA archive...
        </div>
      )}

      {/* NO RESULTS */}
      {!loading &&
        !error &&
        movies.length === 0 && (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              border: '1px dashed var(--border-medium)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                marginBottom: '12px',
              }}
            >
              ✦
            </div>

            <h3
              style={{
                color: 'var(--text-charcoal)',
                margin: '0 0 8px 0',
              }}
            >
              No movies found
            </h3>

            <p
              style={{
                color: 'var(--text-muted)',
                margin: 0,
              }}
            >
              Try another genre, sub-vibe, or search query.
            </p>
          </div>
        )}

      {/* MOVIES */}
      {!loading && movies.length > 0 && (
        <MovieGrid
          movies={movies}
          onSelectMovie={onSelectMovie}
        />
      )}
    </main>
  );
}