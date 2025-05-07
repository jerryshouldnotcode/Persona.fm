import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import axios from 'axios';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Simple in‑memory session for dev; swap for Redis/DB in prod
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomUUID(),
  resave: false,
  saveUninitialized: true,
}));

console.log('Start-up:', SPOTIFY_CLIENT_ID); // Logs the Spotify client ID

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

    const spotifyRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json(spotifyRes.data);           // { access_token, refresh_token, … }
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'token exchange failed' });
  }
});

/**
 * Optional helper config route
 */
app.get('/api/config', (req, res) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    return res.status(500).json({ error: 'missing Spotify env vars' });
  }
  console.log('Middle:', SPOTIFY_CLIENT_ID)
  
  res.json({
    clientId: SPOTIFY_CLIENT_ID,
    redirectUri: SPOTIFY_REDIRECT_URI,
  });
});

console.log('Fin:', SPOTIFY_CLIENT_ID),

app.get('/', (req, res) => {
  res.send('Spotify Auth Backend is running!');
});

// Start the server
module.exports = app;