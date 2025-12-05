#!/bin/bash

# ============================================
# MovieRec Backend Startup Script
# ============================================

echo "🎬 MOVIE RECOMMENDATION SYSTEM - BACKEND"
echo "========================================="

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || { echo "❌ Backend directory not found"; exit 1; }

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv || { echo "❌ Failed to create virtual environment"; exit 1; }
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate || { echo "❌ Failed to activate virtual environment"; exit 1; }

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install flask flask-cors pandas numpy scikit-learn

# Check if model exists, if not train it
if [ ! -f "model/similarity_matrix.npy" ] || [ ! -f "model/vectorizer.pkl" ]; then
    echo "🔄 Model not found. Training model..."
    python train_model.py || { echo "❌ Model training failed"; exit 1; }
fi

# Start the Flask server
echo "🚀 Starting Flask server..."
echo "🌐 API will be available at: http://localhost:5000"
echo "📚 API Documentation: http://localhost:5000/api/health"
echo "📊 To test: curl http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================="

# Run the Flask app
python app.py