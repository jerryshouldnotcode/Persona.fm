import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());

const CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.VITE_SPOTIFY_REDIRECT_URI;

console.log('Client ID:', CLIENT_ID);
console.log('Redirect URI:', REDIRECT_URI);

// 1. Redirect user to Spotify authorization
app.get('/login', (req, res) => {
  const scope = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(authUrl);
});

// 2. Spotify redirects back to this endpoint with a code
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  if (!code) return res.status(400).send('No code provided');

  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Send tokens to frontend (or set a cookie, etc.)
    res.json(tokenResponse.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get tokens', details: err.response?.data || err.message });
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI
  });
});

app.get('/', (req, res) => {
  res.send('Spotify Auth Backend is running!');
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
