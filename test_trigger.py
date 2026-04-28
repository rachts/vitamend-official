import asyncio
from app.main import ocr_check
from fastapi import UploadFile
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
with open("ocr-service/tests/fixtures/sample_strip.jpg", "rb") as f:
    resp = client.post("/api/ocr-check", files={"file": ("sample_strip.jpg", f, "image/jpeg")})
    print(resp.status_code)
    print(resp.json())
