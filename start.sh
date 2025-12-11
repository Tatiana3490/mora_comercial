#!/bin/bash

# Mora Comercial - Project Startup Script

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "========================================"
echo "🚀 Mora Comercial API - Startup"
echo "========================================"
echo ""

# Export environment variables
export PYTHONPATH="$SCRIPT_DIR"
export SECRET_KEY="${SECRET_KEY:-tu_clave_secreta_dev}"

# Initialize database if needed
echo "[1/3] Initializing database..."
python scripts/init_db.py > /dev/null 2>&1 || true

# Start backend
echo "[2/3] Starting backend on http://localhost:8000..."
cd "$SCRIPT_DIR"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "✓ Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        echo "✓ Backend is ready!"
        break
    fi
    echo "  Attempt $i/30..."
    sleep 1
done

# Start frontend
echo "[3/3] Starting frontend on http://localhost:5173..."
cd "$SCRIPT_DIR/app/brick-catalog-pro-main"
npm run dev &
FRONTEND_PID=$!
echo "✓ Frontend PID: $FRONTEND_PID"

echo ""
echo "========================================"
echo "🎉 Both servers are running!"
echo "========================================"
echo ""
echo "📌 URLs:"
echo "  Backend:  http://localhost:8000"
echo "  Docs:     http://localhost:8000/docs"
echo "  Frontend: http://localhost:8080"
echo ""
echo "📝 Test login:"
echo "  curl -X POST http://localhost:8000/api/v1/auth/login \\"
echo "    -F 'username=admin@example.com' \\"
echo "    -F 'password=AdminPass123'"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "========================================"
echo ""

# Keep script running and forward signals
wait
