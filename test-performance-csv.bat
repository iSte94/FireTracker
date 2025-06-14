@echo off
echo.
echo ===============================================
echo   FIRE TRACKER - TEST PERFORMANCE CON EXPORT
echo ===============================================
echo.

REM Verifica PowerShell
powershell -Command "Get-Host" > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRORE: PowerShell non trovato!
    pause
    exit /b 1
)

REM Verifica script
if not exist "test-api-performance.ps1" (
    echo ❌ ERRORE: Script test-api-performance.ps1 non trovato!
    pause
    exit /b 1
)

echo 🔍 Verifica connessione al server...
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:3000/' -TimeoutSec 3 -ErrorAction Stop; Write-Host '✅ Server raggiungibile' -ForegroundColor Green } catch { Write-Host '❌ Server non raggiungibile - Avvia con: npm run dev' -ForegroundColor Red; exit 1 }"

if %errorlevel% neq 0 (
    pause
    exit /b 1
)

echo.
echo 🚀 Avvio test performance con export CSV...
echo.

REM Esegui con export CSV
powershell -ExecutionPolicy Bypass -File "test-api-performance.ps1" -Iterations 5 -ExportCsv

echo.
echo ✅ Test completato! 
echo 📄 Controlla il file CSV generato per l'analisi dettagliata.
echo.

pause