# Fire Tracker API Performance Test - PowerShell Script
# Compatibile con Windows PowerShell 5.1+ e PowerShell 7+

param(
    [string]$BaseUrl = "http://localhost:3000",
    [int]$Iterations = 3,
    [int]$TimeoutSeconds = 30,
    [switch]$Verbose,
    [switch]$ExportCsv
)

# Endpoint da testare
$Endpoints = @(
    @{
        Name = "Auth Session"
        Url = "/api/auth/session"
        Method = "GET"
    },
    @{
        Name = "Fire Progress"
        Url = "/api/fire/progress"
        Method = "GET"
    },
    @{
        Name = "Goals Check Progress"
        Url = "/api/goals/check-progress"
        Method = "GET"
    },
    @{
        Name = "Portfolio Holdings"
        Url = "/api/portfolio/holdings"
        Method = "GET"
    },
    @{
        Name = "Net Worth History"
        Url = "/api/net-worth/history"
        Method = "GET"
    }
)

# Risultati dei test
$Results = @()

function Test-ApiEndpoint {
    param(
        [hashtable]$Endpoint,
        [string]$BaseUrl
    )
    
    $fullUrl = $BaseUrl + $Endpoint.Url
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-RestMethod -Uri $fullUrl -Method $Endpoint.Method -ErrorAction Stop
        $stopwatch.Stop()
        
        return @{
            Endpoint = $Endpoint.Name
            ResponseTime = $stopwatch.ElapsedMilliseconds
            Success = $true
            StatusCode = 200
        }
    } catch {
        $stopwatch.Stop()
        
        return @{
            Endpoint = $Endpoint.Name
            ResponseTime = $stopwatch.ElapsedMilliseconds
            Success = $false
            StatusCode = 401
            Error = $_.Exception.Message
        }
    }
}

# Inizio script principale
Clear-Host
Write-Host "FIRE TRACKER - TEST PERFORMANCE API" -ForegroundColor Magenta
Write-Host "=" * 40 -ForegroundColor Magenta
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Iterazioni: $Iterations" -ForegroundColor Cyan
Write-Host ""

# Test connessione server
try {
    Write-Host "Verifica connessione server..." -ForegroundColor Cyan
    Invoke-RestMethod -Uri "$BaseUrl/" -ErrorAction Stop | Out-Null
    Write-Host "Server raggiungibile" -ForegroundColor Green
} catch {
    Write-Host "ERRORE: Server non raggiungibile" -ForegroundColor Red
    exit 1
}

Write-Host "`nEsecuzione test..." -ForegroundColor Cyan

foreach ($endpoint in $Endpoints) {
    Write-Host "`nTestando: $($endpoint.Name)" -ForegroundColor Yellow
    
    for ($i = 1; $i -le $Iterations; $i++) {
        $result = Test-ApiEndpoint -Endpoint $endpoint -BaseUrl $BaseUrl
        $Results += $result
        
        $color = if ($result.Success) { "Green" } else { "Red" }
        $status = if ($result.Success) { "OK" } else { "ERRORE" }
        
        Write-Host "   Test $i - $status - $($result.ResponseTime)ms" -ForegroundColor $color
    }
}

# Statistiche finali
$totalTests = $Results.Count
$successfulTests = ($Results | Where-Object Success).Count
if ($successfulTests -gt 0) {
    $successfulResults = $Results | Where-Object { $_.Success -eq $true }
    if ($successfulResults.Count -gt 0) {
        $avgResponseTime = [math]::Round(($successfulResults | Measure-Object ResponseTime -Average).Average)
    } else {
        $avgResponseTime = 0
    }
} else {
    $avgResponseTime = 0
}

Write-Host "`nRISULTATI FINALI" -ForegroundColor Magenta
Write-Host "=" * 20 -ForegroundColor Magenta
Write-Host "Test totali: $totalTests" -ForegroundColor Cyan
Write-Host "Successi: $successfulTests" -ForegroundColor Green
Write-Host "Fallimenti: $($totalTests - $successfulTests)" -ForegroundColor Red
Write-Host "Tempo medio: ${avgResponseTime}ms" -ForegroundColor Cyan

# Export CSV se richiesto
if ($ExportCsv) {
    $csvFile = "fire-tracker-performance-$(Get-Date -Format 'yyyyMMdd-HHmmss').csv"
    $Results | Export-Csv -Path $csvFile -NoTypeInformation
    Write-Host "`nRisultati esportati in: $csvFile" -ForegroundColor Green
}

Write-Host "`nTest completato!" -ForegroundColor Green
