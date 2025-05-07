import React, { useState, useEffect } from 'react';

export default function SpotifyLogin() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(setCfg);
  }, []);

  if (!cfg) return <p>Loading…</p>;

  // Generate the verifier and store it in local storage
  const verifier = genVerifier();
  localStorage.setItem('sp_verifier', verifier);
  
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
    ].join(' '),
    show_dialog: 'true',
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params}`;

  return (
    <button onClick={() => (window.location.href = authUrl)}>
      Log in with Spotify
    </button>
  );
}
