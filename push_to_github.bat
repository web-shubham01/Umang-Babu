@echo off
cd /d "%~dp0"
echo ===================================================
echo UMANG WORLD CALCULATION - GITHUB PUSH SCRIPT
echo ===================================================
echo.
git init
git branch -M main
git add .
git commit -m "Deploy UMANG WORLD CALCULATION" 2>nul
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/yourname/umang.git): "
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git push -u origin main
echo.
echo ===================================================
echo SUCCESS! Your code is now pushed to GitHub!
echo ===================================================
pause
