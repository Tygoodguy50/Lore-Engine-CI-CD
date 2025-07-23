@echo off
echo.
echo    👻 HAUNTED DASHBOARD LAUNCHER
echo    ============================
echo.
echo Starting dashboard server on port 3002...
echo.

cd /d "%~dp0"
node dashboard-server.js

echo.
echo Press any key to exit...
pause >nul
