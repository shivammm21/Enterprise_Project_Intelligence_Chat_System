# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies with minimal memory usage
# Install large packages separately to avoid memory spikes
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --no-deps uvicorn && \
    pip install --no-cache-dir --no-deps fastapi && \
    pip install --no-cache-dir --no-deps sqlalchemy && \
    pip install --no-cache-dir --no-deps asyncpg && \
    pip install --no-cache-dir --no-deps pydantic && \
    pip install --no-cache-dir --no-deps pydantic-settings && \
    pip install --no-cache-dir --no-deps python-jose && \
    pip install --no-cache-dir --no-deps passlib && \
    pip install --no-cache-dir --no-deps python-multipart && \
    pip install --no-cache-dir --no-deps aiofiles && \
    pip install --no-cache-dir --no-deps PyPDF2 && \
    pip install --no-cache-dir --no-deps python-docx && \
    pip install --no-cache-dir --no-deps tiktoken && \
    pip install --no-cache-dir --no-deps chromadb && \
    pip install --no-cache-dir --no-deps langchain && \
    pip install --no-cache-dir --no-deps langchain-openai && \
    pip install --no-cache-dir --no-deps langchain-google-genai && \
    pip install --no-cache-dir --no-deps langchain-chroma && \
    pip install --no-cache-dir --no-deps langchain-community && \
    pip install --no-cache-dir --no-deps requests && \
    pip install --no-cache-dir -r requirements.txt || true

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads chroma_db

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
