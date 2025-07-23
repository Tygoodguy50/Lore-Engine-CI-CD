@echo off
title Haunted Dashboard Quick Start

echo 👻 FIXING DASHBOARD ISSUE
echo ========================
echo.
echo The issue was: Port 3000 is already used by your main Lore-LocalAI API
echo Solution: Running dashboard on port 3001 instead
echo.

echo Starting Haunted Dashboard on port 3001...
echo.

REM Go to main directory
cd /d "%~dp0"

REM Start dashboard
echo Starting dashboard server...
start "Haunted Dashboard" node start-dashboard.js

echo.
echo Waiting for dashboard to start...
timeout /t 5 /nobreak > nul

echo.
echo Testing dashboard connection...
curl -s http://localhost:3002 > nul
if %ERRORLEVEL% == 0 (
    echo ✅ Dashboard is running successfully!
    echo.
    echo 🎉 DASHBOARD IS NOW LIVE!
    echo 🌐 Visit: http://localhost:3002
    echo.
    echo Your haunted payout dashboard should now be showing with:
    echo   💰 Real-time revenue tracking
    echo   🧮 Viral coefficient engine  
    echo   🎭 Creator performance matrix
    echo   🔗 Referral chain analytics
    echo.
    echo Note: Currently showing mock data. To get live data,
    echo run the Phase IV services with: start-haunted-empire.bat
) else (
    echo ❌ Dashboard failed to start. Please check the error messages above.
)

echo.
echo Press any key to continue...
pause > nul
