import { useState, useEffect } from 'react'
import { getAuthUrl, handleAuthCallback } from './spotifyAuth'
import './App.css'

function App() {
  const [token, setToken] = useState("");

  useEffect(() => {
    console.log("Component mounted, checking for token...");
    const hash = handleAuthCallback();
    console.log("URL hash:", hash);
    const _token = hash.access_token;
    console.log("Extracted token:", _token);

    if (_token) {
      console.log("Setting new token");
      setToken(_token);
      localStorage.setItem("spotify_token", _token);
    } else {
      console.log("No token in URL, checking localStorage");
      const storedToken = localStorage.getItem("spotify_token");
      console.log("Stored token:", storedToken);
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  const handleLogin = () => {
    console.log("Login clicked, redirecting to:", getAuthUrl());
    window.location.href = getAuthUrl();
  };

  const handleLogout = () => {
    console.log("Logging out");
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
