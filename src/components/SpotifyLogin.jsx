// src/components/SpotifyLogin.jsx
import React, { useState, useEffect } from 'react';

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(buffer) {
  return await crypto.subtle.digest('SHA-256', new TextEncoder().encode(buffer));
}

function generateVerifier(length = 128) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  for (let i = 0; i < length; i++) {
    verifier += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return verifier;
}

export default function SpotifyLogin() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/config`)
      .then(r => r.json())
      .then(setCfg)
      .catch(console.error);
  }, []);

  const handleLogin = async () => {
    if (!cfg) return;
    // 1) Create PKCE verifier & challenge
    const verifier = generateVerifier();
    const challenge = base64UrlEncode(await sha256(verifier));
    // 2) Store verifier in localStorage
    localStorage.setItem('pkce_verifier', verifier);
    // 3) Build the Spotify authorize URL
    const params = new URLSearchParams({
      client_id:     cfg.clientId,
      response_type: 'code',
      redirect_uri:  cfg.redirectUri,
      code_challenge_method: 'S256',
      code_challenge:        challenge,
      scope: [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played'
      ].join(' ')
    });
    // 4) Redirect browser into Spotify
    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  };

  if (!cfg) return <p>Loading…</p>;
  return <button onClick={handleLogin}>Log in with Spotify</button>;
}
