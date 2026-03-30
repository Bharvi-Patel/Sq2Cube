from dotenv import load_dotenv
load_dotenv(".env")
load_dotenv("sq2cube-backend/.env")

import fal_client
import base64
import os
import sys

data = b"\x89PNG\r\n\x1a\n" + b"A"*100
mime = "image/png"

try:
    url = fal_client.upload(data, mime, file_name="test.png")
    print("SUCCESS_URL:", url)
except Exception as e:
    print("ERROR:", str(e))
