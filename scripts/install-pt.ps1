# pt 命令一键安装脚本
# 用法: irm https://www.xtualong.cn/scripts/install-pt.ps1 | iex
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "正在安装 pt (Ping with Timestamp)..." -ForegroundColor Cyan
Write-Host ""

# 1. 设置执行策略
Write-Host "[1/3] 设置执行策略..." -ForegroundColor DarkGray
try {
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "  执行策略已设置为 RemoteSigned" -ForegroundColor Green
} catch {
    Write-Host "  设置执行策略失败，请以管理员身份运行" -ForegroundColor Yellow
}

# 2. 创建 Profile 文件
Write-Host "[2/3] 创建 Profile 文件..." -ForegroundColor DarkGray
if (!(Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -Type File -Force | Out-Null
    Write-Host "  Profile 文件已创建: $PROFILE" -ForegroundColor Green
} else {
    Write-Host "  Profile 文件已存在: $PROFILE" -ForegroundColor Green
}

# 3. 写入 pt 函数
Write-Host "[3/3] 写入 pt 函数..." -ForegroundColor DarkGray

$ptFunction = @'

# pt - Ping with Timestamp (彩色延迟监控)
[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding(936)
$OutputEncoding = [System.Text.Encoding]::GetEncoding(936)

function pt {
    param(
        [string]$Target = "8.8.8.8",
        [int]$Count = 0
    )
    $pingArgs = @($Target)
    if ($Count -gt 0) { $pingArgs += "-n"; $pingArgs += $Count }
    else               { $pingArgs += "-t" }

    $lastMs = -1

    Write-Host ""
    Write-Host "正在监控 $Target，Ctrl+C 停止" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host -NoNewline "延迟 "
    Write-Host -NoNewline "<10ms " -ForegroundColor Cyan
    Write-Host -NoNewline "10-35ms " -ForegroundColor Green
    Write-Host -NoNewline "36-80ms " -ForegroundColor Yellow
    Write-Host -NoNewline "81-150ms " -ForegroundColor DarkYellow
    Write-Host -NoNewline ">150ms " -ForegroundColor Red
    Write-Host "| 抖动>5ms" -ForegroundColor Magenta
    Write-Host ""

    & ping @pingArgs | ForEach-Object {
        $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $line = $_

        if ($line -match "TTL=") {
            $parts = $line -split "(\d+)ms"
            if ($parts.Count -ge 3) {
                $ms = [int]$parts[1]
                Write-Host "$ts  $($parts[0])" -NoNewline

                if ($lastMs -ge 0 -and [Math]::Abs($ms - $lastMs) -gt 5) {
                    $c = "Magenta"
                } else {
                    if     ($ms -lt 10)  { $c = "Cyan" }
                    elseif($ms -lt 35)  { $c = "Green" }
                    elseif($ms -lt 80)  { $c = "Yellow" }
                    elseif($ms -lt 150) { $c = "DarkYellow" }
                    else                { $c = "Red" }
                }

                Write-Host "$ms" -ForegroundColor $c -NoNewline
                Write-Host "ms$($parts[2])"
                $lastMs = $ms
            } else {
                Write-Host "$ts  $line"
            }
        }
        elseif ($line -match "timed out|超时|无法访问") {
            Write-Host "$ts  $line" -ForegroundColor Red
            $lastMs = -1
        }
        else {
            Write-Host "$ts  $line"
        }
    }
}
'@

$profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
if ($profileContent -and $profileContent -match "function pt") {
    Write-Host "  pt 函数已存在，跳过写入" -ForegroundColor Yellow
} else {
    Add-Content -Path $PROFILE -Value $ptFunction -Encoding UTF8
    Write-Host "  pt 函数已写入 Profile" -ForegroundColor Green
}

Write-Host ""
Write-Host "安装完成！请重启 PowerShell 后使用 pt 命令" -ForegroundColor Cyan
Write-Host ""
Write-Host "使用示例:" -ForegroundColor DarkGray
Write-Host "  pt                    # 持续 ping 8.8.8.8" -ForegroundColor White
Write-Host "  pt baidu.com          # ping 指定域名" -ForegroundColor White
Write-Host "  pt 8.8.8.8 -Count 20  # ping 20 次" -ForegroundColor White
Write-Host ""
