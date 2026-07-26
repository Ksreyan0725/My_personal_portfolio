$venvDir = Join-Path $PSScriptRoot ".venv"

if (-not (Test-Path (Join-Path $venvDir "Scripts\python.exe"))) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv $venvDir
}

# Verify if rich is installed, if not, run pip install
& (Join-Path $venvDir "Scripts\python.exe") -c "import rich" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing dependencies (rich, livereload)..." -ForegroundColor Cyan
    & (Join-Path $venvDir "Scripts\pip.exe") install rich livereload
}

Write-Host "Running manager using virtual environment python..." -ForegroundColor Cyan
& (Join-Path $venvDir "Scripts\python.exe") (Join-Path $PSScriptRoot "manager\manager.py")
