import React, { useState, useEffect } from 'react';
import MoodSelector from '../components/MoodSelector';
import VibeMixer from '../components/VibeMixer';
import MovieGrid from '../components/MovieGrid';
import VibeDrop from '../components/VibeDrop';
import SharedVibes from '../components/SharedVibes';
import SectionTitle from '../components/SectionTitle';
import {
  getMovies,
  getMoods,
  getSharedVibes,
  getVibeMixerRecommendations,
  getMoodRecommendations,
} from '../services/api';
import {
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export default function Home({ onSelectMovie }) {
  const [movies, setMovies] = useState([]);
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [sharedVibeData, setSharedVibeData] = useState(null);
  const [showMixer, setShowMixer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMixing, setIsMixing] = useState(false);
  const [activeMode, setActiveMode] = useState('all'); // 'all' | 'mood' | 'vibeMixer'
  const [activeMixDetails, setActiveMixDetails] = useState(null);
  const [error, setError] = useState('');

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const allMovies = await getMovies();
        const allMoods = await getMoods();
        const shared = await getSharedVibes('aarav-sci-fi');

        setMovies(allMovies);
        setMoods(allMoods);
        setSharedVibeData(shared);
      } catch (err) {
        console.error('Failed to load home data:', err);
        setError(
          'Unable to load movie recommendations. Please make sure the backend is running.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Select a mood and get matching movies via algorithmic mood engine
  const handleSelectMood = async (mood) => {
    try {
      setError('');

      if (selectedMood?.id === mood.id) {
        await handleResetFilters();
        return;
      }

      setSelectedMood(mood);
      setActiveMode('mood');
      setActiveMixDetails(null);
      setLoading(true);

      // Call backend algorithmic mood recommendations endpoint
      const moodRecommendations = await getMoodRecommendations(mood.id);
      const rankedMovies = moodRecommendations.map((item) => item.movie);

      setMovies(rankedMovies);
      setLoading(false);

      // Smooth scroll to recommendations
      const el = document.getElementById('recommendations');
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    } catch (err) {
      console.error('Failed to load mood recommendations from engine:', err);
      setError('Could not load recommendations for this mood.');
      setLoading(false);
    }
  };

  // Reset mood & filters back to complete library
  const handleResetFilters = async () => {
    try {
      setSelectedMood(null);
      setActiveMode('all');
      setActiveMixDetails(null);
      setLoading(true);
      setError('');

      const allMovies = await getMovies({
        sortBy: 'rating',
      });

      setMovies(allMovies);
    } catch (err) {
      console.error('Failed to reset recommendations:', err);
      setError('Could not reload the movie library.');
    } finally {
      setLoading(false);
    }
  };

  // Vibe Mixer - Connected to FastAPI 7-dimensional sensory engine
  const handleMixVibe = async (mixDimensions) => {
    try {
      setIsMixing(true);
      setError('');

      // Call backend FastAPI hybrid vibe recommendation engine
      const vibeRecommendations = await getVibeMixerRecommendations(mixDimensions);
      const rankedMovies = vibeRecommendations.map((item) => item.movie);

      setMovies(rankedMovies);
      setActiveMode('vibeMixer');
      setActiveMixDetails(mixDimensions);
      setSelectedMood(null);
      setIsMixing(false);

      const el = document.getElementById('recommendations');
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    } catch (err) {
      console.error('Failed to mix vibe via backend engine:', err);
      setError('Could not generate your hybrid vibe recommendations. Ensure backend is running.');
      setIsMixing(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '30px 16px 80px 16px',
      }}
    >
      {/* Top Banner Header */}
      <div
        style={{
          marginBottom: '40px',
          textAlign: 'center',
        }}
      >
        <div
          className="seq-item seq-delay-1"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: 'var(--bg-sand)',
            borderRadius: '2px',
            marginBottom: '12px',
          }}
        >
          <Sparkles
            size={16}
            color="var(--accent-burnt-orange)"
          />

          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-burnt-orange)',
              fontWeight: 'bold',
            }}
          >
            🎬 REEL VIBE MOVIE DISCOVERY
          </span>
        </div>

        <h1
          className="heading-editorial seq-item seq-delay-2"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
            color: 'var(--text-charcoal)',
            marginBottom: '8px',
          }}
        >
          WHAT'S YOUR VIBE TODAY?
        </h1>

        <p
          className="seq-item seq-delay-3"
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto 24px auto',
          }}
        >
          Select an emotional state or fine-tune sensory
          dimensions to generate personalized film
          recommendations.
        </p>

        {/* Toggle Vibe Mixer */}
        <button
          type="button"
          onClick={() =>
            setShowMixer(!showMixer)
          }
          className="btn-cinematic-secondary seq-item seq-delay-4"
          style={{
            fontSize: '0.85rem',
            padding: '10px 20px',
          }}
        >
          <SlidersHorizontal size={15} />

          <span>
            {showMixer
              ? 'HIDE VIBE MIXER'
              : 'OPEN VIBE MIXER SLIDERS'}
          </span>
        </button>
      </div>

      {/* Vibe Mixer */}
      {showMixer && (
        <div className="animate-fade-in">
          <VibeMixer
            onMixVibe={handleMixVibe}
            isMixing={isMixing}
          />
        </div>
      )}

      {/* Mood Selector */}
      <div className="seq-item seq-delay-5">
        <MoodSelector
          moods={moods}
          selectedMood={selectedMood}
          onSelectMood={handleSelectMood}
          onResetMood={handleResetFilters}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            margin: '24px 0',
            padding: '16px 20px',
            border: '1px solid var(--accent-burnt-orange)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-charcoal)',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {/* Recommendations */}
      <section
        id="recommendations"
        style={{
          marginBottom: '60px',
        }}
      >
        {/* Active Filter Mode Banner / Controls */}
        {activeMode === 'vibeMixer' && (
          <div
            className="animate-fade-in"
            style={{
              padding: '20px 24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--accent-burnt-orange)',
              borderRadius: '6px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="stamp-badge">✦ LOCAL HYBRID ENGINE</span>
                <span className="stamp-badge-gold">7-DIMENSIONAL VIBE TUNING ACTIVE</span>
              </div>
              <h3 className="heading-editorial" style={{ fontSize: '1.4rem', color: 'var(--text-charcoal)', margin: 0 }}>
                TAILORED BY YOUR VIBE MIXER
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Displaying films mathematically ranked by proximity to your exact sensory slider vectors.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-cinematic-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
            >
              <RotateCcw size={14} />
              <span>RESET TO ALL MOVIES</span>
            </button>
          </div>
        )}

        {activeMode === 'mood' && selectedMood && (
          <div
            className="animate-fade-in"
            style={{
              padding: '20px 24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="stamp-badge">✦ LOCAL HYBRID ENGINE</span>
                <span className="stamp-badge-wine">ALGORITHMIC MOOD RANKING</span>
              </div>
              <h3 className="heading-editorial" style={{ fontSize: '1.4rem', color: 'var(--text-charcoal)', margin: 0 }}>
                CURATED FOR: {selectedMood.title.toUpperCase()}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Ranked by emotional resonance, atmospheric DNA overlap, and critical benchmark metrics.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-cinematic-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
            >
              <RotateCcw size={14} />
              <span>CLEAR MOOD FILTER</span>
            </button>
          </div>
        )}

        <SectionTitle
          badgeText={activeMode === 'vibeMixer' ? "SENSORY VECTORS" : activeMode === 'mood' ? "MOOD CURATION" : "YOUR VIBE MATCHES"}
          title={activeMode === 'vibeMixer' ? "VIBE MIXER PICKS" : activeMode === 'mood' ? `RECOMMENDED: ${selectedMood?.title || ''}` : "RECOMMENDED FOR YOUR MOOD"}
          subtitle="Editorial film cards complete with vector match percentages, atmosphere tags, and VYORA'S TAKE."
        />

        {loading ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '12px' }}>
              <Sparkles size={24} color="var(--accent-burnt-orange)" />
            </div>
            <div>Calculating hybrid recommendations with FastAPI engine...</div>
          </div>
        ) : (
          <MovieGrid
            movies={movies}
            selectedMood={selectedMood}
            onSelectMovie={onSelectMovie}
            isPreFiltered={activeMode !== 'all'}
          />
        )}
      </section>

      {/* Vibe Drop */}
      <VibeDrop
        movies={movies}
        onSelectMovie={onSelectMovie}
      />

      {/* Vibe Exchange Preview */}
      <section
        style={{
          marginTop: '60px',
        }}
      >
        <SectionTitle
          badgeText="VIBE EXCHANGE"
          title="RECOMMENDED FROM YOUR CIRCLE"
          subtitle="Discover films recommended through collaborative taste matching with people in your Vibe Circle."
        />

        <SharedVibes
          sharedData={sharedVibeData}
          movies={movies}
          onSelectMovie={onSelectMovie}
        />
      </section>
    </main>
  );
}