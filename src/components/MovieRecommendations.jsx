import React, { useState, useEffect, useCallback } from 'react';
import { getHybridMovieRecommendations } from '../services/api';
import { Sparkles, RefreshCw, AlertCircle, Star, ArrowUpRight, ShieldCheck, Film } from 'lucide-react';

export default function MovieRecommendations({
  currentMovie,
  onSelectMovie,
  compact = false,
}) {
  const movieId = currentMovie?.id;
  const movieTitle = currentMovie?.title || 'Selected Title';

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(compact ? 4 : 6);
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const fetchRecommendations = useCallback(async (signal) => {
    if (!movieId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getHybridMovieRecommendations(movieId, topN, signal);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Hybrid recommendations error:', err);
      setError(err.message || 'Unable to load hybrid recommendations.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [movieId, topN]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRecommendations(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchRecommendations]);

  if (!movieId) return null;

  return (
    <section
      aria-label="Recommended For You"
      style={{
        marginTop: compact ? '24px' : '48px',
        marginBottom: compact ? '20px' : '48px',
        padding: compact ? '0' : '8px 0',
      }}
    >
      {/* SECTION HEADER */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          gap: '12px',
        }}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="stamp-badge">
              <Sparkles size={12} />
              HYBRID SIMILARITY ENGINE
            </span>
            <span className="stamp-badge-gold">
              7-DIMENSIONAL DNA MATCH
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2
                className="heading-editorial"
                style={{
                  fontSize: compact ? '1.6rem' : 'clamp(1.8rem, 3.2vw, 2.4rem)',
                  color: 'var(--vyora-text)',
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                RECOMMENDED FOR YOU
              </h2>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--vyora-text-muted)',
                  marginTop: '4px',
                  marginBottom: 0,
                }}
              >
                Titles mathematically resonant with{' '}
                <span style={{ color: 'var(--vyora-accent)', fontWeight: 600 }}>
                  "{movieTitle}"
                </span>{' '}
                across narrative, mood, director, and atmosphere vectors.
              </p>
            </div>

            {/* TOP_N SELECTOR CONTROLS */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--vyora-bg-secondary)',
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid var(--vyora-border)',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--vyora-text-muted)',
                  padding: '0 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                SHOW:
              </span>
              {[
                { label: 'Top 4', val: 4 },
                { label: 'Top 6', val: 6 },
                { label: 'Top 8', val: 8 },
                { label: 'All', val: null },
              ].map(({ label, val }) => {
                const isActive = topN === val;
                return (
                  <button
                    key={label}
                    onClick={() => setTopN(val)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '3px',
                      border: isActive ? '1px solid var(--vyora-accent)' : '1px solid transparent',
                      backgroundColor: isActive ? 'var(--vyora-accent)' : 'transparent',
                      color: isActive ? '#120A18' : 'var(--vyora-text)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* STATE 1: LOADING */}
      {loading && (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: 'var(--vyora-surface)',
            border: '1px dashed var(--vyora-border-strong)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid var(--vyora-border)',
              borderTopColor: 'var(--vyora-accent)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div>
            <h3
              className="font-editorial text-shimmer"
              style={{ fontSize: '1.25rem', marginBottom: '4px' }}
            >
              Decoding Film DNA Vectors...
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--vyora-text-muted)', margin: 0 }}>
              Calculating hybrid similarity vectors for "{movieTitle}" across 7 normalized dimensions.
            </p>
          </div>
        </div>
      )}

      {/* STATE 2: ERROR */}
      {!loading && error && (
        <div
          style={{
            padding: '24px 28px',
            backgroundColor: 'rgba(228, 107, 168, 0.08)',
            border: '1px solid var(--vyora-accent-secondary)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <AlertCircle size={24} color="var(--vyora-accent-secondary)" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: 0, color: 'var(--vyora-text)', fontSize: '1rem', fontWeight: 600 }}>
                Unable to load recommendations
              </h4>
              <p style={{ margin: '4px 0 0 0', color: 'var(--vyora-text-muted)', fontSize: '0.84rem' }}>
                {error}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchRecommendations()}
            className="btn-cinematic-secondary"
            style={{ padding: '8px 18px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} />
            <span>TRY AGAIN</span>
          </button>
        </div>
      )}

      {/* STATE 3: EMPTY RESULTS */}
      {!loading && !error && recommendations.length === 0 && (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: 'var(--vyora-surface)',
            border: '1px dashed var(--vyora-border-strong)',
            borderRadius: '6px',
          }}
        >
          <Film size={32} color="var(--vyora-accent)" style={{ marginBottom: '12px' }} />
          <h3 className="font-editorial" style={{ fontSize: '1.3rem', color: 'var(--vyora-text)', marginBottom: '6px' }}>
            No hybrid matches found
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--vyora-text-muted)', maxWidth: '440px', margin: '0 auto' }}>
            There are currently no resonant film vectors computed for this title in the archive.
          </p>
        </div>
      )}

      {/* STATE 4: SUCCESSFUL RESULTS GRID */}
      {!loading && !error && recommendations.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact
              ? 'repeat(auto-fill, minmax(200px, 1fr))'
              : 'repeat(auto-fill, minmax(clamp(220px, 28vw, 290px), 1fr))',
            gap: '20px',
          }}
        >
          {recommendations.map((rec) => {
            const candidate = rec.movie || {};
            const recId = rec.movie_id || candidate.id || rec.id;
            const recTitle = rec.title || candidate.title;
            const recYear = rec.year || candidate.year;
            const recScore = Math.round(rec.final_similarity_score || rec.finalScore || 0);
            const explanation = rec.explanation || 'Resonant thematic compatibility.';
            const comps = rec.component_scores || rec.components || {};
            const posterUrl = candidate.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800';
            const isHovered = hoveredCardId === recId;

            return (
              <div
                key={recId}
                onMouseEnter={() => setHoveredCardId(recId)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => onSelectMovie && onSelectMovie(candidate)}
                className="gpu-accelerated"
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--vyora-surface)',
                  border: isHovered ? '1px solid var(--vyora-accent)' : '1px solid var(--vyora-border-strong)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.35s var(--ease-cinematic), box-shadow 0.35s var(--ease-cinematic), border-color 0.3s ease',
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isHovered ? 'var(--shadow-md), var(--vyora-glow)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  userSelect: 'none',
                }}
              >
                {/* POSTER CONTAINER */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '135%',
                    overflow: 'hidden',
                    backgroundColor: 'var(--vyora-bg-secondary)',
                  }}
                >
                  <img
                    src={posterUrl}
                    alt={`${recTitle} poster`}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s var(--ease-cinematic)',
                      transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                    }}
                  />

                  {/* OVERLAY WITH MATCH BADGE */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: isHovered
                        ? 'linear-gradient(to top, rgba(18, 10, 24, 0.95) 0%, rgba(18, 10, 24, 0.35) 60%, transparent 100%)'
                        : 'linear-gradient(to top, rgba(18, 10, 24, 0.8) 0%, transparent 55%)',
                      transition: 'opacity 0.4s ease',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--vyora-accent)',
                          color: '#120A18',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: 'var(--vyora-glow)',
                        }}
                      >
                        <ShieldCheck size={11} />
                        {recScore}% MATCH ✦
                      </span>

                      {candidate.rating && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: 'rgba(18, 10, 24, 0.85)',
                            backdropFilter: 'blur(4px)',
                            padding: '3px 7px',
                            borderRadius: '3px',
                            border: '1px solid rgba(231, 196, 106, 0.4)',
                          }}
                        >
                          <Star size={11} fill="var(--vyora-gold)" color="var(--vyora-gold)" />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--vyora-gold)' }}>
                            {candidate.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(239, 231, 219, 0.15)',
                        paddingTop: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--vyora-gold)', fontWeight: 'bold' }}>
                        ✦ VIEW DETAILS & DNA
                      </span>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--vyora-accent)',
                          color: '#120A18',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ArrowUpRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD BODY */}
                <div
                  style={{
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flexGrow: 1,
                    gap: '10px',
                  }}
                >
                  <div>
                    {/* Genres */}
                    {candidate.genres && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        {candidate.genres.slice(0, 2).map((g) => (
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
                              borderRadius: '2px',
                            }}
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title & Year */}
                    <h3
                      className="font-display"
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 400,
                        color: 'var(--vyora-text)',
                        lineHeight: 1.15,
                        marginBottom: '4px',
                      }}
                    >
                      {recTitle}{' '}
                      <span style={{ fontSize: '0.8em', color: 'var(--vyora-text-muted)' }}>
                        ({recYear})
                      </span>
                    </h3>

                    {candidate.director && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--vyora-text-muted)', margin: 0 }}>
                        Directed by {candidate.director}
                      </p>
                    )}
                  </div>

                  {/* AI EXPLANATION SNIPPET */}
                  <div
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'var(--vyora-bg-secondary)',
                      borderRadius: '3px',
                      borderLeft: '2px solid var(--vyora-accent)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <Sparkles size={11} color="var(--vyora-accent)" />
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--vyora-accent)',
                        }}
                      >
                        WHY THIS MATCHES
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.74rem',
                        color: 'var(--vyora-text)',
                        lineHeight: 1.4,
                        margin: 0,
                      }}
                    >
                      {explanation}
                    </p>
                  </div>

                  {/* COMPONENT SCORES HIGHLIGHTS */}
                  {comps && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        paddingTop: '8px',
                        borderTop: '1px dashed var(--vyora-border)',
                        fontSize: '0.68rem',
                        color: 'var(--vyora-text-muted)',
                      }}
                    >
                      <span>
                        Genres: <strong style={{ color: 'var(--vyora-text)' }}>{Math.round((comps.genres || 0) * 100)}%</strong>
                      </span>
                      <span>
                        Moods: <strong style={{ color: 'var(--vyora-text)' }}>{Math.round((comps.moods || 0) * 100)}%</strong>
                      </span>
                      {comps.director > 0 && (
                        <span>
                          Director: <strong style={{ color: 'var(--vyora-gold)' }}>100%</strong>
                        </span>
                      )}
                      {comps.constellation > 0 && comps.director === 0 && (
                        <span>
                          Graph: <strong style={{ color: 'var(--vyora-accent)' }}>{Math.round(comps.constellation * 100)}%</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
