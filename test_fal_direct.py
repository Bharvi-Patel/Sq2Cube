"""
Direct test of fal_client SDK to see if it works at all.
"""
import os, sys
sys.path.insert(0, "sq2cube-backend")
from dotenv import load_dotenv
load_dotenv("sq2cube-backend/.env")

print("FAL_KEY set?", bool(os.getenv("FAL_KEY")))
print("FAL_KEY prefix:", os.getenv("FAL_KEY", "")[:10] + "...")

import fal_client

# Step 1: Try uploading a tiny image
print("\n--- Step 1: Upload test ---")
# Create a minimal valid PNG (1x1 pixel, red)
import struct, zlib
def make_png():
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)
    ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    raw = zlib.compress(b"\x00\xff\x00\x00")  # filter byte + RGB
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", raw) + chunk(b"IEND", b"")

png_bytes = make_png()
print(f"  PNG size: {len(png_bytes)} bytes")

try:
    url = fal_client.upload(png_bytes, "image/png", file_name="test.png")
    print(f"  Upload SUCCESS: {url}")
except Exception as e:
    print(f"  Upload FAILED: {type(e).__name__}: {e}")
    sys.exit(1)

# Step 2: Try running TripoSR
print("\n--- Step 2: TripoSR test ---")
try:
    result = fal_client.subscribe(
        "fal-ai/triposr",
        arguments={
            "image_url": url,
            "output_format": "glb",
            "do_remove_background": True,
            "foreground_ratio": 0.9,
            "mc_resolution": 128,  # low res for fast test
        },
        with_logs=True,
    )
    print(f"  TripoSR SUCCESS!")
    print(f"  Keys: {list(result.keys())}")
    if "model_mesh" in result:
        print(f"  model_mesh URL: {result['model_mesh'].get('url', 'N/A')}")
    print(f"  Full result: {result}")
except Exception as e:
    print(f"  TripoSR FAILED: {type(e).__name__}: {e}")
