#!/bin/bash

# Start both backend and frontend simultaneously
# Usage: ./dev.sh

echo "🚀 Starting LAYA Backend & Frontend..."
echo ""

# Kill any existing processes on startup
trap "pkill -P $$" EXIT

# Start backend in background
echo "📡 Starting Backend (Port 4000)..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start frontend in background
echo "🎨 Starting Frontend (Port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Keep script running
wait $BACKEND_PID $FRONTEND_PID

echo ""
echo "✅ Both services running!"
echo "   Backend:  http://localhost:4000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📝 To stop, press Ctrl+C"
