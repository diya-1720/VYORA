import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import VibeLibraryPage from './pages/VibeLibraryPage';
import VibeCirclePage from './pages/VibeCirclePage';
import PublicProfilePage from './pages/PublicProfilePage';
import MovieDetails from './pages/MovieDetails';
import MyUniverse from './pages/MyUniverse';

import MovieDetailsModal from './components/MovieDetailsModal';
import AuthPromptModal from './components/AuthPromptModal';
import IntroSplashScreen from './components/IntroSplashScreen';
import CinematicBackground from './components/CinematicBackground';

import { searchMovies, getMovieById } from './services/api';

import { Search, X, Star, ChevronUp } from 'lucide-react';

// Scroll to top helper on route change
function ScrollToTopOnRoute() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem('vyora_theme') ||
      'night'
    );
  });

  const [activeModalMovie, setActiveModalMovie] =
    useState(null);

  const [isSearchOpen, setIsSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [searchResults, setSearchResults] =
    useState([]);

  const [isSearching, setIsSearching] =
    useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] =
    useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Optimized scroll position listener for Scroll-To-Top button
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowScrollTop((prev) => {
            const next = window.scrollY > 350;
            return prev !== next ? next : prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      theme
    );

    localStorage.setItem(
      'vyora_theme',
      theme
    );
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'day' ? 'night' : 'day'
    );
  };

  // Backend-powered global search
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);

        const results =
          await searchMovies(query);

        if (!cancelled) {
          setSearchResults(
            Array.isArray(results)
              ? results
              : []
          );
        }
      } catch (error) {
        console.error(
          'Global search failed:',
          error
        );

        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Select movie from anywhere
  const handleSelectMovie = (movie) => {
    setActiveModalMovie(movie);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Select connected movie from movie details
  const handleSelectConnectedMovie = async (
    movieId
  ) => {
    try {
      const connected =
        await getMovieById(movieId);

      if (connected) {
        setActiveModalMovie(connected);
      }
    } catch (error) {
      console.error(
        'Failed to load connected movie:',
        error
      );
    }
  };

  return (
    <Router>
      <ScrollToTopOnRoute />
      {showIntro && <IntroSplashScreen onComplete={() => setShowIntro(false)} />}
      <div
        className={
          theme === 'night'
            ? 'theme-night'
            : 'theme-day'
        }
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-charcoal)',
          position: 'relative',
          transition:
            'background-color 0.4s ease, color 0.4s ease',
        }}
      >
        {/* CINEMATIC LIVING BACKGROUND */}
        <CinematicBackground theme={theme} />

        {/* NAVBAR */}
        <Navbar
          onOpenSearch={() =>
            setIsSearchOpen(true)
          }
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* GLOBAL SEARCH */}
        {isSearchOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 3000,
              backgroundColor:
                'rgba(24, 13, 26, 0.82)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '80px',
              paddingLeft: '16px',
              paddingRight: '16px',
            }}
            onClick={() =>
              setIsSearchOpen(false)
            }
          >
            <div
              onClick={(e) =>
                e.stopPropagation()
              }
              style={{
                width: '100%',
                maxWidth: '640px',
                backgroundColor:
                  'var(--bg-card)',
                border:
                  '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '24px',
                boxShadow:
                  'var(--shadow-lg)',
              }}
              className="animate-fade-in"
            >
              {/* SEARCH INPUT */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexGrow: 1,
                  }}
                >
                  <Search
                    size={20}
                    color="var(--accent-burnt-orange)"
                  />

                  <input
                    type="text"
                    placeholder="Search your next obsession..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    autoFocus
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      backgroundColor:
                        'transparent',
                      fontSize: '1.1rem',
                      fontFamily:
                        'var(--font-sans)',
                      color:
                        'var(--text-charcoal)',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsSearchOpen(false)
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color:
                      'var(--text-muted)',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* SEARCH RESULTS */}
              <div
                style={{
                  borderTop:
                    '1px solid var(--border-light)',
                  paddingTop: '16px',
                }}
              >
                {isSearching ? (
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color:
                        'var(--text-muted)',
                      margin: 0,
                      textAlign: 'center',
                      padding: '20px',
                    }}
                  >
                    Searching the VYORA film
                    archive...
                  </p>
                ) : searchResults.length >
                  0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection:
                        'column',
                      gap: '10px',
                      maxHeight: '360px',
                      overflowY: 'auto',
                    }}
                  >
                    {searchResults.map(
                      (movie) => (
                        <div
                          key={movie.id}
                          onClick={() =>
                            handleSelectMovie(
                              movie
                            )
                          }
                          style={{
                            display: 'flex',
                            alignItems:
                              'center',
                            gap: '14px',
                            padding: '10px',
                            backgroundColor:
                              'var(--bg-sand)',
                            borderRadius:
                              '3px',
                            cursor:
                              'pointer',
                            transition:
                              'background 0.2s ease',
                          }}
                        >
                          <img
                            src={movie.poster}
                            alt={
                              movie.title
                            }
                            style={{
                              width: '40px',
                              height: '56px',
                              objectFit:
                                'cover',
                              borderRadius:
                                '2px',
                            }}
                          />

                          <div
                            style={{
                              flexGrow: 1,
                            }}
                          >
                            <span
                              style={{
                                fontSize:
                                  '1rem',
                                fontWeight:
                                  'bold',
                                color:
                                  'var(--text-charcoal)',
                                display:
                                  'block',
                              }}
                            >
                              {movie.title}{' '}
                              (
                              {movie.year}
                              )
                            </span>

                            <span
                              style={{
                                fontSize:
                                  '0.78rem',
                                color:
                                  'var(--text-muted)',
                              }}
                            >
                              {movie.director}
                              {' • '}
                              {movie.genres?.join(
                                ', '
                              )}
                            </span>
                          </div>

                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '4px',
                              color:
                                'var(--highlight-gold)',
                            }}
                          >
                            <Star
                              size={14}
                              fill="var(--highlight-gold)"
                            />

                            <span
                              style={{
                                fontSize:
                                  '0.85rem',
                                fontWeight:
                                  'bold',
                              }}
                            >
                              {movie.rating}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : searchQuery ? (
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color:
                        'var(--text-muted)',
                      margin: 0,
                      textAlign:
                        'center',
                      padding: '20px',
                    }}
                  >
                    No films found matching
                    "{searchQuery}".
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color:
                        'var(--text-muted)',
                      margin: 0,
                      textAlign:
                        'center',
                      padding: '12px',
                    }}
                  >
                    Type a query to search
                    the VYORA film archive.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ROUTES */}
        <div
          style={{
            flexGrow: 1,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  onSignIn={() =>
                    setIsAuthModalOpen(
                      true
                    )
                  }
                />
              }
            />

            <Route
              path="/movie-home"
              element={
                <Home
                  onSelectMovie={
                    handleSelectMovie
                  }
                />
              }
            />

            <Route
              path="/library"
              element={
                <VibeLibraryPage
                  onSelectMovie={
                    handleSelectMovie
                  }
                />
              }
            />

            <Route
              path="/circle"
              element={
                <VibeCirclePage
                  onSelectMovie={
                    handleSelectMovie
                  }
                />
              }
            />

            <Route
              path="/user/:id"
              element={
                <PublicProfilePage
                  onSelectMovie={
                    handleSelectMovie
                  }
                />
              }
            />

            <Route
              path="/movie/:id"
              element={
                <MovieDetails
                  onSelectMovie={
                    handleSelectMovie
                  }
                />
              }
            />

            <Route
              path="/universe"
              element={
                <MyUniverse
                  onSelectMovie={
                    handleSelectMovie
                  }
                />
              }
            />
          </Routes>
        </div>

        {/* FLOATING SCROLL-TO-TOP ACTION BUTTON */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="scroll-to-top-btn animate-fade-in"
            aria-label="Scroll to top of page"
            title="Scroll to top"
          >
            <ChevronUp size={22} />
          </button>
        )}

        {/* MOVIE DETAILS MODAL */}
        {activeModalMovie && (
          <MovieDetailsModal
            movie={activeModalMovie}
            onClose={() =>
              setActiveModalMovie(null)
            }
            onSelectConnectedMovie={
              handleSelectConnectedMovie
            }
          />
        )}

        {/* AUTH MODAL */}
        <AuthPromptModal
          isOpen={isAuthModalOpen}
          onClose={() =>
            setIsAuthModalOpen(false)
          }
        />

        {/* FOOTER */}
        <Footer />
      </div>
    </Router>
  );
}