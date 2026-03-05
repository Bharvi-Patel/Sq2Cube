#denoise_code
import cv2

def denoise_image(image):
    """Removes digital noise while keeping edges sharp."""
    # This filter is great for preserving object details
    denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
    return denoised
