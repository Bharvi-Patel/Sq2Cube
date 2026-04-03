import { getToken } from "./api";

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function fetchWithAuth(url, formData) {
  const token = getToken();
  if (!token) throw new Error("You must be logged in to generate models.");

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Invalid or expired token. Please log out and log in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.urls;
}

export async function convertSingleImage(file, texturePrompt = "") {
  const form = new FormData();
  form.append("file", file);
  form.append("output_format", "glb");
  form.append("remove_background", "true");
  form.append("mc_resolution", "256");
  if (texturePrompt) form.append("texture_prompt", texturePrompt);

  return fetchWithAuth(`${BASE}/convert/single-image`, form);
}

export async function convertMultiImage(files) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  form.append("output_format", "glb");

  return fetchWithAuth(`${BASE}/convert/multi-image`, form);
}

export async function convertTextPrompt(prompt) {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", "glb");

  return fetchWithAuth(`${BASE}/convert/text-prompt`, form);
}