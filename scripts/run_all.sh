#!/bin/bash

# ============================================
# MovieRec Complete System Startup Script
# ============================================

echo "🎬 MOVIE RECOMMENDATION SYSTEM - COMPLETE"
echo "=========================================="

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Trap to handle script termination
cleanup() {
    print_status "Shutting down servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        print_status "Backend server stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_status "Frontend server stopped"
    fi
    
    print_success "All servers stopped"
    exit 0
}

trap cleanup INT TERM

# Start Backend
print_status "Starting backend server..."
cd "$PROJECT_DIR/backend" || { print_error "Backend directory not found"; exit 1; }

# Check and install dependencies
if [ ! -d "venv" ]; then
    print_warning "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found"
    exit 1
fi

pip install -q -r requirements.txt

# Check if model exists
if [ ! -f "model/similarity_matrix.npy" ]; then
    print_warning "Model not found. Training model..."
    python train_model.py
    if [ $? -ne 0 ]; then
        print_error "Model training failed"
        exit 1
    fi
fi

# Start backend in background
python app.py &
BACKEND_PID=$!
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Backend server started (PID: $BACKEND_PID)"
    print_success "Backend API: http://localhost:5000"
else
    print_error "Backend server failed to start"
    exit 1
fi

# Start Frontend
print_status "Starting frontend server..."
cd "$PROJECT_DIR/frontend" || { print_error "Frontend directory not found"; exit 1; }

# Determine which server to use
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000 > /dev/null 2>&1 &
elif command -v python &> /dev/null; then
    python -m http.server 8000 > /dev/null 2>&1 &
elif command -v npx &> /dev/null; then
    npx serve . -p 8000 > /dev/null 2>&1 &
else
    print_error "No HTTP server found (Python or Node.js required)"
    cleanup
fi

FRONTEND_PID=$!
sleep 2

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend server started (PID: $FRONTEND_PID)"
    print_success "Frontend: http://localhost:8000"
else
    print_error "Frontend server failed to start"
    cleanup
fi

# Display system information
echo ""
echo "=========================================="
echo "🎉 SYSTEM STARTED SUCCESSFULLY!"
echo "=========================================="
echo "Frontend: ${GREEN}http://localhost:8000${NC}"
echo "Backend API: ${GREEN}http://localhost:5000${NC}"
echo "API Docs: ${GREEN}http://localhost:5000/api/health${NC}"
echo ""
echo "📋 Quick Test:"
echo "   curl http://localhost:5000/api/health"
echo "   curl \"http://localhost:5000/api/recommend?movie=Inception\""
echo ""
echo "🔧 To stop the system: Press ${RED}Ctrl+C${NC}"
echo "=========================================="

# Keep script running
print_status "System is running. Press Ctrl+C to stop..."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
cleanup