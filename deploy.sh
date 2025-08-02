#!/bin/bash

# Vitalit OS Production Deployment Script
set -e

echo "🚀 Starting Vitalit OS Production Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating template..."
    cat > .env << EOF
# Database Configuration
POSTGRES_PASSWORD=your_secure_password_here

# Security Keys
SECRET_KEY=your_super_secret_key_here
REFRESH_SECRET_KEY=your_refresh_secret_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
ENVIRONMENT=production
EOF
    echo "✅ .env template created. Please update with your actual values."
    exit 1
fi

# Load environment variables
source .env

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads logs backups nginx/ssl

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Seed initial data
echo "🌱 Seeding initial data..."
docker-compose -f docker-compose.prod.yml exec backend python -c "
from backend.database import engine
from backend.models import Base
from backend.seed_data import seed_initial_data
from sqlalchemy.orm import sessionmaker

Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()
seed_initial_data(db)
db.close()
"

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "📊 Monitor services:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f docker-compose.prod.yml down" 