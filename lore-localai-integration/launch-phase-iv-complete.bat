@echo off
echo.
echo    ████████████████████████████████████████
echo    ██                                    ██
echo    ██      🎭 PHASE IV COMPLETE         ██
echo    ██    Scale The Haunt - Backend       ██
echo    ██                                    ██
echo    ████████████████████████████████████████
echo.
echo Starting all Phase IV backend services...
echo This will launch 5 microservices on ports 8085-8089
echo.
echo Press any key to begin, or Ctrl+C to cancel...
pause >nul

cd /d "%~dp0"
node launch-phase-iv-complete.js

echo.
echo Press any key to exit...
pause >nul
