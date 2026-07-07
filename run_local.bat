@echo off
REM ============================================================
REM  AB InBev Knowledge Base — Local Folder Extractor
REM
REM  HOW TO USE:
REM    Option A: Drag your folder onto this .bat file
REM    Option B: Double-click and type / paste the folder path
REM    Option C: run_local.bat "C:\path\to\your\files"
REM    Option D: run_local.bat "C:\path\to\your\files" --append
REM ============================================================

cd /d "%~dp0"
title KB Local Extractor

echo.
echo ============================================================
echo   AB InBev Knowledge Base - Local Folder Extractor
echo ============================================================
echo.

REM ── Check Python ─────────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found.
    echo         Install from: https://www.python.org/downloads/
    pause & exit /b 1
)

REM ── Create venv + install deps if needed ─────────────────────
if not exist "extractor\venv\" (
    echo [SETUP] First run - installing dependencies (30 seconds)...
    python -m venv extractor\venv
    extractor\venv\Scripts\pip install -r extractor\requirements.txt -q
    echo [SETUP] Done!
    echo.
)

REM ── Get folder path ───────────────────────────────────────────
if "%~1"=="" (
    echo Paste the path to your project folder below and press Enter.
    echo (Tip: you can also drag this .bat file onto a folder icon)
    echo.
    set /p FOLDER_PATH="Folder path: "
) else (
    set FOLDER_PATH=%~1
)

if "%FOLDER_PATH%"=="" (
    echo [ERROR] No folder path given.
    pause & exit /b 1
)

REM ── Ask Replace or Append ─────────────────────────────────────
set APPEND_FLAG=
if "%~2"=="--append" (
    set APPEND_FLAG=--append
    echo [MODE]  Append mode - adding to existing KB
    goto run_extractor
)

echo.
echo ============================================================
echo   How should this folder be added?
echo.
echo   [1] REPLACE  - Clear all existing docs and index this folder only
echo   [2] APPEND   - Add this folder to the existing KB (multi-project)
echo ============================================================
echo.
set /p MODE_CHOICE="Enter 1 or 2: "

if "%MODE_CHOICE%"=="2" (
    set APPEND_FLAG=--append
    echo [MODE]  Append mode - adding to existing KB
) else (
    echo [MODE]  Replace mode - fresh index
)

:run_extractor
REM ── Run extractor ─────────────────────────────────────────────
echo.
echo [RUN]  Reading files from:
echo        %FOLDER_PATH%
echo.
extractor\venv\Scripts\python extractor\extract.py "%FOLDER_PATH%" %APPEND_FLAG%

if errorlevel 1 (
    echo.
    echo [ERROR] Extraction failed. See the error above.
    pause & exit /b 1
)

REM ── Commit + push ─────────────────────────────────────────────
echo.
echo ============================================================
echo   Pushing to GitHub...
echo ============================================================
git add knowledge-base-app\public\data\documents.json
git add knowledge-base-app\public\data\kb-meta.json
git diff --staged --quiet && (
    echo [INFO]  No changes detected - nothing to push.
) || (
    git commit -m "data: update KB from local folder [%DATE%]"
    git push
    echo.
    echo [DONE]  Site will be live in ~2 min:
    echo         https://rabindrarizal.github.io/Knowledge-Base/
)

echo.
pause
