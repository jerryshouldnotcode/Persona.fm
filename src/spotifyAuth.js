// Spotify API credentials
const CLIENT_ID = '0be86b95af224d1c9404b389bd28039c'; // You'll need to replace this with your actual client ID
const REDIRECT_URI = 'https://persona-fm.vercel.app/'; // Default Vite dev server port
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

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

    window.location.hash = '';
    return hash;
}; 