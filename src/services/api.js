// API Service Layer for VYORA
//
// Movies are connected to the FastAPI backend.
// Discover + Random Movie + Recommendations are backend based.
// Other VYORA features remain mock-based for now.

import {
  MOVIES,
  MOODS,
  SUB_VIBES,
  MOCK_VIBE_USERS,
  SHARED_VIBES_DATA,
  MOCK_VIBE_EVOLUTION,
  MOCK_USER_UNIVERSE,
} from '../data/mockMovies';

export {
  MOVIES,
  MOODS,
  SUB_VIBES,
  MOCK_VIBE_USERS,
  SHARED_VIBES_DATA,
  MOCK_VIBE_EVOLUTION,
};

const API_BASE_URL = 'http://127.0.0.1:8000';

const delay = (ms = 120) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all movies from FastAPI
 *
 * GET /api/movies/
 */
export async function getMovies({
  genre,
  mood,
  subVibe,
  search,
  sortBy = 'rating',
} = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/movies/`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch movies');
  }

  let result = await response.json();

  // -------------------------
  // Genre Filter
  // -------------------------
  if (genre && genre !== 'All') {
    result = result.filter((movie) =>
      movie.genres?.includes(genre)
    );
  }

  // -------------------------
  // Mood Filter
  // -------------------------
  if (mood && mood !== 'All') {
    result = result.filter((movie) =>
      movie.moods?.includes(mood)
    );
  }

  // -------------------------
  // Sub-Vibe Filter
  // -------------------------
  if (subVibe && subVibe !== 'All') {
    result = result.filter(
      (movie) => movie.subVibe === subVibe
    );
  }

  // -------------------------
  // Search
  // -------------------------
  if (search) {
    const q = search.toLowerCase().trim();

    result = result.filter(
      (movie) =>
        movie.title
          ?.toLowerCase()
          .includes(q) ||
        movie.director
          ?.toLowerCase()
          .includes(q) ||
        movie.genres?.some((genreName) =>
          genreName
            .toLowerCase()
            .includes(q)
        ) ||
        movie.moods?.some((moodId) =>
          moodId
            .toLowerCase()
            .includes(q)
        )
    );
  }

  // -------------------------
  // Sorting
  // -------------------------
  if (sortBy === 'rating') {
    result.sort(
      (a, b) =>
        (b.rating || 0) -
        (a.rating || 0)
    );
  }

  if (sortBy === 'match') {
    result.sort(
      (a, b) =>
        (b.vibeMatchScore || 0) -
        (a.vibeMatchScore || 0)
    );
  }

  if (sortBy === 'year') {
    result.sort(
      (a, b) =>
        (b.year || 0) -
        (a.year || 0)
    );
  }

  if (sortBy === 'title') {
    result.sort((a, b) =>
      (a.title || '').localeCompare(
        b.title || ''
      )
    );
  }

  return result;
}

/**
 * Get movies specifically for Discover
 *
 * Uses real FastAPI movie data.
 */
export async function getDiscoverMovies({
  genre = 'All',
  mood = 'All',
  subVibe = 'All',
} = {}) {
  return getMovies({
    genre,
    mood,
    subVibe,
    sortBy: 'match',
  });
}

/**
 * Get ONE random movie from FastAPI
 *
 * GET /api/movies/discover/random
 *
 * This powers the DISCOVER SOMETHING button.
 */
export async function getRandomMovie() {
  const response = await fetch(
    `${API_BASE_URL}/api/movies/discover/random`
  );

  if (!response.ok) {
    throw new Error(
      'Failed to fetch random movie'
    );
  }

  return response.json();
}

/**
 * Get single movie from FastAPI
 *
 * GET /api/movies/{id}
 */
export async function getMovieById(id) {
  const response = await fetch(
    `${API_BASE_URL}/api/movies/${encodeURIComponent(
      id
    )}`
  );

  if (!response.ok) {
    throw new Error(
      `Movie with ID ${id} not found.`
    );
  }

  return response.json();
}

/**
 * Search movies
 *
 * Uses the backend movie database.
 */
export async function searchMovies(query) {
  return getMovies({
    search: query,
  });
}

/**
 * Get moods
 *
 * Mock for now.
 */
export async function getMoods() {
  await delay();

  return MOODS;
}

/**
 * Get hybrid movie recommendations from FastAPI
 *
 * GET /api/recommendations/movie/{movie_id}
 * Optional query parameter: top_n
 */
export async function getHybridMovieRecommendations(movieId, topN = null, signal = null) {
  let url = `${API_BASE_URL}/api/recommendations/movie/${encodeURIComponent(movieId)}`;
  if (topN !== null && topN !== undefined) {
    url += `?top_n=${encodeURIComponent(topN)}`;
  }

  const response = await fetch(url, { signal });

  if (!response.ok) {
    let errorMessage = `Failed to fetch recommendations (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get movie recommendations (Hybrid Similarity Engine)
 *
 * GET /api/recommendations/movie/{movie_id}
 *
 * Backend based.
 */
/**
 * Get movie recommendations (Hybrid Similarity Engine)
 *
 * GET /api/recommendations/movie/{movie_id}
 *
 * Backend based.
 */
export async function getRecommendations(movieId, topN = null) {
  return getHybridMovieRecommendations(movieId, topN);
}

/**
 * Get Vibe Mixer recommendations from FastAPI
 *
 * POST /api/recommendations/vibe
 */
export async function getVibeMixerRecommendations(dimensions = {}, topN = null, signal = null) {
  const payload = {
    mindBending: Number(dimensions.mindBending ?? 50.0),
    emotional: Number(dimensions.emotional ?? 50.0),
    action: Number(dimensions.action ?? 50.0),
    comedy: Number(dimensions.comedy ?? 50.0),
    dark: Number(dimensions.dark ?? 50.0),
    romantic: Number(dimensions.romantic ?? 50.0),
    adventure: Number(dimensions.adventure ?? 50.0),
    top_n: topN,
  };

  const response = await fetch(`${API_BASE_URL}/api/recommendations/vibe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch vibe mixer recommendations (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.map((item) => {
    const cand = item.movie || {};
    return {
      ...item,
      movie: {
        ...cand,
        id: item.movie_id || item.id || cand.id,
        title: item.title || cand.title,
        year: item.year || cand.year,
        vibeMatchScore: Math.round(item.vibeMatchScore ?? item.finalScore ?? 85),
        finalScore: item.finalScore,
        vibeComponents: item.components,
        movieVibeProfile: item.movieVibeProfile,
        explanation: item.explanation,
        recommendationReason: {
          similarityScore: Math.round(item.vibeMatchScore ?? item.finalScore ?? 85),
          vectorMatch: item.explanation,
          reasons: [item.explanation],
        },
      },
    };
  });
}

/**
 * Get personalized recommendations tailored to user watchlist & taste centroid
 *
 * POST /api/recommendations/user
 */
export async function getUserTasteRecommendations({
  likedIds = null,
  watchedIds = null,
  ratings = null,
  topN = null,
} = {}, signal = null) {
  const effectiveLiked = likedIds || getStoredWatchlist();
  const effectiveWatched = watchedIds || getStoredWatched();
  const effectiveRatings = ratings || getStoredRatings();

  const payload = {
    liked_ids: effectiveLiked,
    watched_ids: effectiveWatched,
    ratings: effectiveRatings,
    top_n: topN,
  };

  const response = await fetch(`${API_BASE_URL}/api/recommendations/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch personalized taste recommendations (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.map((item) => {
    const cand = item.movie || {};
    const roundedScore = Math.round(item.finalScore ?? 85);
    return {
      ...item,
      movie: {
        ...cand,
        id: item.movie_id || item.id || cand.id,
        title: item.title || cand.title,
        year: item.year || cand.year,
        vibeMatchScore: roundedScore,
        finalScore: item.finalScore,
        explanation: item.explanation,
        primaryAnchorMovie: item.primaryAnchorMovie,
        components: item.components,
        recommendationReason: {
          similarityScore: roundedScore,
          vectorMatch: item.explanation,
          anchorMovies: item.primaryAnchorMovie ? [item.primaryAnchorMovie] : [],
          reasons: [item.explanation],
        },
      },
    };
  });
}

/**
 * Get algorithmic mood recommendations from FastAPI
 *
 * GET /api/recommendations/mood/{mood_id}
 */
export async function getMoodRecommendations(moodId, topN = null, signal = null) {
  let url = `${API_BASE_URL}/api/recommendations/mood/${encodeURIComponent(moodId)}`;
  if (topN !== null && topN !== undefined) {
    url += `?top_n=${encodeURIComponent(topN)}`;
  }

  const response = await fetch(url, { signal });

  if (!response.ok) {
    let errorMessage = `Failed to fetch mood recommendations (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.map((item) => {
    const cand = item.movie || {};
    const roundedScore = Math.round(item.finalScore ?? item.vibeMatchScore ?? 85);
    return {
      ...item,
      movie: {
        ...cand,
        id: cand.id || item.id,
        title: cand.title,
        year: cand.year,
        vibeMatchScore: roundedScore,
        finalScore: item.finalScore,
        explanation: item.explanation,
        recommendationReason: {
          similarityScore: roundedScore,
          vectorMatch: item.explanation,
          reasons: [item.explanation],
        },
      },
    };
  });
}

/**
 * Get Vibe Circle users
 *
 * Mock for now.
 */
export async function getVibeCircle() {
  await delay();

  return MOCK_VIBE_USERS;
}

/**
 * Search Vibe Circle users
 *
 * Mock for now.
 */
export async function searchVibeUsers(query) {
  await delay();

  if (!query) {
    return MOCK_VIBE_USERS;
  }

  const q = query.toLowerCase();

  return MOCK_VIBE_USERS.filter(
    (user) =>
      user.name
        ?.toLowerCase()
        .includes(q) ||
      user.role
        ?.toLowerCase()
        .includes(q) ||
      user.topGenres?.some((genre) =>
        genre
          .toLowerCase()
          .includes(q)
      )
  );
}

/**
 * Send Circle Request
 *
 * Mock for now.
 */
export async function sendCircleRequest(
  userId
) {
  await delay();

  return {
    success: true,
    userId,
    status: 'REQUEST SENT',
  };
}

/**
 * Get Shared Vibes
 *
 * Mock for now.
 */
export async function getSharedVibes(
  otherUserId
) {
  await delay();

  const found =
    SHARED_VIBES_DATA[otherUserId];

  if (found) {
    return found;
  }

  const targetUser =
    MOCK_VIBE_USERS.find(
      (user) => user.id === otherUserId
    ) || MOCK_VIBE_USERS[2];

  return {
    userId: targetUser.id,
    userName: targetUser.name,
    vibeMatch: targetUser.vibeMatch,
    sharedCount:
      targetUser.sharedMoviesCount,
    sharedGenres: targetUser.topGenres,

    bothLove: MOVIES.slice(0, 3).map(
      (movie) => movie.id
    ),

    couldIntroduce: MOVIES.slice(3, 5).map(
      (movie) => movie.id
    ),
  };
}

// ==========================================
// PERSISTENT LOCAL STORAGE STORE
// ==========================================
const WATCHLIST_STORAGE_KEY = 'vyora_watchlist';
const WATCHED_STORAGE_KEY = 'vyora_watched';
const RATINGS_STORAGE_KEY = 'vyora_ratings';

export function getStoredWatchlist() {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse watchlist from storage:', e);
  }
  return MOCK_USER_UNIVERSE.watchlist || ['blade-runner-2049', 'knives-out-2019', 'hereditary-2018'];
}

export function getStoredWatched() {
  try {
    const raw = localStorage.getItem(WATCHED_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse watched from storage:', e);
  }
  return MOCK_USER_UNIVERSE.recentlyWatched || [
    'interstellar-2014',
    'arrival-2016',
    'dune-2021',
    'everything-everywhere-all-at-once',
  ];
}

export function getStoredRatings() {
  try {
    const raw = localStorage.getItem(RATINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse ratings from storage:', e);
  }
  return {
    'interstellar-2014': 5.0,
    'arrival-2016': 4.5,
    'blade-runner-2049': 4.5,
  };
}

export function isMovieInWatchlist(movieId) {
  return getStoredWatchlist().includes(movieId);
}

export function isMovieWatched(movieId) {
  return getStoredWatched().includes(movieId);
}

export function getMovieRating(movieId) {
  const ratings = getStoredRatings();
  return ratings[movieId] || 0;
}

/**
 * Get User Universe
 *
 * Combines mock profile structure with dynamic local storage states.
 */
export async function getUserUniverse() {
  await delay();

  const watchlist = getStoredWatchlist();
  const recentlyWatched = getStoredWatched();

  return {
    ...MOCK_USER_UNIVERSE,
    watchlist,
    recentlyWatched,
    stats: {
      ...MOCK_USER_UNIVERSE.stats,
      totalWatched: recentlyWatched.length + 138,
    },
  };
}

/**
 * Get Vibe Evolution
 *
 * Mock for now.
 */
export async function getVibeEvolution() {
  await delay();

  return MOCK_VIBE_EVOLUTION;
}

/**
 * Rate Movie (Synchronized with localStorage & Event Broadcast)
 */
export async function rateMovie(
  movieId,
  rating
) {
  await delay(60);

  const ratings = getStoredRatings();
  const updatedRatings = {
    ...ratings,
    [movieId]: Number(rating),
  };

  try {
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(updatedRatings));
  } catch (e) {
    console.error('Failed to save rating:', e);
  }

  window.dispatchEvent(
    new CustomEvent('vyora_ratings_updated', {
      detail: { movieId, rating: Number(rating), ratings: updatedRatings },
    })
  );

  return {
    success: true,
    movieId,
    rating: Number(rating),
    ratings: updatedRatings,
  };
}

/**
 * Toggle Watchlist (Synchronized with localStorage & Event Broadcast)
 */
export async function toggleWatchlist(
  movieId
) {
  await delay(60);

  const list = getStoredWatchlist();
  let updated;
  let inWatchlist;

  if (list.includes(movieId)) {
    updated = list.filter((id) => id !== movieId);
    inWatchlist = false;
  } else {
    updated = [movieId, ...list];
    inWatchlist = true;
  }

  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save watchlist:', e);
  }

  window.dispatchEvent(
    new CustomEvent('vyora_watchlist_updated', {
      detail: { movieId, inWatchlist, watchlist: updated },
    })
  );

  return {
    success: true,
    movieId,
    inWatchlist,
    watchlist: updated,
  };
}

/**
 * Mark Movie as Watched / Unwatched (Synchronized with localStorage & Event Broadcast)
 */
export async function markMovieWatched(
  movieId,
  watched = true
) {
  await delay(60);

  const list = getStoredWatched();
  let updated;

  if (watched) {
    updated = list.includes(movieId) ? list : [movieId, ...list];
  } else {
    updated = list.filter((id) => id !== movieId);
  }

  try {
    localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save watched history:', e);
  }

  window.dispatchEvent(
    new CustomEvent('vyora_watched_updated', {
      detail: { movieId, watched, watchedList: updated },
    })
  );

  return {
    success: true,
    movieId,
    watched,
    watchedList: updated,
  };
}