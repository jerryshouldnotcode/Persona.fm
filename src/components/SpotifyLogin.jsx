import React, { useState, useEffect } from 'react';

export default function SpotifyLogin() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(setCfg);
  }, []);

  if (!cfg) return <p>Loading…</p>;

  return (
    <button onClick={() => window.location.href = '/login'}>
      Log in with Spotify
    </button>
  );
}