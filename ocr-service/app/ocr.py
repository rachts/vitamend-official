"""
Project: Vitamend
Creator: Rachit Kumar Tiwari
"""
from dataclasses import dataclass
from typing import Any, List
import asyncio

import cv2
import numpy as np
import pytesseract
from starlette.concurrency import run_in_threadpool
from pyzbar.pyzbar import decode as qr_decode

try:
    pytesseract.get_tesseract_version()
except pytesseract.TesseractNotFoundError:
    print("WARNING: Tesseract not found. Please ensure it is installed or set pytesseract.pytesseract.tesseract_cmd")



@dataclass
class Preprocessed:
    gray: np.ndarray
    thresh: np.ndarray


def preprocess_image(img_bgr: np.ndarray) -> Preprocessed:
    if img_bgr is None or img_bgr.size == 0:
        raise ValueError("Invalid image input")
        
    # Resize for better OCR accuracy
    img_resized = cv2.resize(img_bgr, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, th = cv2.threshold(gray_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    return Preprocessed(gray=gray, thresh=th)


async def _image_to_data(img: np.ndarray) -> dict:
    def _run(x):
        return pytesseract.image_to_data(
            x, 
            output_type=pytesseract.Output.DICT,
            config='--oem 3 --psm 6',
            lang='eng'
        )
    try:
        return await asyncio.to_thread(_run, img)
    except AttributeError:
        return await run_in_threadpool(_run, img)


async def ocr_with_conf_async(gray: np.ndarray, thresh: np.ndarray):
    try:
        cv2.imwrite("debug_gray.png", gray)
        cv2.imwrite("debug_thresh.png", thresh)
    except Exception as e:
        print(f"DEBUG: Failed to write debug images: {e}")

    data1, data2 = await asyncio.gather(_image_to_data(gray), _image_to_data(thresh))

    def _process_data(data):
        words = [w for w in data.get("text", []) if isinstance(w, str) and w.strip()]
        text = " ".join(words)
        confs = []
        for i, c in enumerate(data.get("conf", [])):
            try:
                # -1 means no confidence value available for this word
                if c not in ("-1", "", None) and int(c) != -1:
                    word = str(data.get("text", [])[i])
                    if word.strip():
                        # Weighting by word length
                        confs.extend([float(c)] * len(word.strip()))
            except Exception:
                continue
        avg_conf = float(np.mean(confs) / 100.0) if confs else 0.0
        return text, avg_conf

    text1, conf1 = _process_data(data1)
    text2, conf2 = _process_data(data2)

    print(f"DEBUG: Extracted text (Gray): {text1} | Confidence: {conf1}")
    print(f"DEBUG: Extracted text (Thresh): {text2} | Confidence: {conf2}")

    class Res:
        def __init__(self, text: str, avg_conf: float) -> None:
            self.text = text
            self.avg_conf = avg_conf

    # Pick the one with higher confidence
    if conf1 >= conf2:
        return Res(text1, conf1)
    return Res(text2, conf2)


def _decode_qr_sync(img_bgr: np.ndarray) -> str:
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    codes = qr_decode(rgb)
    parts = []
    for c in codes:
        try:
            parts.append(c.data.decode("utf-8", errors="ignore"))
        except Exception:
            continue
    return " ".join(parts).strip()


async def decode_qr_text_async(img_bgr: np.ndarray) -> str:
    try:
        return await asyncio.to_thread(_decode_qr_sync, img_bgr)
    except AttributeError:
        return await run_in_threadpool(_decode_qr_sync, img_bgr)


def bhattacharyya_tamper_score(gray: np.ndarray, thresh: np.ndarray) -> float:
    h, w = gray.shape[:2]
    if h < 10 or w < 10:
        return 0.0
    left = gray[:, : w // 2]
    right = gray[:, w // 2 :]
    ha = cv2.calcHist([left], [0], None, [256], [0, 256])
    ha = cv2.normalize(ha, ha).flatten()
    hb = cv2.calcHist([right], [0], None, [256], [0, 256])
    hb = cv2.normalize(hb, hb).flatten()
    dist = cv2.compareHist(ha, hb, cv2.HISTCMP_BHATTACHARYYA)
    return float(dist)
