// public/js/config.js
// Resuelve la URL base del API. Soporta tres escenarios:
//   1. Mismo origen (Railway sirve frontend + API): API_BASE = ''
//   2. Frontend separado (Vercel) + backend (Railway): se lee de <meta name="api-url">
//   3. Override por window.API_URL (debug)
export const API_BASE = (() => {
    if (typeof window !== 'undefined' && window.API_URL) return window.API_URL;
    const meta = document.querySelector('meta[name="api-url"]');
    if (meta && meta.content && meta.content.trim()) return meta.content.trim().replace(/\/$/, '');
    return ''; // mismo origen
})();

// Helper para hacer fetch a /api/* con la base correcta
export async function apiFetch(path, options = {}) {
    const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = localStorage.getItem('auth_token');
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });
    let data = null;
    try { data = await res.json(); } catch (_) { /* respuesta sin JSON */ }
    if (!res.ok) {
        const msg = (data && data.error) || `Error ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

// Manejo del token + sesión
export const session = {
    getToken() { return localStorage.getItem('auth_token'); },
    setToken(t) { localStorage.setItem('auth_token', t); },
    clear() { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); },
    getUser() {
        const raw = localStorage.getItem('auth_user');
        try { return raw ? JSON.parse(raw) : null; } catch { return null; }
    },
    setUser(u) { localStorage.setItem('auth_user', JSON.stringify(u)); }
};
