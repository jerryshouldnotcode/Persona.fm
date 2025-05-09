import React, { useState, useEffect } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function SpotifyLogin() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(setCfg);
  }, []);

  if (!cfg) return <p>Loading…</p>;

  return (
    <button onClick={() => window.location.href = `${API_BASE}/login`}>
      Log in with Spotify
    </button>
  );
}