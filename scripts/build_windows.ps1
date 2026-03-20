# build_windows.ps1

Write-Host "🚀 Building deepH CLI..." -ForegroundColor Cyan
go build -o deeph.exe ./cmd/deeph

Write-Host "🚀 Building deepH Launcher (No Terminal)..." -ForegroundColor Cyan
# -ldflags "-H=windowsgui" removes the console window from the resulting .exe
go build -ldflags "-H=windowsgui" -o deeph-launcher.exe ./cmd/deeph-launcher

Write-Host "✅ Done! Binaries created in the root directory." -ForegroundColor Green
Write-Host "👉 Run '.\deeph.exe shortcut' to create a desktop shortcut." -ForegroundColor Yellow
