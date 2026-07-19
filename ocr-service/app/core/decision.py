from typing import Dict, Any, List
from datetime import date

def needs_review(
    confidence: float, 
    tamper_score: float, 
    ocr_expiry: date | None, 
    qr_expiry: date | None, 
    expired: bool,
    conf_threshold: float = 0.70,
    tamper_threshold: float = 0.5
) -> Dict[str, Any]:
    """
    Evaluates whether the automated verification result requires manual review.
    
    Rules:
    - OCR confidence is below threshold
    - Tamper score is above threshold
    - OCR expiry and QR expiry do not match
    - Medicine is flagged as expired
    - Unable to find expiry date
    """
    reasons: List[str] = []
    
    if confidence < conf_threshold:
        reasons.append(f"Low OCR confidence ({confidence:.2f} < {conf_threshold})")
        
    if tamper_score > tamper_threshold:
        reasons.append(f"Tamper detected (score: {tamper_score:.2f} > {tamper_threshold})")
        
    if qr_expiry and ocr_expiry and qr_expiry != ocr_expiry:
        reasons.append(f"Expiry mismatch (OCR: {ocr_expiry}, QR: {qr_expiry})")
        
    if expired:
        reasons.append("Medicine is expired")
        
    if not qr_expiry and not ocr_expiry:
        reasons.append("Could not extract expiry date")
        
    return {
        "needs_review": len(reasons) > 0,
        "review_reasons": reasons
    }
