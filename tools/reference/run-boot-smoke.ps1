[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
$archivePath = Join-Path $repoRoot '.work\original\TR1PCdemo1.zip'
$emulatorPath = Join-Path $repoRoot '.work\emulator\dosbox-x-2026.07.02\mingw-build\mingw-sdl2\dosbox-x.exe'
$templatePath = Join-Path $repoRoot 'reference\dosbox-x-m0.conf.template'
$mapperPath = Join-Path $repoRoot 'reference\empty.mapper'
$reducerPath = Join-Path $repoRoot '.work\tool-build\tools\m0\reduce-boot-log.js'
$traceRoot = Join-Path $repoRoot '.work\traces\m0'
$referenceRoot = Join-Path $repoRoot '.work\reference\m0'

function Assert-Identity {
    param([string]$Path, [long]$Bytes, [string]$Sha256)
    $item = Get-Item -LiteralPath $Path
    if ($item.Length -ne $Bytes) { throw "Length mismatch for $Path" }
    $stream = [IO.File]::OpenRead($Path)
    $hasher = [Security.Cryptography.SHA256]::Create()
    try {
        $actual = ([BitConverter]::ToString($hasher.ComputeHash($stream))).Replace('-', '').ToLowerInvariant()
    }
    finally {
        $hasher.Dispose()
        $stream.Dispose()
    }
    if ($actual -ne $Sha256) { throw "SHA-256 mismatch for $Path" }
}

$ignore = Get-Content -LiteralPath (Join-Path $repoRoot '.gitignore')
if (-not ($ignore | Where-Object { $_.Trim() -ceq '.work/' })) { throw '.gitignore must contain .work/ before archive access' }
Assert-Identity -Path $archivePath -Bytes 2194574 -Sha256 'e0bd2434a6b5005eee5e038c25f294d7ac0d497a3880f463f74266b53fa6bd5b'
Assert-Identity -Path $emulatorPath -Bytes 25551360 -Sha256 '5f54ec0a5657419c133f88f7ce3b0c9b431405a9ef450e099af7c0bc1a837dc4'

New-Item -ItemType Directory -Path $traceRoot -Force | Out-Null
New-Item -ItemType Directory -Path $referenceRoot -Force | Out-Null
$template = Get-Content -LiteralPath $templatePath -Raw
$traceHashes = @()

foreach ($runNumber in 1, 2) {
    $runRoot = Join-Path $referenceRoot "run-$runNumber"
    $captureRoot = Join-Path $runRoot 'captures'
    $logPath = Join-Path $runRoot 'boot.log'
    $configPath = Join-Path $runRoot 'dosbox-x.conf'
    $tracePath = Join-Path $traceRoot "boot-run-$runNumber.reduced.json"
    New-Item -ItemType Directory -Path $captureRoot -Force | Out-Null
    foreach ($generatedPath in @($logPath, $configPath, $tracePath)) {
        if (Test-Path -LiteralPath $generatedPath) { Remove-Item -LiteralPath $generatedPath }
    }

    $config = $template.Replace('{{ARCHIVE_PATH}}', $archivePath).Replace('{{LOG_FILE}}', $logPath).Replace('{{CAPTURE_DIR}}', $captureRoot).Replace('{{MAPPER_FILE}}', $mapperPath)
    Set-Content -LiteralPath $configPath -Value $config -Encoding Ascii

    $process = Start-Process -FilePath $emulatorPath -ArgumentList @('-conf', $configPath, '-fastlaunch') -WorkingDirectory (Split-Path -Parent $emulatorPath) -WindowStyle Hidden -PassThru
    try {
        $deadline = [DateTime]::UtcNow.AddSeconds(30)
        $reached = $false
        while ([DateTime]::UtcNow -lt $deadline) {
            if ($process.HasExited) { throw "DOSBox-X exited before the boot marker in run $runNumber" }
            if (Test-Path -LiteralPath $logPath) {
                $log = Get-Content -LiteralPath $logPath -Raw
                $reset = $log.IndexOf('ERROR MOUSE:Unhandled videomode 69 on reset', [StringComparison]::Ordinal)
                if ($reset -ge 0 -and $log.IndexOf('surface consider=640x480 final=640x480', $reset, [StringComparison]::Ordinal) -gt $reset) {
                    $reached = $true
                    break
                }
            }
            Start-Sleep -Milliseconds 250
            $process.Refresh()
        }
        if (-not $reached) { throw "Timed out waiting for the boot marker in run $runNumber" }
        Start-Sleep -Milliseconds 500
    }
    finally {
        $process.Refresh()
        if (-not $process.HasExited) {
            Stop-Process -Id $process.Id
            $process.WaitForExit()
        }
    }

    $reducerOutput = & node $reducerPath $logPath $tracePath
    if ($LASTEXITCODE -ne 0) { throw "Boot trace reducer failed in run $runNumber" }
    $hash = ($reducerOutput | Select-Object -Last 1).Trim()
    $traceHashes += $hash
}

if ($traceHashes[0] -ne $traceHashes[1]) { throw 'Reduced boot traces do not match' }
[pscustomobject]@{ ConfigId = 'm0-reference-v1'; Runs = 2; ReducedTraceSha256 = $traceHashes[0]; Match = $true } | ConvertTo-Json
