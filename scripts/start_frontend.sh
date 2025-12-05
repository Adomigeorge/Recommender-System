#!/bin/bash

# ============================================
# MovieRec Frontend Startup Script
# ============================================

echo "🎬 MOVIE RECOMMENDATION SYSTEM - FRONTEND"
echo "=========================================="

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || { echo "❌ Frontend directory not found"; exit 1; }

# Check if Python HTTP server is available
echo "🔍 Checking for Python..."
if command -v python3 &> /dev/null; then
    SERVER_CMD="python3 -m http.server"
elif command -v python &> /dev/null; then
    SERVER_CMD="python -m http.server"
else
    echo "❌ Python not found. Trying Node.js..."
    if command -v npx &> /dev/null; then
        SERVER_CMD="npx serve ."
    else
        echo "❌ No server found. Please install Python or Node.js"
        exit 1
    fi
fi

# Start the server
echo "🌐 Starting web server..."
echo "📁 Serving from: $(pwd)"
echo "🔗 Frontend will be available at: http://localhost:8000"
echo "🎯 Make sure backend is running at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="

# Run the server
$SERVER_CMD 8000