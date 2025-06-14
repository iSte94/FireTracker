@echo off
echo.
echo ========================================
echo   FIRE TRACKER - TEST PERFORMANCE API
echo ========================================
echo.

REM Verifica se PowerShell è disponibile
powershell -Command "Get-Host" > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRORE: PowerShell non trovato!
    echo    Assicurati di avere PowerShell installato.
    pause
    exit /b 1
)

REM Verifica se lo script PowerShell esiste
if not exist "test-api-performance.ps1" (
    echo ❌ ERRORE: Script test-api-performance.ps1 non trovato!
    echo    Assicurati di eseguire questo batch dalla directory del progetto.
    pause
    exit /b 1
)

echo 🔍 Verifica connessione al server...
REM Test rapido connessione
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:3000/' -TimeoutSec 3 -ErrorAction Stop; Write-Host '✅ Server raggiungibile' -ForegroundColor Green } catch { Write-Host '❌ Server non raggiungibile' -ForegroundColor Red; Write-Host '   Avvia l''applicazione con: npm run dev' -ForegroundColor Yellow; exit 1 }"

if %errorlevel% neq 0 (
    echo.
    echo 💡 SUGGERIMENTI:
    echo    1. Apri un nuovo terminale
    echo    2. Naviga nella directory del progetto
    echo    3. Esegui: npm run dev
    echo    4. Attendi che l'applicazione sia completamente caricata
    echo    5. Riesegui questo test
    echo.
    pause
    exit /b 1
)

echo.
echo 🚀 Avvio test performance...
echo.

REM Esegui lo script PowerShell con bypass delle policy
powershell -ExecutionPolicy Bypass -File "test-api-performance.ps1" -Iterations 3

if %errorlevel% neq 0 (
    echo.
    echo ❌ Test completato con errori.
    echo.
    echo 💡 Per maggiori dettagli, esegui manualmente:
    echo    powershell -ExecutionPolicy Bypass -File test-api-performance.ps1 -Verbose
    echo.
) else (
    echo.
    echo ✅ Test completato con successo!
    echo.
    echo 💡 OPZIONI AVANZATE:
    echo    - Test con export CSV: test-performance-csv.bat
    echo    - Test verboso: test-performance-verbose.bat
    echo    - Test personalizzato: modifica parametri in test-api-performance.ps1
    echo.
)

pause