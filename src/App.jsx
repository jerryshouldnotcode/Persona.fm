import { useState, useEffect } from 'react'
import { getAuthUrl, handleAuthCallback } from './spotifyAuth'
import './App.css'

function App() {
  const [token, setToken] = useState("");

  useEffect(() => {
    // Check for token in URL hash when component mounts
    const hash = handleAuthCallback();
    const _token = hash.access_token;

    if (_token) {
      setToken(_token);
      // Store token in localStorage for persistence
      localStorage.setItem("spotify_token", _token);
    } else {
      // Check localStorage for existing token
      const storedToken = localStorage.getItem("spotify_token");
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("spotify_token");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Profile</h1>
        {!token ? (
          <button onClick={handleLogin} className="login-button">
            Login to Spotify
          </button>
        ) : (
          <div>
            <h2>Successfully logged in!</h2>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App
