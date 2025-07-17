@echo off
REM 🚀 LocalAI Launch Script for Windows
REM This batch file launches the bash script using Git Bash or WSL

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                         🚀 LocalAI Launch Script                            ║
echo ║                      Bazel + Bzlmod + Auto Model Loading                    ║
echo ║                          Windows Batch Wrapper                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

if "%1"=="--help" (
    echo Usage: launch.bat [OPTIONS]
    echo.
    echo Options:
    echo   --help              Show this help message
    echo   --debug             Enable debug mode
    echo   --inject-artifacts  Enable artifact injection
    echo   --no-preload        Disable model preloading
    echo.
    echo Examples:
    echo   launch.bat                    # Normal launch
    echo   launch.bat --debug            # Debug mode
    echo   launch.bat --inject-artifacts # With artifact injection
    echo.
    echo Note: This batch file runs the bash script launch.sh
    echo       Make sure you have Git Bash or WSL installed
    echo.
    exit /b 0
)

REM Check if bash is available
where bash >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: bash command not found
    echo Please install Git Bash or WSL to run this script
    echo Alternatively, run: bazel build //:local-ai manually
    exit /b 1
)

REM Run the bash script with all arguments
echo 🔄 Running bash launch script...
bash launch.sh %*
