import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainApp         from './components/MainApp'
import SpotifyLogin    from './components/SpotifyLogin'
import SpotifyCallback from './components/spotifyCallback'
import About           from './components/About'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<MainApp />} />
        <Route path="/login"   element={<SpotifyLogin />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/about"    element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
