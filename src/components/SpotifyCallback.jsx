// src/SpotifyCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export default function SpotifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const verifier = window.localStorage.getItem('pkce_verifier');

    if (!code || !verifier) {
      console.error('No code or verifier in URL/localStorage');
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, verifier })
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
