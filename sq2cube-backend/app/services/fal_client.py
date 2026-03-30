"""
app/services/fal_client.py
━━━━━━━━━━━━━━━━━━━━━━━━━━
fal.ai API client for 3D generation.

Models used:
  - Image → 3D   : fal-ai/triposr          ($0.07/generation)
  - Multi  → 3D  : tripo3d/tripo/v2.5/multiview-to-3d
  - Text   → 3D  : fal-ai/triposr (image first via text-to-image, then to 3D)
                   OR tripo3d/tripo/v2.5/text-to-3d if available

Install:  pip install fal-client
"""

import os
import logging
import asyncio
import base64
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

FAL_KEY  = os.getenv("FAL_KEY", "")
BASE_URL = "https://fal.run"

if not FAL_KEY:
    raise EnvironmentError("FAL_KEY is not set in your .env file.")


def _headers():
    return {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type":  "application/json",
    }


# ── Upload a base64 image to fal storage → get a public URL ──────────────────
async def _upload_image(client: httpx.AsyncClient, base64_data_uri: str) -> str:
    """
    fal.ai needs a publicly accessible URL.
    We convert the base64 string to bytes and upload it natively using fal_client.
    """
    import fal_client
    
    # Extract raw base64 bytes
    if "," in base64_data_uri:
        header, data = base64_data_uri.split(",", 1)
        mime = header.split(":")[1].split(";")[0]   # e.g. image/png
    else:
        data = base64_data_uri
        mime = "image/jpeg"

    image_bytes = base64.b64decode(data)

    # Use the official SDK to upload
    ext = mime.split("/")[1] if "/" in mime else "png"
    filename = f"upload_{os.urandom(4).hex()}.{ext}"
    
    # The sync upload works correctly without blocking async thread too long
    # or we could use asyncio.to_thread if necessary, but this is fast.
    import asyncio
    url = await asyncio.to_thread(fal_client.upload, image_bytes, mime, file_name=filename)
    
    if not url:
        raise RuntimeError("fal SDK upload failed to return a URL.")
    
    logger.info(f"[fal] Image uploaded natively → {url}")
    return url


# ── Submit a request to fal queue ─────────────────────────────────────────────
async def _submit(client: httpx.AsyncClient, model: str, payload: dict) -> dict:
    """Submit a task to Fal.ai models using the official Python SDK."""
    import fal_client
    import asyncio
    
    def run_sync():
        # Using subscribe handles polling automatically and safely!
        result = fal_client.subscribe(
            model,
            arguments=payload,
            with_logs=True
        )
        return result

    # Offload the blocking sync fal_client to a thread
    data = await asyncio.to_thread(run_sync)

    if not data:
        raise RuntimeError(f"fal SDK model submission failed or returned empty.")
    return data


# ── Extract URLs from fal response ────────────────────────────────────────────
def _extract(data: dict) -> dict:
    """Pull the .glb URL out of whatever fal returns."""
    result = {}

    # TripoSR format
    if "model_mesh" in data:
        mesh = data["model_mesh"]
        url  = mesh.get("url") or mesh.get("content_url")
        fmt  = mesh.get("content_type", "model/gltf-binary")
        ext  = "glb" if "gltf" in fmt or "glb" in fmt else "obj"
        if url:
            result[ext] = url

    # Tripo3D format
    if "mesh" in data:
        mesh = data["mesh"]
        url  = mesh.get("url") or mesh.get("content_url")
        if url:
            result["glb"] = url

    # Generic model_url
    if "model_url" in data:
        result["glb"] = data["model_url"]

    # Thumbnail
    if "thumbnail" in data:
        result["thumbnail"] = data["thumbnail"].get("url", "")

    if not result:
        logger.warning(f"[fal] Could not extract URLs from response: {data}")

    return result


# ── Public API ─────────────────────────────────────────────────────────────────

async def image_to_3d(
    image_url: str,                     # base64 data URI or public URL
    output_format: str = "glb",
    remove_background: bool = True,
    foreground_ratio: float = 0.9,
    mc_resolution: int = 256,
) -> dict:
    """
    Single image → 3D using fal-ai/triposr.
    Returns dict with 'glb' key containing the download URL.
    """
    async with httpx.AsyncClient() as client:
        # Upload base64 → public URL if needed
        if image_url.startswith("data:"):
            image_url = await _upload_image(client, image_url)

        payload = {
            "image_url":            image_url,
            "output_format":        output_format,
            "do_remove_background": remove_background,
            "foreground_ratio":     foreground_ratio,
            "mc_resolution":        mc_resolution,
        }

        logger.info("[fal] Starting image→3D (TripoSR)")
        data = await _submit(client, "fal-ai/triposr", payload)
        return _extract(data)


async def multi_image_to_3d(
    image_urls: list,                   # list of base64 data URIs or public URLs
    output_format: str = "glb",
) -> dict:
    """
    Multiple images → 3D using tripo3d multiview model.
    Returns dict with 'glb' key.
    """
    if not (1 <= len(image_urls) <= 4):
        raise ValueError("multi_image_to_3d accepts 1–4 images.")

    async with httpx.AsyncClient() as client:
        # Upload any base64 images
        uploaded = []
        for url in image_urls:
            if url.startswith("data:"):
                url = await _upload_image(client, url)
            uploaded.append(url)

        payload = {
            "image_urls":    uploaded,
            "output_format": output_format,
        }

        logger.info(f"[fal] Starting multi-image→3D ({len(uploaded)} images)")
        data = await _submit(client, "tripo3d/tripo/v2.5/multiview-to-3d", payload)
        return _extract(data)


async def text_to_3d(
    prompt: str,
    output_format: str = "glb",
) -> dict:
    """
    Text prompt → 3D using tripo3d text-to-3d model.
    Returns dict with 'glb' key.
    """
    if not prompt.strip():
        raise ValueError("Prompt cannot be empty.")

    async with httpx.AsyncClient() as client:
        payload = {
            "prompt":        prompt,
            "output_format": output_format,
        }

        logger.info(f"[fal] Starting text→3D | prompt='{prompt[:60]}'")
        data = await _submit(client, "tripo3d/tripo/v2.5/text-to-3d", payload)
        return _extract(data)