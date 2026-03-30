import requests

with open("test.png", "wb") as f:
    f.write(b"\x89PNG\r\n\x1a\n" + b"A"*100) # dummy png

url = "http://127.0.0.1:8000/convert/single-image"
files = {'file': ('test.png', open('test.png', 'rb'), 'image/png')}
data = {'output_format': 'glb', 'remove_background': True, 'mc_resolution': 256}

try:
    response = requests.post(url, files=files, data=data)
    print("STATUS:", response.status_code)
    print("BODY:", response.text)
except Exception as e:
    print("ERROR:", e)
