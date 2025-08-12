const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

let authToken = localStorage.getItem('auth_token') || null;

export function setToken(token) {
  authToken = token;
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  auth: {
    async register(email, password, name) {
      const data = await request('/auth/register', { method: 'POST', body: { email, password, name } });
      setToken(data.token);
      return data;
    },
    async login(email, password) {
      const data = await request('/auth/login', { method: 'POST', body: { email, password } });
      setToken(data.token);
      return data;
    },
    logout() { setToken(null); }
  },
  projects: {
    list() { return request('/projects'); },
    create(name, description) { return request('/projects', { method: 'POST', body: { name, description } }); },
    get(id) { return request(`/projects/${id}`); },
    update(id, payload) { return request(`/projects/${id}`, { method: 'PUT', body: payload }); },
    delete(id) { return request(`/projects/${id}`, { method: 'DELETE' }); }
  },
  billing: {
    async createCheckoutSession(priceId, successUrl, cancelUrl) {
      return request('/billing/create-checkout-session', { method: 'POST', body: { priceId, successUrl, cancelUrl } });
    },
    async upgradeDev() { return request('/billing/upgrade', { method: 'POST' }); }
  },
  drive: {
    status() { return request('/drive/status'); },
    exportZip(filename, contentBase64) { return request('/drive/export-zip', { method: 'POST', body: { filename, contentBase64 } }); }
  }
};

export default api; 