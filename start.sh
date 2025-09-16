#!/bin/bash

# Start the backend server in the background
echo "Starting backend server on port 8001..."
python3 run_backend.py &
BACKEND_PID=$!

# Give the backend a moment to start
sleep 2

# Start the frontend dev server
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Function to kill both processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup INT TERM

echo "Both servers are running!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8001"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait