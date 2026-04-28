/**
 * OCR Service for VitaMend
 * Developed by Rachit
 *
 * This service calls the backend OCR microservice (FastAPI + Tesseract + OpenCV)
 * to extract medicine information and detect tampering.
 */

export interface OCRCheckResponse {
  expiry: string | null;
  batch: string | null;
  medicine_name: string | null;
  qr_expiry: string | null;
  expired: boolean;
  tampered: boolean;
  confidence: number;
  needs_review: boolean;
  mismatch?: boolean;
  raw_text?: string;
}

export class OCRService {
  /**
   * Processes a medicine image through the backend OCR service.
   * This handles text extraction, expiry detection, and tamper checks.
   */
  static async processImage(file: File): Promise<OCRCheckResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "OCR processing failed");
      }

      return await response.json();
    } catch (error) {
      console.error("OCR Service Error:", error);
      throw error;
    }
  }

  /**
   * Compatibility wrapper for medicine validation
   */
  static async validateMedicineImage(file: File): Promise<{
    isValid: boolean
    confidence: number
    issues: string[]
  }> {
    try {
      const result = await this.processImage(file);
      const issues: string[] = [];
      
      if (result.tampered) issues.push("Potential tampering detected");
      if (result.expired) issues.push("Medicine has expired");
      if (result.mismatch) issues.push("Expiry date mismatch between text and QR");
      if (result.confidence < 0.6) issues.push("Low confidence in text recognition");

      return {
        isValid: !result.tampered && !result.expired && !result.needs_review,
        confidence: result.confidence * 100,
        issues,
      };
    } catch (error) {
      return {
        isValid: false,
        confidence: 0,
        issues: ["Failed to process image"],
      };
    }
  }

  // Legacy placeholders for compatibility if needed elsewhere
  static async extractExpiryDate(file: File): Promise<Date | null> {
    try {
      const result = await this.processImage(file);
      return result.expiry ? new Date(result.expiry) : null;
    } catch {
      return null;
    }
  }

  static async extractMedicineName(file: File): Promise<string[]> {
    // Note: The Python service currently focuses on expiry/tamper.
    // We can extend it or use a simple regex on the raw text if needed.
    return [];
  }

  static async terminate(): Promise<void> {
    // No-op for API-based service
  }
}
