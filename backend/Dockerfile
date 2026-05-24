# ─── Backend Dockerfile ───────────────────────────────────────────────────────
FROM python:3.11-slim

# Install system dependencies (tesseract for OCR, libpq for postgres)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app/ ./app/

# Create directories that the app expects at runtime
RUN mkdir -p ./uploads ./chroma_db

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
