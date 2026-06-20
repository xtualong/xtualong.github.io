# pt - Ping with Timestamp (PowerShell 5.1)
# Usage: irm https://www.xtualong.cn/scripts/install-pt5.ps1 | iex

[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding(936)
$OutputEncoding = [System.Text.Encoding]::GetEncoding(936)

Write-Host ""
Write-Host "正在安装 pt（带时间戳的 Ping 工具）..." -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] 设置执行策略..." -ForegroundColor DarkGray
try {
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "  完成" -ForegroundColor Green
} catch {
    Write-Host "  失败，请以管理员身份运行" -ForegroundColor Yellow
}

Write-Host "[2/3] 创建 Profile..." -ForegroundColor DarkGray
if (!(Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -Type File -Force | Out-Null
    Write-Host "  已创建: $PROFILE" -ForegroundColor Green
} else {
    Write-Host "  已存在: $PROFILE" -ForegroundColor Green
}

Write-Host "[3/3] 写入 pt 函数..." -ForegroundColor DarkGray

$code = @"
# pt - Ping with Timestamp
[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding(936)
`$OutputEncoding = [System.Text.Encoding]::GetEncoding(936)

function pt {
    param([string]`$Target = "223.5.5.5", [int]`$Count = 0)
    `$a = @(`$Target)
    if (`$Count -gt 0) { `$a += "-n"; `$a += `$Count } else { `$a += "-t" }
    `$last = -1
    Write-Host ""
    Write-Host "Ping `$Target，按 Ctrl+C 停止" -ForegroundColor DarkGray
    Write-Host ""
    & ping @a | ForEach-Object {
        `$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        `$l = `$_
        if (`$l -match "TTL=") {
            `$p = `$l -split "(\d+)ms"
            if (`$p.Count -ge 3) {
                `$m = [int]`$p[1]
                Write-Host "`$ts  `$(`$p[0])" -NoNewline
                if (`$last -ge 0 -and [Math]::Abs(`$m - `$last) -gt 5) { `$c = "Magenta" }
                else { if(`$m -lt 10){`$c="Cyan"} elseif(`$m -lt 35){`$c="Green"} elseif(`$m -lt 80){`$c="Yellow"} elseif(`$m -lt 150){`$c="DarkYellow"} else{`$c="Red"} }
                Write-Host "`$m" -ForegroundColor `$c -NoNewline
                Write-Host "ms`$(`$p[2])"
                `$last = `$m
            } else { Write-Host "`$ts  `$l" }
        } elseif (`$l -match "timed out|请求超时|无法访问目标主机|一般故障|传输失败|目标.*不可达") { Write-Host "`$ts  `$l" -ForegroundColor Red; `$last = -1 }
        elseif (`$l -match "\d+ms" -and `$l -notmatch "TTL=") { Write-Host "`$ts  `$l" -ForegroundColor Red; `$last = -1 }
        else { Write-Host "`$ts  `$l" }
    }
}
"@

$existing = $null
if (Test-Path $PROFILE) {
    $existing = [System.IO.File]::ReadAllText($PROFILE, [System.Text.Encoding]::GetEncoding(936))
}
if ($existing -and $existing -match "function pt") {
    Write-Host "  pt 已安装" -ForegroundColor Yellow
    $r = Read-Host "  是否替换？(Y/N，回车默认替换)"
    if ($r -eq "" -or $r -eq "Y" -or $r -eq "y") {
        $marker = '# pt - Ping with Timestamp'
        $startIdx = $existing.IndexOf($marker)
        $rest = $existing.Substring($startIdx)
        $depth = 0; $endRel = -1
        for ($i = 0; $i -lt $rest.Length; $i++) {
            if ($rest[$i] -eq '{') { $depth++ }
            elseif ($rest[$i] -eq '}') { $depth--; if ($depth -le 0) { $endRel = $i; break } }
        }
        if ($endRel -ge 0) {
            $before = $existing.Substring(0, $startIdx)
            $after = $rest.Substring($endRel + 1)
            $new = $before + $code + $after
            [System.IO.File]::WriteAllText($PROFILE, $new, [System.Text.Encoding]::GetEncoding(936))
            Write-Host "  已替换" -ForegroundColor Green
        } else {
            Write-Host "  替换失败，请手动删除 Profile 中的 pt 代码后重新安装" -ForegroundColor Red
        }
    } else {
        Write-Host "  已跳过" -ForegroundColor DarkGray
    }
} else {
    [System.IO.File]::AppendAllText($PROFILE, "`n$code", [System.Text.Encoding]::GetEncoding(936))
    Write-Host "  完成" -ForegroundColor Green
}

Write-Host ""
Write-Host "安装完成！请重启 PowerShell 后使用" -ForegroundColor Cyan
Write-Host ""
Write-Host "用法:" -ForegroundColor White
Write-Host "  pt                          # 默认 ping 223.5.5.5（阿里 DNS）" -ForegroundColor DarkGray
Write-Host "  pt 8.8.8.8                  # ping 指定地址" -ForegroundColor DarkGray
Write-Host "  pt 1.1.1.1 5                # ping 5 次后停止" -ForegroundColor DarkGray
Write-Host ""
Write-Host "常用 DNS:" -ForegroundColor White
Write-Host "  223.5.5.5        阿里 DNS（默认）" -ForegroundColor DarkGray
Write-Host "  119.29.29.29     腾讯 DNSPod" -ForegroundColor DarkGray
Write-Host "  8.8.8.8          Google DNS" -ForegroundColor DarkGray
Write-Host "  1.1.1.1          Cloudflare DNS" -ForegroundColor DarkGray
Write-Host ""
