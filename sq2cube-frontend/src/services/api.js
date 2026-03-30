// src/services/api.js
const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/** FastAPI may return `detail` as a string, or a list of validation error objects. */
function formatErrorDetail(detail) {
  if (detail == null) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item.msg === "string") return item.msg;
      if (item && typeof item.message === "string") return item.message;
      try {
        return JSON.stringify(item);
      } catch {
        return String(item);
      }
    });
    return parts.filter(Boolean).join(" ");
  }
  if (typeof detail === "object" && detail.msg) return String(detail.msg);
  try {
    return JSON.stringify(detail);
  } catch {
    return String(detail);
  }
}

// ── Token helpers (sessionStorage to match AuthContext) ───────────────────────
export function setToken(token) {
  sessionStorage.setItem("token", token);
}

export function clearToken() {
  sessionStorage.removeItem("token");
}

export function getToken() {
  return sessionStorage.getItem("token");
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
export async function api(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      formatErrorDetail(err.detail) ?? `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return null;

  return res.json();
}