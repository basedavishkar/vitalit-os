#!/bin/bash

# VITALIt-OS Development Script
# This script sets up the development environment

set -e

echo "🏥 VITALIt-OS Development Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
pip install -e .

# Create necessary directories
print_status "Creating directories..."
mkdir -p data logs backups uploads

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# VITALIt-OS Environment Variables
DATABASE_URL=sqlite:///./hospital.db
SECRET_KEY=dev-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
LOG_LEVEL=DEBUG
LOG_FILE=vitalit.log
BACKUP_DIR=backups
BACKUP_RETENTION_DAYS=30
EOF
    print_status ".env file created with development defaults"
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

print_status "Development setup completed! 🎉"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Option 1: Run with Docker Compose (Recommended)"
echo "  docker-compose -f docker-compose.dev.yml up --build"
echo ""
echo "Option 2: Run locally"
echo "  # Terminal 1 (Backend):"
echo "  source venv/bin/activate"
echo "  uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "  # Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "🌐 Access URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "  Health Check: http://localhost:8000/health" 