/**
 * API Client — Fetch wrapper with JWT token management.
 * Handles automatic Authorization header injection and token refresh on 401.
 */

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

/** Get stored tokens */
function getTokens() {
  const access = localStorage.getItem('carbontrack_access_token');
  const refresh = localStorage.getItem('carbontrack_refresh_token');
  return { access, refresh };
}

/** Store tokens */
export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('carbontrack_access_token', accessToken);
  localStorage.setItem('carbontrack_refresh_token', refreshToken);
}

/** Clear tokens (logout) */
export function clearTokens() {
  localStorage.removeItem('carbontrack_access_token');
  localStorage.removeItem('carbontrack_refresh_token');
}

/** Check if user is authenticated */
export function isAuthenticated() {
  return !!localStorage.getItem('carbontrack_access_token');
}

/**
 * Core fetch wrapper with auth headers and auto-refresh.
 */
async function apiFetch(endpoint, options = {}) {
  const { access } = getTokens();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (access) {
    headers['Authorization'] = `Bearer ${access}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 and we have a refresh token, try to refresh
  if (response.status === 401 && getTokens().refresh) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry the original request with new token
      const { access: newAccess } = getTokens();
      headers['Authorization'] = `Bearer ${newAccess}`;
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new ApiError(response.status, error.detail || 'Unknown error');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Try to refresh the access token using the refresh token.
 */
async function tryRefreshToken() {
  const { refresh } = getTokens();
  if (!refresh) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

/** Custom API error class */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ─── Convenience methods ─────────────────────────────────────────

export const api = {
  get: (endpoint) => apiFetch(endpoint),
  
  post: (endpoint, data) => apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  put: (endpoint, data) => apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (endpoint) => apiFetch(endpoint, {
    method: 'DELETE',
  }),
};

export default api;
