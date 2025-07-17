@echo off
setlocal enabledelayedexpansion

REM 🕸️ LocalAI Environment Loader Script (Batch)
REM This script loads environment variables from config.env

set "CONFIG_FILE=config.env"
set "SCRIPT_DIR=%~dp0"
set "CONFIG_PATH=%SCRIPT_DIR%%CONFIG_FILE%"

echo 🕸️ LocalAI Haunted Hooks Environment Loader
echo ==================================================

REM Check if config file exists
if not exist "%CONFIG_PATH%" (
    echo ❌ Configuration file not found: %CONFIG_PATH%
    echo 💡 Please copy config.env.example to config.env and configure your settings
    exit /b 1
)

echo 📁 Loading configuration from: %CONFIG_PATH%

REM Load environment variables
set "LOADED_COUNT=0"
for /f "usebackq tokens=1,2 delims==" %%a in ("%CONFIG_PATH%") do (
    set "KEY=%%a"
    set "VALUE=%%b"
    
    REM Skip comments and empty lines
    if not "!KEY:~0,1!"=="#" if not "!KEY!"=="" (
        REM Remove trailing comments from value
        for /f "tokens=1 delims=#" %%c in ("!VALUE!") do set "VALUE=%%c"
        
        REM Remove quotes if present
        set "VALUE=!VALUE:"=!"
        set "VALUE=!VALUE:'=!"
        
        REM Set environment variable
        set "!KEY!=!VALUE!"
        
        REM Show loaded variable (mask sensitive values)
        echo !KEY! | findstr /i "TOKEN KEY SECRET" >nul
        if !errorlevel! equ 0 (
            echo ✅ !KEY!=[MASKED]
        ) else (
            echo ✅ !KEY!=!VALUE!
        )
        
        set /a LOADED_COUNT+=1
    )
)

echo ==================================================
echo 🔮 Environment variables loaded successfully!
echo 📊 Loaded: %LOADED_COUNT% variables

REM Optional: Start the daemon if requested
if "%1"=="--start" (
    echo 🚀 Starting LocalAI daemon...
    
    if exist "local-ai.exe" (
        echo 🎯 Executing: local-ai.exe
        local-ai.exe
    ) else if exist "local-ai" (
        echo 🎯 Executing: local-ai
        local-ai
    ) else (
        echo ❌ LocalAI binary not found. Please build it first.
        echo 💡 Run: go build -o local-ai.exe ./cmd/local-ai
        exit /b 1
    )
)

REM Show help if requested
if "%1"=="--help" (
    echo.
    echo Usage: %~nx0 [OPTIONS]
    echo.
    echo Options:
    echo   --start    Load environment and start LocalAI daemon
    echo   --help     Show this help message
    echo.
    echo Examples:
    echo   %~nx0           # Load environment variables
    echo   %~nx0 --start   # Load environment and start daemon
)

endlocal
