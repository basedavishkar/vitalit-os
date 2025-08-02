#!/bin/bash

# VITALIt Healthcare System - Development Startup Script
# This script starts both frontend and backend servers for development

set -e

echo "🏥 VITALIt Healthcare System - Development Startup"
echo "================================================="

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

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is in use. Killing existing process..."
        lsof -ti:$port | xargs kill -9
        sleep 2
    fi
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Python 3 is installed
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

# Kill any existing processes on our ports
print_status "Clearing ports..."
kill_port 8000
kill_port 3000

# Set up backend
print_status "Setting up backend..."

cd backend

# Check if virtual environment exists
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

# Set up environment variables if not exists
if [ ! -f ".env" ]; then
    print_status "Creating backend environment configuration..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=sqlite:///./hospital.db

# Security Configuration
SECRET_KEY=your-super-secret-key-for-development
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:3000"]

# API Configuration
TITLE=VITALIt Healthcare API
VERSION=1.0.0
DEBUG=true

# Logging Configuration
LOG_LEVEL=DEBUG
LOG_FILE=./logs/backend.log

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
EOF
fi

# Create logs directory
mkdir -p logs
mkdir -p uploads

# Initialize database if not exists
if [ ! -f "hospital.db" ]; then
    print_status "Initializing database..."
    python init_db.py
    python create_admin.py
fi

print_success "Backend setup completed"

# Start backend server in background
print_status "Starting backend server..."
nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_success "Backend is running on http://localhost:8000"
else
    print_error "Backend failed to start"
    exit 1
fi

# Set up frontend
print_status "Setting up frontend..."

cd ../frontend

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Set up environment variables if not exists
if [ ! -f ".env.local" ]; then
    print_status "Creating frontend environment configuration..."
    cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication Configuration
NEXT_PUBLIC_AUTH_ENABLED=true

# Development Configuration
NEXT_PUBLIC_DEBUG=true
EOF
fi

print_success "Frontend setup completed"

# Start frontend server in background
print_status "Starting frontend server..."
nohup npm run dev > ../backend/logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid

# Wait for frontend to start
print_status "Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is running on http://localhost:3000"
else
    print_error "Frontend failed to start"
    exit 1
fi

# Create a simple health check script
cat > health_check.sh << 'EOF'
#!/bin/bash

echo "🏥 VITALIt Health Check"
echo "======================"

# Check backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend: http://localhost:8000 - HEALTHY"
else
    echo "❌ Backend: http://localhost:8000 - DOWN"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: http://localhost:3000 - HEALTHY"
else
    echo "❌ Frontend: http://localhost:3000 - DOWN"
fi

# Check API docs
if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    echo "✅ API Docs: http://localhost:8000/docs - HEALTHY"
else
    echo "❌ API Docs: http://localhost:8000/docs - DOWN"
fi

echo ""
echo "🔐 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📊 Logs:"
echo "   Backend: backend/logs/backend.log"
echo "   Frontend: backend/logs/frontend.log"
EOF

chmod +x health_check.sh

# Create a stop script
cat > stop.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping VITALIt Healthcare System..."

# Stop frontend
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ Frontend stopped"
    fi
    rm -f frontend.pid
fi

# Stop backend
cd backend
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ Backend stopped"
    fi
    rm -f backend.pid
fi

echo "🛑 VITALIt Healthcare System stopped"
EOF

chmod +x stop.sh

# Final status
print_success "VITALIt Healthcare System is now running!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "🔐 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🛠️  Management commands:"
echo "   ./health_check.sh  - Check system health"
echo "   ./stop.sh         - Stop all services"
echo "   ./start.sh        - Restart all services"
echo ""
echo "📊 Logs:"
echo "   Backend: backend/logs/backend.log"
echo "   Frontend: backend/logs/frontend.log"
echo ""
print_success "VITALIt is ready to save lives! 🏥💙"

# Keep the script running and show logs
echo ""
echo "📋 Live logs (Ctrl+C to stop):"
echo "================================"
tail -f backend/logs/backend.log backend/logs/frontend.log 