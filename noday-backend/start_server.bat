@echo off
echo ========================================
echo   Noday'z Entertainment Backend Server
echo ========================================
echo.
echo Starting Flask development server...
echo.
echo The server will be available at:
echo   - http://localhost:5000
echo   - http://127.0.0.1:5000
echo.
echo API endpoints:
echo   - GET /api/health (health check)
echo   - GET /api/requests (get requests)  
echo   - POST /api/requests (add request)
echo   - DELETE /api/requests/^<id^> (delete request)
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
python src/main.py

pause
