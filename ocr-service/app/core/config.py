from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OCR_CONF_THRESHOLD: float = 0.70
    TAMPER_SCORE_THRESHOLD: float = 0.50
    MAX_IMAGE_PIXELS: int = 64_000_000  # 8000 * 8000
    MAX_UPLOAD_BYTES: int = 8_388_608   # 8 * 1024 * 1024
    OCR_TIMEOUT_SECONDS: float = 15.0
    UPLOADS_DIR: str = "ocr-service/uploads"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
