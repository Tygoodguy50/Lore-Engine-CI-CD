@echo off
echo 👻 Starting Haunted Dashboard and Phase IV Services
echo ===================================================
echo.

echo Starting Dashboard Server on port 3002...
cd /d "%~dp0dashboard"
start "Dashboard Server" node server.js

echo Waiting for dashboard to start...
timeout /t 3 /nobreak > nul

echo Starting Phase IV Services...
cd /d "%~dp0"

echo Starting Creator Leaderboards (port 8085)...
start "Creator Leaderboards" node creator-leaderboards.js

echo Starting Fragment Remix Engine (port 8086)...
start "Fragment Remix" node fragment-remix-engine.js

echo Starting Revenue Multipliers (port 8087)...
start "Revenue Multipliers" node revenue-multipliers.js

echo Starting Multi-Platform Dispatcher (port 8088)...
start "Platform Dispatcher" node multi-platform-dispatcher.js

echo Starting Sentiment & Lore Evolution (port 8089)...
start "Sentiment Evolution" node sentiment-lore-evolution.js

echo.
echo ✅ All services starting...
echo.
echo 🌐 Dashboard: http://localhost:3002
echo 📊 Creator Leaderboards: http://localhost:8085/stats
echo 🧬 Fragment Remix: http://localhost:8086/stats
echo 💰 Revenue Multipliers: http://localhost:8087/stats
echo 🌎 Multi-Platform: http://localhost:8088/stats
echo 🧠 Sentiment Evolution: http://localhost:8089/stats
echo.
echo Press any key to check service status...
pause > nul

echo.
echo Checking service status...
node check-phase-iv.js

echo.
echo Phase IV: Scale the Haunt is now operational!
echo Visit the dashboard at http://localhost:3002
pause
