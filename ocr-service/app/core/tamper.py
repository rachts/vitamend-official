import cv2
import numpy as np
from typing import Dict, Union

from skimage.metrics import structural_similarity as ssim

def evaluate_tamper_score(gray: np.ndarray, thresh: np.ndarray) -> Dict[str, Union[float, bool]]:
    """
    Detects tampering by comparing the left and right halves of the image using both 
    histogram Bhattacharyya distance and Structural Similarity Index (SSIM).
    A weighted ensemble score is computed to reduce false positives.
    """
    h, w = gray.shape[:2]
    
    # If image is too small to accurately split, assume safe
    if h < 10 or w < 10:
        return {
            "tamper_score": 0.0,
            "tampered": False
        }
        
    left = gray[:, : w // 2]
    right = gray[:, w // 2 :]
    
    # Ensure dimensions match for SSIM
    if left.shape != right.shape:
        min_w = min(left.shape[1], right.shape[1])
        left = left[:, :min_w]
        right = right[:, :min_w]
    
    # 1. Bhattacharyya distance on histograms
    hist_a = cv2.calcHist([left], [0], None, [256], [0, 256])
    hist_b = cv2.calcHist([right], [0], None, [256], [0, 256])
    
    hist_a = cv2.normalize(hist_a, hist_a).flatten()
    hist_b = cv2.normalize(hist_b, hist_b).flatten()
    
    bhatt_distance = float(cv2.compareHist(hist_a, hist_b, cv2.HISTCMP_BHATTACHARYYA))
    
    # 2. Structural Similarity Index (SSIM)
    # SSIM ranges from -1 to 1 (1 being identical). 
    # Convert to a distance metric (0 to 1 where 0 is identical)
    try:
        ssim_val = ssim(left, right)
        ssim_distance = (1.0 - ssim_val) / 2.0
    except Exception:
        # Fallback if SSIM fails for any reason
        ssim_distance = bhatt_distance
    
    # Weighted ensemble (SSIM is generally more reliable for texture/noise inconsistency)
    ensemble_score = (bhatt_distance * 0.3) + (ssim_distance * 0.7)
    
    return {
        "tamper_score": float(ensemble_score),
        "tampered": float(ensemble_score) > 0.5
    }
