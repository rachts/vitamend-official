import sharp from "sharp";
import Tesseract from "tesseract.js";
import { OCRCheckResponse } from "./ocr-service";

/**
 * Node.js Native OCR Pipeline
 * 
 * Stage 1: Image Preprocessing (sharp)
 * Stage 2: OCR Extraction (tesseract.js)
 * Stage 3: Intelligent Parsing (Regex & Rules)
 */
export async function processImageWithNodeOCR(fileBuffer: Buffer): Promise<OCRCheckResponse> {
  // Stage 1: Image Preprocessing
  // Maximize OCR readability by converting to grayscale, adaptive thresholding, and sharpening.
  const preprocessedBuffer = await sharp(fileBuffer)
    .resize({ width: 1000, withoutEnlargement: true }) // Resize (min width ~1000px)
    .grayscale() // Convert to grayscale
    .normalize() // Adaptive thresholding / normalization
    .blur(0.5) // Denoising (Gaussian blur)
    .sharpen({ // Sharpening
      sigma: 1.5,
      m1: 1.2,
      m2: 0.8,
      x1: 2,
      y2: 10,
      y3: 20
    })
    .toBuffer();

  // Stage 2: OCR Extraction
  const { data: { text, confidence } } = await Tesseract.recognize(
    preprocessedBuffer,
    "eng",
    {
      logger: m => console.log(m) // Optional: remove in production or keep for debugging
    }
  );

  // Stage 3: Intelligent Parsing
  const parsedData = parseText(text);

  // 4. Accuracy Boost Techniques / Heuristic Rules
  let expired = false;
  let tampered = false;
  let needs_review = false;
  let mismatch = false;

  if (parsedData.exp) {
    const expDate = parseDate(parsedData.exp);
    if (expDate && expDate < new Date()) {
      expired = true;
    }
    
    if (parsedData.mfg) {
      const mfgDate = parseDate(parsedData.mfg);
      if (mfgDate && expDate && mfgDate > expDate) {
        // OCR error: MFG > EXP
        needs_review = true;
      }
    }
  } else {
    needs_review = true; // Expiry not found
  }

  const normalizedConfidence = confidence / 100;
  if (normalizedConfidence < 0.6) {
    needs_review = true;
  }

  return {
    expiry: parsedData.exp,
    batch: parsedData.batch,
    medicine_name: parsedData.medicineName,
    qr_expiry: null, // Custom parsing does not currently handle QR
    expired,
    tampered, // No logic yet to detect tamper purely from text, defaults false
    confidence: normalizedConfidence,
    needs_review,
    mismatch,
    raw_text: text,
  };
}

function parseText(text: string) {
  const batchRegex = /(Batch\s*(No|Number)?|B\.?No|Lot\s*No)\s*[:\-]?\s*([A-Z0-9]+)/i;
  const mfgRegex = /(MFG|Mfd|Manufactured)\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/i;
  const expRegex = /(EXP|Expiry|Best\s*Before)\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/i;
  
  // Fallback regex for dates
  const fallbackDateRegex = /\d{2}[-\/]\d{4}|\w{3}\s\d{4}/g;

  let exp = text.match(expRegex)?.[2] || null;
  if (!exp) {
    const dates = text.match(fallbackDateRegex);
    if (dates && dates.length > 0) {
      exp = dates[dates.length - 1]; // Assume last matched date is expiry
    }
  }

  return {
    batch: text.match(batchRegex)?.[3] || null,
    mfg: text.match(mfgRegex)?.[2] || null,
    exp,
    medicineName: extractMedicineName(text),
  };
}

function extractMedicineName(text: string): string | null {
  const stopWords = ["tablet", "capsule", "mg", "ml", "syrup", "batch", "exp", "mfg", "price", "mrp", "rs"];
  
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 3) 
    .filter(line => !/^\d+$/.test(line)) 
    .filter(line => {
      const lower = line.toLowerCase();
      return !stopWords.some(word => lower.includes(word));
    });

  lines.sort((a, b) => b.length - a.length);
  
  if (lines.length > 0) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const candidate = lines[i];
      // Filtering out purely alphabetic/numeric gibberish strings
      if (candidate.split(' ').length < 5) {
        return candidate;
      }
    }
    return lines[0]; 
  }

  return null;
}

function parseDate(dateStr: string): Date | null {
  try {
    let normalized = dateStr.replace(/-/g, '/');
    const parts = normalized.split('/');
    if (parts.length === 3) {
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      return new Date(year, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else if (parts.length === 2) {
      let year = parseInt(parts[1], 10);
      if (year < 100) year += 2000;
      return new Date(year, parseInt(parts[0], 10) - 1, 1);
    } else if (/[a-zA-Z]{3}\s\d{4}/.test(normalized)) {
      return new Date(normalized);
    }
  } catch (e) {
    return null;
  }
  return null;
}
