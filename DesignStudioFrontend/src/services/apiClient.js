//
// API client that routes requests to either real backend or mock handlers (MSW) depending on REACT_APP_BYPASS_AUTH.
//
// PUBLIC_INTERFACE
export class ApiClient {
  /**
   * Create a new API client.
   * @param {Object} opts
   * @param {boolean} opts.bypassAuth - When true, uses mock handlers and bypasses OAuth.
   * @param {string} opts.baseUrl - Backend API base URL for production/normal mode.
   * @param {function} opts.getAccessToken - Function that returns an access token string (or null) for Authorization header.
   */
  constructor({ bypassAuth, baseUrl, getAccessToken }) {
    this.bypassAuth = bypassAuth;
    this.baseUrl = baseUrl;
    this.getAccessToken = getAccessToken;
  }

  // Helper to build headers
  _headers() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getAccessToken ? this.getAccessToken() : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // PUBLIC_INTERFACE
  async listModels() {
    return this._request('/models', { method: 'GET' });
  }

  // PUBLIC_INTERFACE
  async createModel(data) {
    return this._request('/models', { method: 'POST', body: JSON.stringify(data) });
  }

  // PUBLIC_INTERFACE
  async getModel(id) {
    return this._request(`/models/${encodeURIComponent(id)}`, { method: 'GET' });
  }

  // PUBLIC_INTERFACE
  async updateModel(id, data) {
    return this._request(`/models/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // PUBLIC_INTERFACE
  async deleteModel(id) {
    return this._request(`/models/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  // PUBLIC_INTERFACE
  async listRoles() {
    return this._request('/roles', { method: 'GET' });
  }

  // PUBLIC_INTERFACE
  async createRole(data) {
    return this._request('/roles', { method: 'POST', body: JSON.stringify(data) });
  }

  // PUBLIC_INTERFACE
  async listMappings() {
    return this._request('/mappings', { method: 'GET' });
  }

  // PUBLIC_INTERFACE
  async createMapping(data) {
    return this._request('/mappings', { method: 'POST', body: JSON.stringify(data) });
  }

  // PUBLIC_INTERFACE
  async validate(payload) {
    return this._request('/validate', { method: 'POST', body: JSON.stringify(payload) });
  }

  // PUBLIC_INTERFACE
  async getCollaboration() {
    return this._request('/collaboration', { method: 'GET' });
  }

  // PUBLIC_INTERFACE
  async updateCollaboration(payload) {
    return this._request('/collaboration', { method: 'POST', body: JSON.stringify(payload) });
  }

  // PUBLIC_INTERFACE
  async importModel(payload) {
    return this._request('/import', { method: 'POST', body: JSON.stringify(payload) });
  }

  // PUBLIC_INTERFACE
  async exportModel(id) {
    return this._request(`/export?id=${encodeURIComponent(id)}`, { method: 'GET' });
  }

  // PUBLIC_INTERFACE
  async deviceConnection(payload) {
    return this._request('/device-connection', { method: 'POST', body: JSON.stringify(payload) });
  }

  // PUBLIC_INTERFACE
  async log(payload) {
    return this._request('/logs', { method: 'POST', body: JSON.stringify(payload) });
  }

  async _request(path, options) {
    if (this.bypassAuth) {
      // In bypass mode, we call the same URL; MSW intercepts and returns mocked data.
      const res = await fetch(path, {
        ...options,
        headers: this._headers()
      });
      if (!res.ok) throw new Error(`Mock request failed: ${res.status}`);
      return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text();
    }
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: this._headers()
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text();
  }
}

export function createApiClient(getAccessToken) {
  // Align with auth.js dev-friendly default:
  // If REACT_APP_BYPASS_AUTH is set, use it; otherwise default to true in non-production.
  let bypassAuth;
  if (typeof process.env.REACT_APP_BYPASS_AUTH !== 'undefined') {
    bypassAuth = String(process.env.REACT_APP_BYPASS_AUTH).toLowerCase() === 'true';
  } else {
    bypassAuth = process.env.NODE_ENV !== 'production';
  }
  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  return new ApiClient({ bypassAuth, baseUrl, getAccessToken });
}
