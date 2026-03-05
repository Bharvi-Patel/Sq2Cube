#background_removal_code
import rembg
import cv2
import numpy as np

def remove_bg(input_path):
    with open(input_path, 'rb') as f:
        input_data = f.read()
    subject = rembg.remove(input_data)
    # Convert back to a format OpenCV can use
    nparr = np.frombuffer(subject, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    return img
