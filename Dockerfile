# Multi-stage build for production
FROM python:3.11-slim as backend-builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY alembic/ ./alembic/
COPY alembic.ini .
COPY main.py .
COPY setup.py .

# Create necessary directories
RUN mkdir -p logs backups uploads

# Frontend build stage
FROM node:18-alpine as frontend-builder

WORKDIR /app

# Copy frontend files
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ ./
RUN npm run build

# Production stage
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy backend code
COPY --from=backend-builder /app/backend ./backend
COPY --from=backend-builder /app/alembic ./alembic
COPY --from=backend-builder /app/alembic.ini .
COPY --from=backend-builder /app/main.py .
COPY --from=backend-builder /app/setup.py .

# Copy frontend build
COPY --from=frontend-builder /app/.next ./frontend/.next
COPY --from=frontend-builder /app/public ./frontend/public

# Create necessary directories
RUN mkdir -p logs backups uploads

# Create non-root user
RUN useradd --create-home --shell /bin/bash vitalit
RUN chown -R vitalit:vitalit /app
USER vitalit

# Expose ports
EXPOSE 8000 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Install the package
RUN pip install -e .

# Default command
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"] 