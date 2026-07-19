import asyncio
from typing import Dict, Union
import numpy as np
import pytesseract
from starlette.concurrency import run_in_threadpool

def _image_to_data(img: np.ndarray) -> dict:
    """
    Run Tesseract OCR on the image.
    """
    return pytesseract.image_to_data(
        img,
        output_type=pytesseract.Output.DICT,
        config='--oem 3 --psm 6',
        lang='eng'
    )

def _process_ocr_data(data: dict) -> tuple[str, float]:
    """
    Process Tesseract data to extract text and calculate weighted confidence.
    confidence = Σ(word_length × confidence) / Σ(word_length)
    """
    words = []
    total_weighted_conf = 0.0
    total_length = 0

    texts = data.get("text", [])
    confs = data.get("conf", [])

    for i, conf_str in enumerate(confs):
        try:
            # Tesseract returns '-1' for words it couldn't assign a confidence to (like spaces)
            if conf_str not in ("-1", "", None) and int(conf_str) != -1:
                word = str(texts[i]).strip()
                if word:
                    words.append(word)
                    word_len = len(word)
                    conf_val = float(conf_str) / 100.0  # Normalize to 0-1
                    total_weighted_conf += conf_val * word_len
                    total_length += word_len
        except Exception:
            continue
            
    text = " ".join(words)
    confidence = total_weighted_conf / total_length if total_length > 0 else 0.0
    return text, confidence

async def ocr_with_conf_async(image_variants: Dict[str, np.ndarray]) -> Dict[str, Union[str, float]]:
    """
    Run OCR simultaneously on all provided image variants (ensemble).
    Choose the result with the highest confidence.
    """
    variant_names = list(image_variants.keys())
    tasks = []
    
    for name in variant_names:
        img = image_variants[name]
        try:
            tasks.append(asyncio.to_thread(_image_to_data, img))
        except AttributeError:
            tasks.append(run_in_threadpool(_image_to_data, img))
            
    results = await asyncio.gather(*tasks)
    
    best_text = ""
    best_conf = -1.0
    best_variant = "unknown"
    
    for i, data in enumerate(results):
        text, conf = _process_ocr_data(data)
        if conf > best_conf:
            best_conf = conf
            best_text = text
            best_variant = variant_names[i]
            
    return {
        "text": best_text,
        "confidence": best_conf,
        "source_image": best_variant
    }
