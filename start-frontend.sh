#!/bin/bash

# Create a simple static HTTP server to serve the frontend
echo "Starting simple HTTP server for frontend demo..."

cd frontend

# Create a simple server using Python (if available) or Node.js
if command -v python3 &> /dev/null; then
    echo "Using Python HTTP server..."
    python3 -m http.server 8080 &
    SERVER_PID=$!
    echo "Frontend available at: http://localhost:8080"
elif command -v node &> /dev/null; then
    echo "Using Node.js HTTP server..."
    npx http-server -p 8080 &
    SERVER_PID=$!
    echo "Frontend available at: http://localhost:8080"
else
    echo "No HTTP server available"
    exit 1
fi

echo "Server PID: $SERVER_PID"
echo "Frontend is running. Press Ctrl+C to stop."

# Wait for user input
read -p "Press Enter to stop the server..."

# Kill the server
kill $SERVER_PID
echo "Server stopped."