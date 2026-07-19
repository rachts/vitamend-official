import os
import asyncio
import time
import logging
from datetime import date, datetime
from calendar import monthrange
from typing import Any, Optional

import cv2
import numpy as np
import pytesseract
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from pythonjsonlogger import jsonlogger
from starlette.concurrency import run_in_threadpool

from .db import get_db, ping_db, close_db
from .schemas import OCRCheckResponse
from .core.config import settings
from .core.preprocessing import preprocess_image
from .core.ocr import ocr_with_conf_async
from .core.qr import decode_qr_text_async
from .core.parser import (
    parse_expiry_candidates,
    normalize_date,
    extract_batch_code,
    extract_medicine_name
)
from .core.tamper import evaluate_tamper_score
from .core.decision import needs_review

# Configure Structured JSON Logging
logger = logging.getLogger("vitamend.ocr")
logger.setLevel(logging.INFO)
log_handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
log_handler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(log_handler)

if os.getenv("TESSERACT_CMD"):
    pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD")

os.makedirs(settings.UPLOADS_DIR, exist_ok=True)

app = FastAPI(
    title="Vitamend OCR & Verification API", 
    version="2.1.0",
    description="Enterprise-grade AI verification for medicine images incorporating ensemble OCR and SSIM tamper detection."
)


def allowed_content_type(ct: Optional[str]) -> bool:
    if not ct:
        return False
    return ct.lower() in {"image/jpeg", "image/jpg", "image/png", "image/webp"}


def ensure_max_bytes(raw: bytes, max_bytes: int) -> None:
    if not isinstance(raw, (bytes, bytearray)):
        raise ValueError("Invalid file content")
    if len(raw) == 0:
        raise ValueError("Empty file")
    if len(raw) > max_bytes:
        raise ValueError("File too large")


def _imdecode_safe(buf: bytes) -> np.ndarray:
    arr = np.frombuffer(buf, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image data")
    return img


def _validate_image_dims(img: np.ndarray) -> None:
    h, w = img.shape[:2]
    if h * w > settings.MAX_IMAGE_PIXELS:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image too large")


def _is_expired(exp: date) -> bool:
    y, m = exp.year, exp.month
    last_day = date(y, m, monthrange(y, m)[1])
    return date.today() > last_day


async def _run_with_timeout(coro, timeout: float, message: str):
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        logger.error(message, extra={"timeout": timeout})
        raise HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT, detail=message)


@app.on_event("startup")
async def startup_event():
    await ping_db()


@app.on_event("shutdown")
async def shutdown_event():
    await close_db()


@app.get("/health", summary="Health Check")
async def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.post("/api/ocr-check", response_model=OCRCheckResponse, summary="Process Medicine Image")
async def ocr_check(file: UploadFile = File(...), db=Depends(get_db)) -> JSONResponse:
    """
    Verifies medicine authenticity, expiry, and safety using AI algorithms.
    Runs ensemble preprocessing, concurrent OCR, QR detection, and SSIM tamper detection.
    """
    start_time = time.time()
    logger.info("Received verification request", extra={"filename": file.filename})

    if not allowed_content_type(file.content_type):
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported image type")
    
    raw = await file.read()
    try:
        ensure_max_bytes(raw, settings.MAX_UPLOAD_BYTES)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(e))

    try:
        img = await run_in_threadpool(_imdecode_safe, raw)
        _validate_image_dims(img)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Could not decode image", exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not decode image") from e

    try:
        # Preprocessing Ensemble
        proc_variants = await run_in_threadpool(preprocess_image, img)
        
        # Parallel OCR and QR Decoding
        ocr_task = ocr_with_conf_async(proc_variants)
        qr_task = decode_qr_text_async(img)
        
        ocr_res, qr_res = await _run_with_timeout(
            asyncio.gather(ocr_task, qr_task),
            settings.OCR_TIMEOUT_SECONDS,
            "OCR or QR scanning timed out"
        )
        
        text = ocr_res.get("text", "")
        avg_conf = float(ocr_res.get("confidence", 0.0))
        logger.info("OCR completed", extra={
            "confidence": avg_conf, 
            "source_variant": ocr_res.get('source_image')
        })
        
        qr_text = qr_res.get("qr_text")
        expiry_qr_str = qr_res.get("expiry_if_found")

        # Data Extraction
        batch = extract_batch_code(text)
        medicine_name = extract_medicine_name(text)
        
        from .core.parser import DATE_PATTERNS
        from dateutil import parser as dateparser
        
        expiry_ocr: Optional[date] = None
        candidates = parse_expiry_candidates(text)
        if candidates:
            expiry_ocr = normalize_date(candidates[0])
            
        expiry_qr: Optional[date] = None
        if expiry_qr_str:
            try:
                dt = dateparser.parse(expiry_qr_str, fuzzy=True, default=datetime.utcnow())
                expiry_qr = date(dt.year, dt.month, dt.day)
            except Exception:
                pass

        final_expiry: Optional[date] = expiry_qr or expiry_ocr
        expired = bool(final_expiry and _is_expired(final_expiry))

        # Tamper Detection
        tamper_res = await run_in_threadpool(evaluate_tamper_score, proc_variants["grayscale"], proc_variants["threshold"])
        tamper_score = tamper_res.get("tamper_score", 0.0)
        tampered = tamper_res.get("tampered", False)

        # Decision Engine
        decision = needs_review(
            confidence=avg_conf,
            tamper_score=tamper_score,
            ocr_expiry=expiry_ocr,
            qr_expiry=expiry_qr,
            expired=expired,
            conf_threshold=settings.OCR_CONF_THRESHOLD,
            tamper_threshold=settings.TAMPER_SCORE_THRESHOLD
        )
        
        processing_time = time.time() - start_time
        logger.info("Verification finished", extra={
            "processing_time": processing_time,
            "needs_review": decision["needs_review"],
            "medicine_name": medicine_name,
            "tamper_score": tamper_score
        })

        # Database Insertion
        doc: dict[str, Any] = {
            "medicine_name": medicine_name,
            "batch_number": batch,
            "ocr_text": text[:2000].replace("\x00", " "),
            "ocr_confidence": avg_conf,
            "expiry": final_expiry.isoformat() if final_expiry else None,
            "qr_expiry": expiry_qr.isoformat() if expiry_qr else None,
            "tamper_score": tamper_score,
            "tampered": tampered,
            "needs_review": decision["needs_review"],
            "review_reasons": decision["review_reasons"],
            "created_at": datetime.utcnow(),
            "processing_time": processing_time
        }

        try:
            await db["ocr_results"].insert_one(doc)
        except Exception:
            logger.error("Failed to insert result to DB", exc_info=True)

        resp = {
            "medicine_name": medicine_name,
            "expiry_date": final_expiry.isoformat() if final_expiry else None,
            "qr_expiry": expiry_qr.isoformat() if expiry_qr else None,
            "batch_number": batch,
            "confidence": round(avg_conf, 4),
            "tamper_score": round(tamper_score, 4),
            "tampered": tampered,
            "needs_review": decision["needs_review"],
            "review_reasons": decision["review_reasons"],
            "expired": expired,
            "processing_time": round(processing_time, 2)
        }
        return JSONResponse(status_code=200, content=resp)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Internal server error during verification", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error") from e
