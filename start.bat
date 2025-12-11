@echo off
echo ========================================
echo 🚀 Mora Comercial API - Startup (Windows)
echo ========================================
echo.

REM Set environment variables
set "PYTHONPATH=%~dp0"
set "SECRET_KEY=tu_clave_secreta_dev"

echo [1/3] Initializing database...
python scripts/init_db.py

echo [2/3] Starting backend on http://localhost:8000...
start "MoraComercialBackend" cmd /c "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to be ready...
timeout /t 5 /nobreak > nul

echo [3/3] Starting frontend on http://localhost:8080...
cd app/brick-catalog-pro-main
start "MoraComercialFrontend" cmd /c "npm run dev"

echo.
echo ========================================
echo 🎉 Both servers are running!
echo ========================================
echo.
echo 📌 URLs:
echo   Backend:  http://localhost:8000
echo   Docs:     http://localhost:8000/docs
echo   Frontend: http://localhost:8080
echo.
echo Press Ctrl+C in the new windows to stop the servers.
echo ========================================
echo.

pause