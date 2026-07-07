@echo off
REM ============================================================
REM  AB InBev Knowledge Base — Local SharePoint Extractor
REM  Double-click this file to fetch SharePoint content
REM ============================================================

cd /d "%~dp0"
title KB Extractor

echo.
echo ============================================================
echo   AB InBev Knowledge Base Extractor
echo ============================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.9+
    echo         https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Create venv if needed
if not exist "extractor\venv\" (
    echo [SETUP] Creating Python virtual environment...
    python -m venv extractor\venv
    echo [SETUP] Installing dependencies...
    extractor\venv\Scripts\pip install -r extractor\requirements.txt -q
    echo.
)

REM Check if auth is configured
if not exist "extractor\auth_config.json" (
    echo [AUTH]  No authentication config found.
    echo.
    echo         FIRST TIME? Run setup_auth.ps1 first:
    echo         Right-click setup_auth.ps1 ^> "Run with PowerShell"
    echo.
    echo         It takes ~3 minutes and registers a dedicated Azure AD app.
    echo         After that, this script will work with one browser sign-in.
    echo.
    echo         Attempting anyway with fallback client (may fail)...
    echo.
)

REM Run the extractor — opens browser for SSO sign-in
echo [RUN]   Starting extractor...
echo         A browser window will open for AB InBev SSO sign-in.
echo.
extractor\venv\Scripts\python extractor\extract.py

if errorlevel 1 (
    echo.
    echo ============================================================
    echo   FAILED — What to do next:
    echo ============================================================
    echo.
    echo   1. Right-click setup_auth.ps1
    echo   2. Click "Run with PowerShell"
    echo   3. Sign in with your AB InBev account
    echo   4. Run this file again
    echo.
    pause
    exit /b 1
)

REM Commit and push to GitHub
echo.
echo ============================================================
echo   Pushing updated data to GitHub...
echo ============================================================
git add knowledge-base-app\public\data\
git diff --staged --quiet && (
    echo [INFO]  No new files found — documents.json already up to date.
) || (
    git commit -m "data: refresh KB from local extractor %DATE% %TIME:~0,5%"
    git push
    echo.
    echo [DONE]  Site will refresh in ~2 minutes at:
    echo         https://rabindrarizal.github.io/Knowledge-Base/
)

echo.
pause
