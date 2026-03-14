const BASE = "http://127.0.0.1:8000";

// The token lives here in module scope — never in localStorage
let _token = null;

export const setToken = (t) => { _token = t; };
export const getToken = () => _token;
export const clearToken = () => { _token = null; };

/**
 * Wrapper around fetch that automatically adds Authorization header.
 * Usage: await api("/profile/me")
 *        await api("/profile/setup", { method: "POST", body: {...} })
 */
export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data;
}