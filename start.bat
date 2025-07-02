@echo off
echo.
echo ===============================================
echo    SISTEMA DE XESTION ACADEMICA - ARRANQUE
echo ===============================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js non está instalado!
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado:
node --version

echo.
echo 🔧 Opcións de arrancada:
echo.
echo 1. Arranque normal
echo 2. Arranque con limpeza de cache
echo 3. Arranque en modo turbo
echo 4. Limpeza completa e reinstalación
echo 5. Mata procesos Node e arrinca
echo.

set /p choice="Escolle unha opción (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Arrincando servidor normal...
    npm run dev
) else if "%choice%"=="2" (
    echo.
    echo 🧹 Limpando cache...
    npm run clean
    echo 🚀 Arrincando servidor...
    npm run dev
) else if "%choice%"=="3" (
    echo.
    echo ⚡ Arrincando en modo turbo...
    npm run dev:clean
) else if "%choice%"=="4" (
    echo.
    echo 🔄 Limpeza completa e reinstalación...
    npm run reset
    echo 🚀 Arrincando servidor...
    npm run dev
) else if "%choice%"=="5" (
    echo.
    echo 💀 Matando procesos Node...
    taskkill /im node.exe /f >nul 2>&1
    echo ✅ Procesos eliminados
    echo 🚀 Arrincando servidor...
    npm run dev
) else (
    echo.
    echo ❌ Opción non válida
    pause
    exit /b 1
)

pause
