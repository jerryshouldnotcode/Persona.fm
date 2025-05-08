import React, { useState, useEffect } from 'react';
import { spotifyFetch } from '../utils/spotifyApi';
import SpotifyLogin from './SpotifyLogin';

export default function MainApp() {
  const [token, setToken] = useState(localStorage.getItem('spotify_token'));
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    spotifyFetch('/api/me/top-tracks')
      .then(data => {
        setTracks(data.items || []);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load top tracks');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // If not logged in, show the login button
  if (!token) {
    return <SpotifyLogin />;
  }

  // Loading state
  if (loading) {
    return <p>Loading your top tracks…</p>;
  }

  // Error state
  if (error) {
    return <p>Error: {error}</p>;
  }

  // Main content
  return (
    <div className="App">
      <header className="App-header">
        <h1>Your Top Spotify Tracks</h1>
      </header>
      <ul>
        {tracks.map(track => (
          <li key={track.id}>
            <strong>{track.name}</strong> by {track.artists.map(a => a.name).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
