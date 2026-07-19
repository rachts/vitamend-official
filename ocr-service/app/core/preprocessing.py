import cv2
import numpy as np
from typing import Dict

def deskew(image: np.ndarray) -> np.ndarray:
    """
    Attempts to deskew an image using minAreaRect.
    """
    coords = np.column_stack(np.where(image > 0))
    if coords.size == 0:
        return image
    angle = cv2.minAreaRect(coords)[-1]
    
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
        
    if abs(angle) < 0.5:
        return image
        
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated

def preprocess_image(image: np.ndarray) -> Dict[str, np.ndarray]:
    """
    Preprocesses the image for OCR returning an ensemble of variants.
    """
    if image is None or image.size == 0:
        raise ValueError("Invalid image input")
        
    # Resize for better OCR accuracy
    img_resized = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    
    # 1. Grayscale
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    
    # 2. Threshold
    gray_blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(gray_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # 3. CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe_obj = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    clahe = clahe_obj.apply(gray)
    
    # 4. Sharpen
    kernel = np.array([[-1, -1, -1], 
                       [-1,  9, -1], 
                       [-1, -1, -1]])
    sharpen = cv2.filter2D(gray, -1, kernel)
    
    # 5. Adaptive Gaussian Thresholding
    adaptive = cv2.adaptiveThreshold(
        gray_blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # 6. Deskew
    deskewed = deskew(thresh)
    
    return {
        "grayscale": gray,
        "threshold": thresh,
        "clahe": clahe,
        "sharpen": sharpen,
        "adaptive": adaptive,
        "deskew": deskewed
    }
