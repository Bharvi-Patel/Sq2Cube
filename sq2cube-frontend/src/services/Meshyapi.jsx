const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function convertSingleImage(file, texturePrompt = "") {
  const form = new FormData();
  form.append("file", file);
  form.append("output_format", "glb");
  form.append("remove_background", "true");
  form.append("mc_resolution", "256");

  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE}/convert/single-image`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.urls;
}

export async function convertMultiImage(files) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  form.append("output_format", "glb");

  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE}/convert/multi-image`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.urls;
}

export async function convertTextPrompt(prompt, negativePrompt = "") {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", "glb");

  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE}/convert/text-prompt`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.urls;
}