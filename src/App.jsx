import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SpotifyLogin    from './components/SpotifyLogin';
import SpotifyCallback from './components/spotifyCallback';
import MainApp         from './components/MainApp';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('spotify_token') || '');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={token ? <MainApp token={token}/> : <SpotifyLogin />} />
        <Route path="/callback" element={<SpotifyCallback onToken={setToken}/>} />
      </Routes>
    </BrowserRouter>
  );
}
