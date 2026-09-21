import React, { useState, useEffect, useCallback } from 'react';
import SectionTitle from '../components/SectionTitle';
import MovieCard from '../components/MovieCard';
import VibeEvolution from '../components/VibeEvolution';
import UserProfileCard from '../components/UserProfileCard';
import {
  getUserUniverse,
  getVibeEvolution,
  getMovies,
  getUserTasteRecommendations,
  getStoredWatchlist,
  getStoredWatched,
  getStoredRatings,
  toggleWatchlist,
  rateMovie,
  markMovieWatched,
  MOVIES,
  MOCK_VIBE_USERS,
} from '../services/api';

import {
  Bookmark,
  Clock,
  Orbit,
  Settings,
  Users,
  BarChart3,
  User,
  LogIn,
  Sparkles,
  RefreshCw,
  Star,
  ShieldCheck,
  ArrowUpRight,
  Compass,
  CheckCircle2,
  Film,
} from 'lucide-react';

export default function MyUniverse({ onSelectMovie }) {
  const [universeData, setUniverseData] = useState(null);
  const [evolutionData, setEvolutionData] = useState([]);
  const [isGuest, setIsGuest] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [allMovies, setAllMovies] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [watchedIds, setWatchedIds] = useState([]);
  const [ratings, setRatings] = useState({});

  const [tasteRecs, setTasteRecs] = useState([]);
  const [loadingTaste, setLoadingTaste] = useState(false);
  const [tasteError, setTasteError] = useState('');

  // ==========================================
  // FETCH TASTE CENTROID RECOMMENDATIONS
  // ==========================================
  const loadTasteCentroid = useCallback(async (currentWList, currentWatched, currentRatings) => {
    try {
      setLoadingTaste(true);
      setTasteError('');

      const effectiveWatchlist = currentWList || getStoredWatchlist();
      const effectiveWatched = currentWatched || getStoredWatched();
      const effectiveRatings = currentRatings || getStoredRatings();

      const recs = await getUserTasteRecommendations({
        likedIds: effectiveWatchlist,
        watchedIds: effectiveWatched,
        ratings: effectiveRatings,
        topN: 6,
      });

      setTasteRecs(recs);
    } catch (err) {
      console.error('Failed to calculate Taste Centroid recommendations:', err);
      setTasteError('Unable to compute taste centroid from local hybrid engine.');
    } finally {
      setLoadingTaste(false);
    }
  }, []);

  // ==========================================
  // LOAD USER UNIVERSE & INITIAL DATA
  // ==========================================
  useEffect(() => {
    async function load() {
      try {
        const savedUser = localStorage.getItem('vyora_user');

        if (!savedUser) {
          setIsGuest(true);
          setUniverseData(null);
          return;
        }

        let loggedInUser;
        try {
          loggedInUser = JSON.parse(savedUser);
        } catch {
          localStorage.removeItem('vyora_user');
          setIsGuest(true);
          setUniverseData(null);
          return;
        }

        const initialWatchlist = getStoredWatchlist();
        const initialWatched = getStoredWatched();
        const initialRatings = getStoredRatings();

        setWatchlistIds(initialWatchlist);
        setWatchedIds(initialWatched);
        setRatings(initialRatings);

        // Fetch backend movies, universe structure, and vibe evolution in parallel
        const [moviesList, data, evo] = await Promise.all([
          getMovies().catch(() => MOVIES),
          getUserUniverse().catch(() => ({})),
          getVibeEvolution().catch(() => []),
        ]);

        setAllMovies(Array.isArray(moviesList) && moviesList.length > 0 ? moviesList : MOVIES);

        if (data && data.profile) {
          data.profile = {
            ...data.profile,
            name: loggedInUser.name || 'VYORA Cinephile',
            username: loggedInUser.email ? `@${loggedInUser.email.split('@')[0]}` : '@cinephile',
            email: loggedInUser.email || '',
            bio: data.profile?.bio || 'Curating my cinematic multiverse with local vector math.',
          };
        }

        setIsGuest(false);
        setUniverseData(data);
        setEvolutionData(evo);

        // Compute taste centroid using local FastAPI engine
        await loadTasteCentroid(initialWatchlist, initialWatched, initialRatings);
      } catch (error) {
        console.error('Failed to load My Universe:', error);
        setUniverseData(null);
      }
    }

    load();
  }, [loadTasteCentroid]);

  // ==========================================
  // SYNC WITH LOCAL STORAGE EVENTS
  // ==========================================
  useEffect(() => {
    const handleWatchlistChange = (e) => {
      const updated = e.detail?.watchlist || getStoredWatchlist();
      setWatchlistIds(updated);
      loadTasteCentroid(updated, watchedIds, ratings);
    };

    const handleWatchedChange = (e) => {
      const updated = e.detail?.watchedList || getStoredWatched();
      setWatchedIds(updated);
      loadTasteCentroid(watchlistIds, updated, ratings);
    };

    const handleRatingsChange = (e) => {
      const updated = e.detail?.ratings || getStoredRatings();
      setRatings(updated);
      loadTasteCentroid(watchlistIds, watchedIds, updated);
    };

    window.addEventListener('vyora_watchlist_updated', handleWatchlistChange);
    window.addEventListener('vyora_watched_updated', handleWatchedChange);
    window.addEventListener('vyora_ratings_updated', handleRatingsChange);

    return () => {
      window.removeEventListener('vyora_watchlist_updated', handleWatchlistChange);
      window.removeEventListener('vyora_watched_updated', handleWatchedChange);
      window.removeEventListener('vyora_ratings_updated', handleRatingsChange);
    };
  }, [watchlistIds, watchedIds, ratings, loadTasteCentroid]);

  const handleExploreSampleUniverse = () => {
    localStorage.setItem(
      'vyora_user',
      JSON.stringify({
        name: 'Diya & Yatharth',
        email: 'cinephile@vyora.ai',
      })
    );
    setIsGuest(false);
    window.location.reload();
  };

  const handleToggleWatchlist = async (movieId) => {
    await toggleWatchlist(movieId);
  };

  // ==========================================
  // GUEST SCREEN
  // ==========================================
  if (isGuest || !universeData) {
    return (
      <main
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '80px 24px',
        }}
      >
        <SectionTitle
          badgeText="PERSONAL COSMOS"
          title="MY UNIVERSE"
          subtitle="Your unique film identity mapped through watched history, genre affinity vectors, and taste evolution."
        />

        <div
          style={{
            minHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: '6px',
            padding: '48px 32px',
            marginTop: '40px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(201, 87, 44, 0.12)',
              color: 'var(--accent-burnt-orange)',
              marginBottom: '20px',
            }}
          >
            <User size={32} />
          </div>

          <h2
            className="heading-editorial"
            style={{
              fontSize: '2rem',
              color: 'var(--text-charcoal)',
              marginBottom: '12px',
            }}
          >
            Guest Discovery Mode
          </h2>

          <p
            style={{
              maxWidth: '520px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '28px',
              fontSize: '0.95rem',
            }}
          >
            You are exploring VYORA in guest mode. Sign in to activate your taste centroid, save watchlist titles, and compute multi-dimensional recommendations.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                localStorage.removeItem('vyora_guest');
                window.dispatchEvent(new CustomEvent('open-auth-modal'));
              }}
              className="btn-cinematic-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <LogIn size={17} />
              <span>SIGN IN / CREATE PROFILE</span>
            </button>

            <button
              onClick={handleExploreSampleUniverse}
              className="btn-cinematic-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} color="var(--accent-burnt-orange)" />
              <span>EXPLORE SAMPLE CINEPHILE UNIVERSE</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // DERIVED DATA
  // ==========================================
  const { profile, stats, topGenres } = universeData;
  const moviePool = allMovies.length > 0 ? allMovies : MOVIES;

  const watchlistMovies = moviePool.filter((m) => watchlistIds.includes(m.id));
  const recentlyWatchedMovies = moviePool.filter((m) => watchedIds.includes(m.id));

  // ==========================================
  // MAIN UI
  // ==========================================
  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px 24px' }}>
      {/* Page Header */}
      <SectionTitle
        badgeText="PERSONAL COSMOS"
        title="MY UNIVERSE"
        subtitle="Your unique film identity mapped through watched history, taste centroid vectors, and mathematical recommendations."
      />

      {/* ======================================
          PROFILE CARD
      ======================================= */}
      <div
        style={{
          padding: '32px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '6px',
          marginBottom: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img
            src={profile.avatar}
            alt={profile.name}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--accent-burnt-orange)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="heading-editorial" style={{ fontSize: '2.2rem', color: 'var(--text-charcoal)', margin: 0 }}>
                {profile.name}
              </h1>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-burnt-orange)', fontWeight: 'bold' }}>
                {profile.username}
              </span>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
              "{profile.bio}"
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => loadTasteCentroid()}
            className="btn-cinematic-secondary"
            style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loadingTaste ? 'animate-spin' : ''} />
            <span>Sync Engine</span>
          </button>
        </div>
      </div>

      {/* ======================================
          STATS
      ======================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        <div style={{ backgroundColor: 'var(--bg-sand)', border: '1px solid var(--border-medium)', borderRadius: '4px', padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            FILMS WATCHED
          </span>
          <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-editorial)', fontWeight: 'bold', color: 'var(--accent-burnt-orange)' }}>
            {recentlyWatchedMovies.length + 138}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Logged in your universe</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-sand)', border: '1px solid var(--border-medium)', borderRadius: '4px', padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            WATCHLIST ITEMS
          </span>
          <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-editorial)', fontWeight: 'bold', color: 'var(--accent-deep-wine)' }}>
            {watchlistMovies.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Taste centroid anchors</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-sand)', border: '1px solid var(--border-medium)', borderRadius: '4px', padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            AVERAGE RATING
          </span>
          <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-editorial)', fontWeight: 'bold', color: 'var(--highlight-gold)' }}>
            ★ {stats.averageRating || '8.4'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Critical benchmark filter</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-sand)', border: '1px solid var(--border-medium)', borderRadius: '4px', padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            TOP VIBE VECTOR
          </span>
          <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-editorial)', fontWeight: 'bold', color: 'var(--text-charcoal)', marginTop: '4px' }}>
            {stats.favoriteGenre || 'Sci-Fi / Mind-Bending'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>34% Affinity match</span>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', borderBottom: '1px solid var(--border-medium)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'YOUR VIBE OVERVIEW', icon: BarChart3 },
          { id: 'tasteCentroid', label: `✦ TASTE CENTROID (${tasteRecs.length})`, icon: Sparkles },
          { id: 'watchlist', label: `WATCHLIST (${watchlistMovies.length})`, icon: Bookmark },
          { id: 'history', label: `HISTORY (${recentlyWatchedMovies.length})`, icon: Clock },
          { id: 'evolution', label: 'VIBE EVOLUTION', icon: Orbit },
          { id: 'circle', label: 'VIBE CIRCLE', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: isActive ? 'var(--accent-burnt-orange)' : 'var(--bg-card)',
                color: isActive ? 'var(--vyora-text)' : 'var(--text-charcoal)',
                border: '1px solid var(--border-medium)',
                borderRadius: '3px',
                fontWeight: isActive ? 'bold' : '500',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================
          OVERVIEW TAB
      ======================================= */}
      {activeTab === 'overview' && (
        <>
          {/* TASTE CENTROID SPOTLIGHT CARD */}
          <div
            style={{
              padding: '28px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--accent-burnt-orange)',
              borderRadius: '6px',
              marginBottom: '40px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="stamp-badge">✦ LOCAL FASTAPI HYBRID ENGINE</span>
                  <span className="stamp-badge-gold">TASTE CENTROID SPOTLIGHT</span>
                </div>
                <h3 className="font-editorial" style={{ fontSize: '1.6rem', color: 'var(--text-charcoal)', margin: 0 }}>
                  CURATED FOR YOUR UNIVERSE
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Live algorithmic recommendations formulated from your {watchlistMovies.length} watchlist films and {recentlyWatchedMovies.length} watched history items.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('tasteCentroid')}
                className="btn-cinematic-secondary"
                style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>EXPLORE ALL {tasteRecs.length} CENTROID PICKS</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            {loadingTaste ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                <div>Computing Taste Centroid vector against full archive...</div>
              </div>
            ) : tasteRecs.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {tasteRecs.slice(0, 3).map((item) => (
                  <div
                    key={item.movie_id || item.id}
                    onClick={() => onSelectMovie && onSelectMovie(item.movie)}
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-sand)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '14px',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                    className="hover-card"
                  >
                    <img
                      src={item.movie?.poster}
                      alt={item.title}
                      style={{ width: '70px', height: '100px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              color: 'var(--accent-burnt-orange)',
                              backgroundColor: 'rgba(201, 87, 44, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '2px',
                            }}
                          >
                            {Math.round(item.finalScore)}% AFFINITY
                          </span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({item.year})</span>
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.explanation}
                        </p>
                      </div>

                      {item.primaryAnchorMovie && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-deep-wine)', fontWeight: 600, marginTop: '6px' }}>
                          ⚓ Anchored on {item.primaryAnchorMovie}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Add more films to your watchlist to form your Taste Centroid vector.
              </div>
            )}
          </div>

          {/* VIBE AFFINITY BREAKDOWN */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '4px', padding: '32px', marginBottom: '40px' }}>
            <h3 className="font-editorial" style={{ fontSize: '1.5rem', color: 'var(--text-charcoal)', marginBottom: '20px' }}>
              YOUR VIBE AFFINITY BREAKDOWN
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {topGenres.map((g) => (
                <div key={g.genre}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-charcoal)', marginBottom: '6px' }}>
                    <span>{g.genre} ({g.count} films)</span>
                    <span style={{ color: 'var(--accent-burnt-orange)', fontFamily: 'var(--font-editorial)', fontWeight: 'bold' }}>
                      {g.percentage}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-sand)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${g.percentage}%`,
                        height: '100%',
                        backgroundColor: 'var(--accent-burnt-orange)',
                        borderRadius: '2px',
                        transition: 'width 1s var(--ease-cinematic)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <VibeEvolution evolutionData={evolutionData} />
        </>
      )}

      {/* ======================================
          TASTE CENTROID FULL TAB
      ======================================= */}
      {activeTab === 'tasteCentroid' && (
        <section style={{ marginBottom: '40px' }}>
          <div
            style={{
              padding: '24px 30px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: '6px',
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="stamp-badge">✦ LOCAL HYBRID ENGINE</span>
                <span className="stamp-badge-gold">7-DIMENSIONAL MATHEMATICAL CENTROID</span>
              </div>
              <h2 className="heading-editorial" style={{ fontSize: '1.8rem', color: 'var(--text-charcoal)', margin: 0 }}>
                CURATED FOR YOUR UNIVERSE
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '6px 0 0 0', maxWidth: '700px' }}>
                Each film is mathematically scored using cosine narrative distance, Jaccard genre/mood overlap, and director affinity weighted across your personal watchlist and watch history.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadTasteCentroid()}
              disabled={loadingTaste}
              className="btn-cinematic-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={15} className={loadingTaste ? 'animate-spin' : ''} />
              <span>RE-COMPUTE CENTROID</span>
            </button>
          </div>

          {loadingTaste ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '16px' }}>
                <Sparkles size={28} color="var(--accent-burnt-orange)" />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Analyzing taste centroid vectors on FastAPI backend...</div>
            </div>
          ) : tasteRecs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
              {tasteRecs.map((item) => {
                const cand = item.movie;
                const inWList = watchlistIds.includes(cand.id);
                return (
                  <div
                    key={item.movie_id || item.id}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div>
                      {/* Top Header: Poster + Basic Details */}
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                        <img
                          src={cand.poster}
                          alt={cand.title}
                          style={{
                            width: '90px',
                            height: '130px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid var(--border-medium)',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                color: '#120A18',
                                backgroundColor: 'var(--accent-burnt-orange)',
                                padding: '3px 8px',
                                borderRadius: '3px',
                              }}
                            >
                              {Math.round(item.finalScore)}% CENTROID MATCH ✦
                            </span>

                            {item.primaryAnchorMovie && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  color: 'var(--accent-deep-wine)',
                                  backgroundColor: 'rgba(99, 44, 50, 0.1)',
                                  padding: '3px 7px',
                                  borderRadius: '3px',
                                }}
                              >
                                ⚓ {item.primaryAnchorMovie}
                              </span>
                            )}
                          </div>

                          <h3 className="heading-editorial" style={{ fontSize: '1.25rem', color: 'var(--text-charcoal)', margin: '0 0 4px 0' }}>
                            {cand.title}
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                            {cand.year} • Directed by {cand.director}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--highlight-gold)', margin: '4px 0 0 0', fontWeight: 'bold' }}>
                            ★ {cand.rating} / 10 • {cand.runtime}
                          </p>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div
                        style={{
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-sand)',
                          borderLeft: '3px solid var(--accent-burnt-orange)',
                          borderRadius: '2px',
                          fontSize: '0.82rem',
                          color: 'var(--text-charcoal)',
                          marginBottom: '14px',
                          lineHeight: 1.45,
                        }}
                      >
                        <strong>Engine Rationale:</strong> {item.explanation}
                      </div>

                      {/* Component Proximity Breakdown Chips */}
                      {item.components && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                            COMPONENT SIMILARITY METRICS:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {[
                              { label: 'Genres', val: item.components.genres },
                              { label: 'Moods', val: item.components.moods },
                              { label: 'Atmosphere', val: item.components.atmosphere },
                              { label: 'Text/Themes', val: item.components.text },
                              { label: 'DNA Metrics', val: item.components.metrics },
                              { label: 'Constellation', val: item.components.constellation },
                              { label: 'Director', val: item.components.director },
                            ]
                              .filter((c) => c.val !== undefined && c.val !== null)
                              .map((c) => (
                                <span
                                  key={c.label}
                                  style={{
                                    fontSize: '0.68rem',
                                    padding: '2px 6px',
                                    borderRadius: '2px',
                                    backgroundColor: 'var(--bg-sand)',
                                    border: '1px solid var(--border-light)',
                                    color: 'var(--text-charcoal)',
                                  }}
                                >
                                  {c.label}: <strong>{Math.round(c.val * 100)}%</strong>
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleWatchlist(cand.id)}
                        className={inWList ? 'btn-cinematic-secondary' : 'btn-cinematic-primary'}
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Bookmark size={14} fill={inWList ? 'currentColor' : 'none'} />
                        <span>{inWList ? 'IN WATCHLIST' : 'ADD TO WATCHLIST'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectMovie && onSelectMovie(cand)}
                        className="btn-cinematic-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Film size={14} />
                        <span>DETAILS</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '6px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                No taste centroid recommendations calculated yet. Add movies to your Watchlist to initiate your universe vector.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ======================================
          WATCHLIST TAB
      ======================================= */}
      {activeTab === 'watchlist' && (
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 className="font-editorial" style={{ fontSize: '1.6rem', color: 'var(--text-charcoal)', margin: 0 }}>
              YOUR WATCHLIST ({watchlistMovies.length})
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              These films anchor your personal Taste Centroid calculation.
            </span>
          </div>

          {watchlistMovies.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {watchlistMovies.map((m) => (
                <MovieCard key={m.id} movie={m} onSelectMovie={onSelectMovie} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '6px' }}>
              <Bookmark size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ color: 'var(--text-charcoal)', margin: '0 0 8px 0' }}>Your watchlist is empty</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                Add films from the Discovery catalog or your Taste Centroid recommendations to build your watchlist.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ======================================
          HISTORY TAB
      ======================================= */}
      {activeTab === 'history' && (
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 className="font-editorial" style={{ fontSize: '1.6rem', color: 'var(--text-charcoal)', margin: 0 }}>
              RECENT WATCH HISTORY ({recentlyWatchedMovies.length})
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Completed films that weight your taste trajectory.
            </span>
          </div>

          {recentlyWatchedMovies.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {recentlyWatchedMovies.map((m) => (
                <MovieCard key={m.id} movie={m} onSelectMovie={onSelectMovie} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '6px' }}>
              <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ color: 'var(--text-charcoal)', margin: '0 0 8px 0' }}>No films logged yet</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Mark films as watched in movie details to populate your watch history.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ======================================
          EVOLUTION TAB
      ======================================= */}
      {activeTab === 'evolution' && (
        <section style={{ marginBottom: '40px' }}>
          <VibeEvolution evolutionData={evolutionData} />
        </section>
      )}

      {/* ======================================
          VIBE CIRCLE TAB
      ======================================= */}
      {activeTab === 'circle' && (
        <section style={{ marginBottom: '40px' }}>
          <h3 className="font-editorial" style={{ fontSize: '1.6rem', color: 'var(--text-charcoal)', marginBottom: '20px' }}>
            YOUR VIBE CIRCLE MEMBERS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {MOCK_VIBE_USERS.filter((u) => u.isCircleMember).map((u) => (
              <UserProfileCard key={u.id} user={u} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}