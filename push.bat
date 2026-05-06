@echo off
echo ========================================
echo   Auto Push to GitHub
echo ========================================

:: Check for changes
git status --short | findstr /R "^" >nul
if %errorlevel% neq 0 (
    echo [INFO] No changes to push.
    pause
    exit /b
)

:: Stage all changes
echo [1/3] Staging changes...
git add .

:: Ask for commit message
set "msg="
set /p msg="Enter commit message (press Enter for default 'update blog'): "

if "%msg%"=="" (
    set msg=update blog %date% %time%
)

:: Commit
echo [2/3] Committing changes...
git commit -m "%msg%"

:: Push
echo [3/3] Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed! Please check your network or credentials.
) else (
    echo.
    echo [SUCCESS] Blog updated successfully!
)

echo ========================================
pause
