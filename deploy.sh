#!/bin/bash

# VITALIt Healthcare System - Enterprise Deployment Script
# This script deploys the complete healthcare management system

set -e

echo "🏥 VITALIt Healthcare System - Enterprise Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
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

# Check if Python 3.10+ is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "Prerequisites check passed"

# Create production environment
print_status "Setting up production environment..."

# Create production directories
mkdir -p /opt/vitalit/{frontend,backend,logs,backups,uploads}
mkdir -p /opt/vitalit/ssl

# Set up backend
print_status "Setting up backend..."

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Set up environment variables
if [ ! -f ".env" ]; then
    print_status "Creating backend environment configuration..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=sqlite:///./hospital.db

# Security Configuration
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:3000", "https://your-domain.com"]

# API Configuration
TITLE=VITALIt Healthcare API
VERSION=1.0.0
DEBUG=false

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=/opt/vitalit/logs/backend.log

# File Upload Configuration
UPLOAD_DIR=/opt/vitalit/uploads
MAX_FILE_SIZE=10485760

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Backup Configuration
BACKUP_DIR=/opt/vitalit/backups
BACKUP_RETENTION_DAYS=30
EOF
fi

# Initialize database
print_status "Initializing database..."
python init_db.py
python create_admin.py

print_success "Backend setup completed"

# Set up frontend
print_status "Setting up frontend..."

cd ../frontend

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Set up environment variables
if [ ! -f ".env.local" ]; then
    print_status "Creating frontend environment configuration..."
    cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication Configuration
NEXT_PUBLIC_AUTH_ENABLED=true

# Analytics Configuration (optional)
NEXT_PUBLIC_GA_ID=

# Feature Flags
NEXT_PUBLIC_ENABLE_TELEMEDICINE=true
NEXT_PUBLIC_ENABLE_AI_DIAGNOSIS=true
NEXT_PUBLIC_ENABLE_MOBILE_APP=true
EOF
fi

# Build for production
print_status "Building frontend for production..."
npm run build

print_success "Frontend setup completed"

# Create systemd service files
print_status "Creating systemd services..."

# Backend service
sudo tee /etc/systemd/system/vitalit-backend.service > /dev/null << EOF
[Unit]
Description=VITALIt Healthcare Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/vitalit/backend
Environment=PATH=/opt/vitalit/backend/venv/bin
ExecStart=/opt/vitalit/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Frontend service
sudo tee /etc/systemd/system/vitalit-frontend.service > /dev/null << EOF
[Unit]
Description=VITALIt Healthcare Frontend
After=network.target vitalit-backend.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/vitalit/frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Nginx configuration
print_status "Setting up Nginx configuration..."

sudo tee /etc/nginx/sites-available/vitalit > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /_next/static/ {
        alias /opt/vitalit/frontend/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/vitalit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Enable and start services
print_status "Starting services..."

sudo systemctl daemon-reload
sudo systemctl enable vitalit-backend
sudo systemctl enable vitalit-frontend
sudo systemctl start vitalit-backend
sudo systemctl start vitalit-frontend

# Create backup script
print_status "Setting up backup system..."

cat > /opt/vitalit/backup.sh << 'EOF'
#!/bin/bash

# VITALIt Backup Script
BACKUP_DIR="/opt/vitalit/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vitalit_backup_$DATE.tar.gz"

# Create backup
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='venv' \
    --exclude='*.log' \
    /opt/vitalit/backend \
    /opt/vitalit/frontend \
    /opt/vitalit/uploads

# Remove old backups (keep last 30 days)
find "$BACKUP_DIR" -name "vitalit_backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

chmod +x /opt/vitalit/backup.sh

# Create monitoring script
print_status "Setting up monitoring..."

cat > /opt/vitalit/monitor.sh << 'EOF'
#!/bin/bash

# VITALIt Monitoring Script
LOG_FILE="/opt/vitalit/logs/monitor.log"

# Check backend
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "$(date): Backend service is down!" >> "$LOG_FILE"
    sudo systemctl restart vitalit-backend
fi

# Check frontend
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "$(date): Frontend service is down!" >> "$LOG_FILE"
    sudo systemctl restart vitalit-frontend
fi

# Check disk space
DISK_USAGE=$(df /opt/vitalit | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "$(date): Disk usage is high: ${DISK_USAGE}%" >> "$LOG_FILE"
fi
EOF

chmod +x /opt/vitalit/monitor.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/vitalit/monitor.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/vitalit/backup.sh") | crontab -

# Create SSL certificate (Let's Encrypt)
print_status "Setting up SSL certificate..."

if command -v certbot &> /dev/null; then
    sudo certbot --nginx -d your-domain.com -d www.your-domain.com --non-interactive --agree-tos --email your-email@domain.com
else
    print_warning "Certbot not found. Please install and configure SSL manually."
fi

# Final status check
print_status "Performing final status check..."

sleep 5

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_success "Backend is running"
else
    print_error "Backend is not responding"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is running"
else
    print_error "Frontend is not responding"
fi

print_success "VITALIt Healthcare System deployment completed!"
echo ""
echo "🌐 Access your system:"
echo "   Frontend: http://your-domain.com"
echo "   Backend API: http://your-domain.com/api"
echo "   API Docs: http://your-domain.com/api/docs"
echo ""
echo "🔐 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📋 Next steps:"
echo "   1. Update domain name in Nginx configuration"
echo "   2. Configure SSL certificate"
echo "   3. Set up email notifications"
echo "   4. Configure backup storage"
echo "   5. Set up monitoring alerts"
echo ""
echo "🛠️  Management commands:"
echo "   sudo systemctl status vitalit-backend"
echo "   sudo systemctl status vitalit-frontend"
echo "   sudo systemctl restart vitalit-backend"
echo "   sudo systemctl restart vitalit-frontend"
echo ""
echo "📊 Monitoring:"
echo "   Logs: /opt/vitalit/logs/"
echo "   Backups: /opt/vitalit/backups/"
echo "   Monitor script: /opt/vitalit/monitor.sh"
echo ""
print_success "VITALIt is ready to save lives! 🏥💙" 