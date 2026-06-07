# pt - Ping with Timestamp (PowerShell 7+)
# Usage: irm https://www.xtualong.cn/scripts/install-pt7.ps1 | iex

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "Installing pt (Ping with Timestamp)..." -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Setting execution policy..." -ForegroundColor DarkGray
try {
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "  Done" -ForegroundColor Green
} catch {
    Write-Host "  Failed, run as administrator" -ForegroundColor Yellow
}

Write-Host "[2/3] Creating Profile..." -ForegroundColor DarkGray
if (!(Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -Type File -Force | Out-Null
    Write-Host "  Created: $PROFILE" -ForegroundColor Green
} else {
    Write-Host "  Exists: $PROFILE" -ForegroundColor Green
}

Write-Host "[3/3] Writing pt function..." -ForegroundColor DarkGray

$code = @'
# pt - Ping with Timestamp
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

function pt {
    param([string]$Target = "8.8.8.8", [int]$Count = 0)
    $a = @($Target)
    if ($Count -gt 0) { $a += "-n"; $a += $Count } else { $a += "-t" }
    $last = -1
    Write-Host ""
    Write-Host "Monitoring $Target, Ctrl+C to stop" -ForegroundColor DarkGray
    Write-Host ""
    & ping @a | ForEach-Object {
        $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $l = $_
        if ($l -match "TTL=") {
            $p = $l -split "(\d+)ms"
            if ($p.Count -ge 3) {
                $m = [int]$p[1]
                Write-Host "$ts  $($p[0])" -NoNewline
                if ($last -ge 0 -and [Math]::Abs($m - $last) -gt 5) { $c = "Magenta" }
                else { if($m -lt 10){$c="Cyan"} elseif($m -lt 35){$c="Green"} elseif($m -lt 80){$c="Yellow"} elseif($m -lt 150){$c="DarkYellow"} else{$c="Red"} }
                Write-Host "$m" -ForegroundColor $c -NoNewline
                Write-Host "ms$($p[2])"
                $last = $m
            } else { Write-Host "$ts  $l" }
        } elseif ($l -match "timed out|unreachable|General failure|Request timed out|Destination host") { Write-Host "$ts  $l" -ForegroundColor Red; $last = -1 }
        elseif ($l -match "\d+ms" -and $l -notmatch "TTL=") { Write-Host "$ts  $l" -ForegroundColor Red; $last = -1 }
        else { Write-Host "$ts  $l" }
    }
}
'@

$existing = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
if ($existing -and $existing -match "function pt") {
    Write-Host "  pt already installed" -ForegroundColor Yellow
    $r = Read-Host "  Replace? (Y/N)"
    if ($r -eq 'Y' -or $r -eq 'y') {
        $new = $existing -replace "(?s)# pt - Ping with Timestamp.*?^}", $code
        Set-Content -Path $PROFILE -Value $new -Encoding UTF8
        Write-Host "  Replaced" -ForegroundColor Green
    } else {
        Write-Host "  Skipped" -ForegroundColor DarkGray
    }
} else {
    Add-Content -Path $PROFILE -Value $code -Encoding UTF8
    Write-Host "  Done" -ForegroundColor Green
}

Write-Host ""
Write-Host "Complete! Restart PowerShell, then use: pt" -ForegroundColor Cyan
Write-Host ""
