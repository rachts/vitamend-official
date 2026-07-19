"""
Project: Vitamend
Creator: Rachit Kumar Tiwari
"""
from typing import Optional
from pydantic import BaseModel, Field


class OCRCheckResponse(BaseModel):
    medicine_name: Optional[str] = Field(None)
    expiry_date: Optional[str] = Field(None)
    qr_expiry: Optional[str] = Field(None)
    batch_number: Optional[str] = Field(None)
    confidence: float
    tamper_score: float
    tampered: bool
    needs_review: bool
    review_reasons: list[str] = Field(default_factory=list)
    expired: bool
    processing_time: float
