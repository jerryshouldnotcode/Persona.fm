import { useState, useEffect } from 'react'
import { getAuthUrl, handleAuthCallback } from './spotifyAuth'
import './App.css'

function App() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const hash = handleAuthCallback();
    const _token = hash.access_token;

    if (_token) {
      setToken(_token);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = getAuthUrl();
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
            {/* We'll add more content here later */}
          </div>
        )}
      </header>
    </div>
  );
}

export default App
