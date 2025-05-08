// src/SpotifyCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SpotifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
      console.error('No code in URL');
      return;
    }

    fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
      .then(res => res.json())
      .then(tokens => {
        // store tokens in localStorage/context…
        navigate('/dashboard');  
      })
      .catch(err => console.error(err));
  }, [navigate]);

  return <p>Finalizing login…</p>;
}
