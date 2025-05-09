import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import axios from 'axios';
import crypto from 'crypto';

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    'http://127.0.0.1:5173',
    'https://persona-fm.vercel.app'
  ],
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomUUID(),
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'lax',  // or 'none' if you go https+secure
    secure: true,    // set to true if you're serving over HTTPS
  }
}));


const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;


// Helpers -------------------------------------------------------------
function genVerifier(len = 64) {
  return crypto.randomBytes(len).toString('base64url').slice(0, 128);
}

function sha256Base64URL(str) {
  return crypto
    .createHash('sha256')
    .update(str)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Routes --------------------------------------------------------------
/**
 * Step 1: /login – redirect user to Spotify with PKCE params
 */
app.get('/login', (req, res) => {
  const verifier  = genVerifier();
  const challenge = sha256Base64URL(verifier);
  req.session.pkceVerifier = verifier; // stash per‑user

  const scope = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state: crypto.randomUUID(),
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

/**
 * Step 2: /callback – exchange code for tokens using stored verifier
 */
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const verifier = req.session.pkceVerifier;
  if (!code || !verifier) {
    return res.status(400).send('Missing code or verifier');
  }

  try {
    const body = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_verifier: verifier,
    });

    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    // You might store tokens in DB or set a cookie here
    return res.json(tokenRes.data); // { access_token, refresh_token, ... }
  } catch (err) {
    console.error(err.response?.data || err);
    return res.status(500).json({ error: 'token exchange failed' });
  }
});


// POST /api/token  –  exchange code + verifier for access / refresh tokens
app.post('/api/token', async (req, res) => {
  const { code, verifier } = req.body || {};

  if (!code || !verifier) {
    return res.status(400).json({ error: 'code and verifier required' });
  }

  try {
    const body = new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      code_verifier: verifier,
    });

    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // …after tokenRes = await axios.post(…)
    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // stash in session
    req.session.access_token  = access_token;
    req.session.refresh_token = refresh_token;
    req.session.expires_at    = Date.now() + expires_in * 1000;

    // then respond (or redirect) as you like
    res.json({ access_token });

  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'token exchange failed' });
    console.log('Token exchange failed');
  }
});

// refresh route
app.get('/api/refresh', async (req, res) => {
  const refreshToken = req.session.refresh_token;
  if (!refreshToken) {
    return res.status(400).json({ error: 'No refresh token in session' });
  }

  // build the form body
  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
    client_id:     process.env.SPOTIFY_CLIENT_ID,
  });

  try {
    const { data } = await axios.post(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // update session
    req.session.access_token = data.access_token;
    if (data.refresh_token) {
      req.session.refresh_token = data.refresh_token;
    }
    req.session.expires_at = Date.now() + data.expires_in * 1000;

    return res.json({ access_token: data.access_token });
  } catch (err) {
    console.error('Refresh failed:', err.response?.data || err);
    return res.status(500).json({ error: 'Could not refresh token' });
  }
});

// GET top tracks from Spotify

app.get('/api/me/top-tracks', async (req, res) => {
  const token = req.session.access_token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { data } = await axios.get(
      'https://api.spotify.com/v1/me/top/tracks',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Spotify returns { items: [...], total, limit, ... }
    res.json(data);
  } catch (err) {
    console.error('Error fetching top tracks:', err.response?.data || err);
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Could not fetch top tracks' });
  }
});



/**
 * Optional helper config route
 */
app.get('/api/config', (req, res) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    return res.status(500).json({ error: 'missing Spotify env vars' });
  }

  res.json({
    clientId: SPOTIFY_CLIENT_ID,
    redirectUri: SPOTIFY_REDIRECT_URI,
  });
});

app.get('/', (req, res) => {
  res.send('Spotify Auth Backend is running!');
});




// Start the server
const PORT = process.env.PORT || 8888; // Define the port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // Log the server URL
});

export default app;