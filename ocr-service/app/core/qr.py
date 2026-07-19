import asyncio
from typing import Dict, Optional
from datetime import date, datetime
import cv2
import numpy as np
from pyzbar.pyzbar import decode as qr_decode
from dateutil import parser as dateparser
from starlette.concurrency import run_in_threadpool

def _decode_qr_sync(img_bgr: np.ndarray) -> Dict[str, Optional[str]]:
    """
    Decodes QR code from the given BGR image and attempts to extract an expiry date.
    """
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    codes = qr_decode(rgb)
    
    parts = []
    for c in codes:
        try:
            parts.append(c.data.decode("utf-8", errors="ignore"))
        except Exception:
            continue
            
    qr_text = " ".join(parts).strip()
    
    expiry_if_found: Optional[str] = None
    if qr_text:
        try:
            dt = dateparser.parse(qr_text, fuzzy=True, default=datetime.utcnow())
            expiry_if_found = date(dt.year, dt.month, dt.day).isoformat()
        except Exception:
            pass
            
    return {
        "qr_text": qr_text,
        "expiry_if_found": expiry_if_found
    }

async def decode_qr_text_async(img_bgr: np.ndarray) -> Dict[str, Optional[str]]:
    """
    Asynchronously decodes QR code.
    """
    try:
        return await asyncio.to_thread(_decode_qr_sync, img_bgr)
    except AttributeError:
        # Fallback for older Python versions
        return await run_in_threadpool(_decode_qr_sync, img_bgr)
