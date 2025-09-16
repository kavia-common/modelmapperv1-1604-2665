//
// Auth service with bypass mode and placeholder OAuth wiring.
// In bypass mode, we simulate a logged-in user and provide a fake token.
//
const BYPASS = String(process.env.REACT_APP_BYPASS_AUTH).toLowerCase() === 'true';

// Set initial mock user if in bypass mode
let _user = BYPASS ? {
  id: 'dev-user-1',
  name: 'Test User (Mock)',
  email: 'test.user@designstudio.local',
  roles: ['designer', 'admin', 'tester'],
  isMockUser: true
} : null;

let _token = BYPASS ? 'mock-dev-token' : null;

// PUBLIC_INTERFACE
export function isBypassMode() {
  return BYPASS;
}

// PUBLIC_INTERFACE
export function getUser() {
  return _user;
}

// PUBLIC_INTERFACE
export function getAccessToken() {
  return _token;
}

// PUBLIC_INTERFACE
export function signIn() {
  if (BYPASS) {
    _user = {
      id: 'dev-user-1',
      name: 'Test User (Mock)',
      email: 'test.user@designstudio.local',
      roles: ['designer', 'admin', 'tester'],
      isMockUser: true
    };
    _token = 'mock-dev-token';
    return Promise.resolve(_user);
  }

  // Placeholder OAuth start — in a real app, redirect to IDP with PKCE, etc.
  const authUrl = process.env.REACT_APP_OAUTH_AUTHORIZATION_URL;
  const clientId = process.env.REACT_APP_OAUTH_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_OAUTH_REDIRECT_URI;
  const scope = encodeURIComponent(process.env.REACT_APP_OAUTH_SCOPE || 'openid');

  const url = `${authUrl}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=dummy`;
  window.location.assign(url);
  return Promise.resolve();
}

// PUBLIC_INTERFACE
export function handleRedirectCallback(searchParams) {
  if (BYPASS) {
    // Nothing to do in bypass mode.
    return Promise.resolve(true);
  }
  // Placeholder token exchange. In a real app, exchange 'code' for tokens via backend.
  const code = searchParams.get('code');
  if (!code) return Promise.resolve(false);
  _token = 'placeholder-access-token';
  _user = {
    id: 'user-1',
    name: 'OAuth User',
    email: 'oauth.user@example.com',
    roles: ['designer']
  };
  return Promise.resolve(true);
}

// PUBLIC_INTERFACE
export function signOut() {
  _user = null;
  _token = null;
  if (!BYPASS) {
    // Redirect to post-logout or clear session cookies accordingly.
  }
}
