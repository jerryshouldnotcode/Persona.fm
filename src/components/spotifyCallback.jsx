// src/components/SpotifyCallback.jsx
import React, { useEffect, useState } from 'react';

export default function SpotifyCallback({ onToken }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const code     = new URLSearchParams(window.location.search).get('code');
    const verifier = localStorage.getItem('pkce_verifier');

    if (!code || !verifier) {
      setError('Missing code or PKCE verifier');
      return;
    }

    // POST to your backend to exchange code + verifier for tokens
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, verifier })
    })
      .then(r => r.json())
      .then(data => {
        if (data.access_token) {
          onToken(data.access_token);
          localStorage.setItem('spotify_token', data.access_token);
          window.history.replaceState({}, '', '/');
        } else {
          setError(data.error || 'Token exchange failed');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Network error');
      });
  }, [onToken]);

  if (error) return <p>Error: {error}</p>;
  return <p>Logging you in…</p>;
}
