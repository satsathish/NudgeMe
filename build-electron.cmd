@echo off
REM Build NudgeMe Electron Application

echo ============================================
echo Building NudgeMe Electron Application
echo ============================================

cd NudgeMeElectron

echo.
echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Building TypeScript...
call npm run build

echo.
echo [3/3] Packaging Electron application...
call npm run package

echo.
echo ============================================
echo Build completed!
echo ============================================
echo.
echo Installers can be found in:
echo NudgeMeElectron\dist\
echo.

cd ..
