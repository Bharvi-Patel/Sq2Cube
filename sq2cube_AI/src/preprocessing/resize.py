# resize code
import cv2

def resize_image(image, size=(512, 512)):
    """Resizes the image to the required dimensions for the 3D model."""
    # Use INTER_AREA for shrinking, INTER_CUBIC for zooming
    resized = cv2.resize(image, size, interpolation=cv2.INTER_AREA)
    return resized
