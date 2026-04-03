"""
app/services/fal_client.py
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
    import fal_client
    import asyncio

    if "," in base64_data_uri:
        header, data = base64_data_uri.split(",", 1)
        mime = header.split(":")[1].split(";")[0]
    else:
        data = base64_data_uri
        mime = "image/jpeg"

    image_bytes = base64.b64decode(data)
    ext = mime.split("/")[1] if "/" in mime else "png"
    filename = f"upload_{os.urandom(4).hex()}.{ext}"

    url = await asyncio.to_thread(fal_client.upload, image_bytes, mime, file_name=filename)

    if not url:
        raise RuntimeError("fal SDK upload failed to return a URL.")

    logger.info(f"[fal] Image uploaded → {url}")
    return url


# ── Submit a request to fal queue ─────────────────────────────────────────────
async def _submit(client: httpx.AsyncClient, model: str, payload: dict) -> dict:
    import fal_client
    import asyncio

    def run_sync():
        result = fal_client.subscribe(
            model,
            arguments=payload,
            with_logs=True
        )
        return result

    data = await asyncio.to_thread(run_sync)

    if not data:
        raise RuntimeError(f"fal SDK model submission failed or returned empty.")

    # Log raw response so we can debug without wasting credits
    logger.warning(f"[fal] Raw response keys: {list(data.keys())}")
    logger.warning(f"[fal] Raw response: {data}")

    return data


# ── Extract URLs from fal response ────────────────────────────────────────────
def _extract(data: dict) -> dict:
    result = {}

    # TripoSR format — model_mesh
    if "model_mesh" in data:
        mesh = data["model_mesh"]
        url  = mesh.get("url") or mesh.get("content_url")
        fmt  = mesh.get("content_type", "")
        if url:
            if "gltf" in fmt or "glb" in fmt:
                result["glb"] = url
            else:
                result["obj"] = url
                result["glb"] = url

    # Rodin format
    if "model_urls" in data:
        mu = data["model_urls"]
        if isinstance(mu, dict):
            result["glb"] = mu.get("glb") or mu.get("obj") or ""
        elif isinstance(mu, str):
            result["glb"] = mu

    # Tripo3D format — mesh
    if "mesh" in data:
        mesh = data["mesh"]
        url  = mesh.get("url") or mesh.get("content_url")
        if url:
            result["glb"] = url

    # Generic model_url
    if "model_url" in data:
        result["glb"] = data["model_url"]

    # Thumbnail — check multiple possible keys
    for thumb_key in ["thumbnail", "rendered_image", "preview_image", "image"]:
        if thumb_key in data:
            t = data[thumb_key]
            if isinstance(t, dict):
                url = t.get("url") or t.get("content_url")
                if url:
                    result["thumbnail"] = url
                    break
            elif isinstance(t, str) and t:
                result["thumbnail"] = t
                break

    # Last resort — if still no glb, use obj
    if "obj" in result and "glb" not in result:
        result["glb"] = result["obj"]

    logger.warning(f"[fal] Extracted URLs: {result}")

    if not result:
        logger.warning(f"[fal] Could not extract URLs from response: {data}")

    return result


# ── Public API ─────────────────────────────────────────────────────────────────

async def image_to_3d(
    image_url: str,
    output_format: str = "glb",
    remove_background: bool = True,
    foreground_ratio: float = 0.9,
    mc_resolution: int = 256,
) -> dict:
    async with httpx.AsyncClient() as client:
        if image_url.startswith("data:"):
            image_url = await _upload_image(client, image_url)

        payload = {
            "image_url":            image_url,
            "output_format":        "glb",   # always request glb
            "do_remove_background": remove_background,
            "foreground_ratio":     foreground_ratio,
            "mc_resolution":        mc_resolution,
        }

        logger.info("[fal] Starting image→3D (TripoSR)")
        data = await _submit(client, "fal-ai/triposr", payload)
        return _extract(data)


async def multi_image_to_3d(
    image_urls: list,
    output_format: str = "glb",
) -> dict:
    if not (1 <= len(image_urls) <= 4):
        raise ValueError("multi_image_to_3d accepts 1–4 images.")

    async with httpx.AsyncClient() as client:
        uploaded = []
        for url in image_urls:
            if url.startswith("data:"):
                url = await _upload_image(client, url)
            uploaded.append(url)

        # tripo3d multiview expects named fields, not a list
        field_names = ["front_image_url", "back_image_url", "left_image_url", "right_image_url"]
        payload = {"output_format": "glb"}
        for i, url in enumerate(uploaded):
            payload[field_names[i]] = url

        logger.info(f"[fal] Starting multi-image→3D ({len(uploaded)} images)")
        logger.warning(f"[fal] Multi payload keys: {list(payload.keys())}")
        data = await _submit(client, "tripo3d/tripo/v2.5/multiview-to-3d", payload)
        return _extract(data)


async def text_to_3d(
    prompt: str,
    output_format: str = "glb",
) -> dict:
    if not prompt.strip():
        raise ValueError("Prompt cannot be empty.")

    async with httpx.AsyncClient() as client:
        payload = {
            "prompt": prompt,
        }

        logger.info(f"[fal] Starting text→3D | prompt='{prompt[:60]}'")
        data = await _submit(client, "fal-ai/hyper3d/rodin", payload)
        logger.warning(f"[fal] Text→3D raw response keys: {list(data.keys())}")
        logger.warning(f"[fal] Text→3D raw response: {data}")
        return _extract(data)