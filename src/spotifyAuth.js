// Spotify API credentials
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'code';

let CLIENT_ID;
let REDIRECT_URI;

// Fetch configuration from the backend
const fetchConfig = async () => {
    const response = await fetch('api/config');
    const config = await response.json();
    CLIENT_ID = config.clientId;
    REDIRECT_URI = config.redirectUri;
};

// so that CLIENT_ID and REDIRECT_URI are initialized
fetchConfig();

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

// Call fetchConfig to ensure CLIENT_ID and REDIRECT_URI are set before using them
fetchConfig();