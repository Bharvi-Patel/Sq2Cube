# Image preprocessing module
from preprocessing import background_removal, denoise, contrast, resize

def run_full_pipeline(image_path):
    # 1. Remove background
    img = background_removal.remove_bg(image_path)
    # 2. Denoise
    img = denoise.denoise_image(img)
    # 3. Resize
    img = resize.resize_image(img, size=(512, 512))
    return img
