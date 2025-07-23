@echo off
title DASHBOARD LAUNCHER - Port 3002

echo.
echo 👻 HAUNTED DASHBOARD LAUNCHER
echo =============================
echo.
echo Port Status:
echo   3000 - Main Lore-LocalAI API (occupied)
echo   3001 - Grafana (occupied) 
echo   3002 - Dashboard (launching here)
echo.

cd /d "%~dp0"

echo Starting dashboard on port 3002...
start "Haunted Dashboard" /min node start-dashboard.js

echo.
echo Waiting 5 seconds for startup...
timeout /t 5 /nobreak > nul

echo.
echo Testing connection...
curl -s http://localhost:3002 > nul 2>&1
if %ERRORLEVEL% == 0 (
    echo ✅ SUCCESS! Dashboard is running
    echo.
    echo 🎉 HAUNTED DASHBOARD IS LIVE!
    echo 🌐 URL: http://localhost:3002
    echo.
    echo Opening in your default browser...
    start http://localhost:3002
    echo.
    echo Your haunted payout dashboard should now be visible with:
    echo   💰 Real-time revenue tracking
    echo   🧮 Viral coefficient engine  
    echo   🎭 Creator performance matrix
    echo   🔗 Referral chain analytics
    echo.
) else (
    echo ❌ Dashboard failed to start
    echo Trying manual start...
    node start-dashboard.js
)

echo.
pause
