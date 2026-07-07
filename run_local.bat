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

REM Run the extractor — opens browser for SSO sign-in
echo [RUN]   Starting extractor...
echo         A browser window will open for AB InBev SSO sign-in.
echo         Sign in with your Microsoft account, then return here.
echo.
extractor\venv\Scripts\python extractor\extract.py

if errorlevel 1 (
    echo.
    echo [ERROR] Extraction failed. See error above.
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
