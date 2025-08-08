# Multi-stage build for production
FROM python:3.11-slim as backend-builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r vitalit && useradd -r -g vitalit vitalit

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY alembic/ ./alembic/
COPY alembic.ini .
COPY main.py .
COPY setup.py .

# Frontend build stage
FROM node:18-alpine as frontend-builder

WORKDIR /app

# Copy frontend files
COPY frontend/package*.json ./

# Install dependencies with specific npm config
RUN npm config set registry https://registry.npmjs.org/ && \
    npm ci --only=production --audit=false

COPY frontend/ ./

# Build frontend with production optimization
RUN npm run build

# Production stage
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create non-root user and necessary directories
RUN groupadd -r vitalit && \
    useradd -r -g vitalit vitalit && \
    mkdir -p /app/logs /app/backups /app/uploads /app/certs && \
    chown -R vitalit:vitalit /app

# Copy Python dependencies and application code from builder
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin
COPY --from=backend-builder /app/backend ./backend
COPY --from=backend-builder /app/alembic ./alembic
COPY --from=backend-builder /app/alembic.ini .
COPY --from=backend-builder /app/main.py .
COPY --from=backend-builder /app/setup.py .

# Copy frontend build
COPY --from=frontend-builder /app/.next ./frontend/.next
COPY --from=frontend-builder /app/public ./frontend/public

# Copy configuration files
COPY ./backend/.env.production ./.env
COPY ./backend/core/config.py ./backend/core/

# Set proper permissions
RUN chown -R vitalit:vitalit /app && \
    chmod -R 750 /app && \
    chmod -R 770 /app/logs /app/backups /app/uploads

# Switch to non-root user
USER vitalit

# Set secure environment defaults
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.local/bin:$PATH" \
    PORT=8000

# Resource limits (can be overridden)
ENV MEMORY_LIMIT="512m" \
    CPU_LIMIT="1.0"

# Expose ports
EXPOSE 8000

# Health check with retries
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Install the package
RUN pip install -e .

# Default command
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"] 