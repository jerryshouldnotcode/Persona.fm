// src/utils/spotifyApi.js


// How long before expiration you want to pre‑emptively refresh? 60 s is typical.
const REFRESH_LEEWAY = 60_000;

export async function spotifyFetch(path, opts = {}) {
  // 1) Grab the expiry you stored earlier (when you first logged in or refreshed)
  const expiresAt = parseInt(localStorage.getItem('spotify_expires_at') || '0', 10);

  // 2) If we're within the leeway, refresh first
  if (Date.now() > expiresAt - REFRESH_LEEWAY) {
    const r = await fetch('/api/refresh');
    if (!r.ok) throw new Error('Failed to refresh Spotify token');
    const { access_token, expires_in } = await r.json();
    localStorage.setItem('spotify_token', access_token);
    localStorage.setItem('spotify_expires_at', Date.now() + expires_in * 1000);
  }

  // 3) Now make the real call, with a valid token in hand
  const token = localStorage.getItem('spotify_token');
  const base = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${base}${path}`, {
    credentials: 'include',
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}
