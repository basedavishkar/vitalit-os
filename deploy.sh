#!/bin/bash

# VITALIt-OS Deployment Script
# This script sets up the complete production environment

set -e

echo "🏥 VITALIt-OS Production Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Prerequisites check passed!"

# Create necessary directories
print_status "Creating directories..."
mkdir -p data logs backups uploads ssl

# Generate secret key if not exists
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# VITALIt-OS Environment Variables
SECRET_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 16)
LOG_LEVEL=INFO
DATABASE_URL=sqlite:///./hospital.db

# Optional: PostgreSQL for production
# DATABASE_URL=postgresql://vitalit:vitalit_password@postgres:5432/vitalit

# Email settings (optional)
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
EOF
    print_status ".env file created with secure defaults"
else
    print_warning ".env file already exists, skipping creation"
fi

# Set proper permissions
print_status "Setting permissions..."
chmod 600 .env
chmod 755 deploy.sh

# Build and start services
print_status "Building and starting services..."

# For development (SQLite)
if [ "$1" = "dev" ]; then
    print_status "Starting in development mode..."
    docker-compose up --build -d
else
    # For production (PostgreSQL + Redis + Nginx)
    print_status "Starting in production mode..."
    docker-compose --profile production up --build -d
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_status "✅ VITALIt-OS is running successfully!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Documentation: http://localhost:8000/docs"
    echo ""
    echo "📁 Important directories:"
    echo "   Logs: ./logs"
    echo "   Backups: ./backups"
    echo "   Uploads: ./uploads"
    echo "   Data: ./data"
    echo ""
    echo "🔧 Management commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Update: git pull && docker-compose up --build -d"
    echo ""
    print_status "Deployment completed successfully! 🎉"
else
    print_error "❌ Services failed to start properly"
    print_status "Checking logs..."
    docker-compose logs
    exit 1
fi

# Optional: Setup SSL certificate
if [ "$1" = "ssl" ]; then
    print_status "Setting up SSL certificate..."
    
    if ! command -v certbot &> /dev/null; then
        print_warning "Certbot not found. Please install certbot for SSL setup."
        print_warning "You can manually setup SSL certificates in the ./ssl directory."
    else
        # This would require domain configuration
        print_warning "SSL setup requires domain configuration."
        print_warning "Please configure your domain and run certbot manually."
    fi
fi

print_status "Deployment script completed!" 