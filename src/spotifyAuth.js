import dotenv from 'dotenv';

// Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'code';

// Scopes for the permissions we need
const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played'
];

// Generate the Spotify authorization URL
export const getAuthUrl = () => {
    const scopeString = SCOPES.join('%20');
    return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopeString}&response_type=${RESPONSE_TYPE}&show_dialog=true`;
};

// Handle the authentication callback
export const handleAuthCallback = () => {
    console.log("Current URL hash:", window.location.hash);
    const hash = window.location.hash
        .substring(1)
        .split('&')
        .reduce((initial, item) => {
            if (item) {
                const parts = item.split('=');
                initial[parts[0]] = decodeURIComponent(parts[1]);
            }
            return initial;
        }, {});

    console.log("Processed hash object:", hash);
    window.location.hash = '';
    return hash;
}; 