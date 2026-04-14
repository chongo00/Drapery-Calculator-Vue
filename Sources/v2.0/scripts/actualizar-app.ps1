# Script unico: compilar e instalar la app en el telefono (para iterar con feedback).
# Requisitos: C:\Android con Gradle + SDK + platform-tools, telefono por USB con depuracion USB.
# Uso: .\scripts\actualizar-app.ps1

$ErrorActionPreference = "Stop"
$root = if ($PSScriptRoot) { (Resolve-Path $PSScriptRoot).Path } else { (Get-Location).Path }
if ((Split-Path -Leaf $root) -eq "scripts") { $root = Split-Path -Parent $root }

Write-Host "=== Actualizar app en telefono ===" -ForegroundColor Cyan
Write-Host "Proyecto: $root" -ForegroundColor Gray

# 0. Compilar proyecto Vue
Write-Host "Compilando proyecto Vue (npm run build)..." -ForegroundColor Yellow
Push-Location $root
& npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Host "Build Vue fallido." -ForegroundColor Red; exit 1 }
Pop-Location
Write-Host "OK." -ForegroundColor Green

# 1. Comprobar dist existe
if (-not (Test-Path "$root\dist\index.html")) {
    Write-Host "ERROR: No se encontro dist/index.html" -ForegroundColor Red
    exit 1
}

# 2. Copiar dist a Android
Write-Host "Copiando dist -> assets/public ..." -ForegroundColor Yellow
$dst = "$root\android\app\src\main\assets\public"
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }
Copy-Item -Path "$root\dist\*" -Destination $dst -Recurse -Force
Write-Host "OK." -ForegroundColor Green

# 3. Compilar APK (Gradle en C:\Android, timeouts largos)
$env:GRADLE_USER_HOME = "C:\Android\gradle-cache"
$env:GRADLE_OPTS = "-Dorg.gradle.internal.http.connectionTimeout=1800000 -Dorg.gradle.internal.http.socketTimeout=1800000"
Push-Location "$root\android"
Write-Host "Compilando APK ..." -ForegroundColor Yellow
& .\gradlew.bat assembleDebug --no-daemon
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Host "Build fallido." -ForegroundColor Red; exit 1 }
Pop-Location
Write-Host "APK generado." -ForegroundColor Green

# 4. Instalar en telefono (adb en C:\Android primero)
$apk = "$root\android\app\build\outputs\apk\debug\app-debug.apk"
$adb = $null
foreach ($p in @("C:\Android\platform-tools\adb.exe", "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe", "$env:ANDROID_HOME\platform-tools\adb.exe")) {
    if ($p -and (Test-Path $p)) { $adb = $p; break }
}
if (-not $adb) { $adb = "adb" }

Write-Host "Instalando en telefono ..." -ForegroundColor Yellow
$result = & $adb install -r $apk 2>&1
if ($LASTEXITCODE -ne 0 -and ($result -match "INSTALL_FAILED_UPDATE_INCOMPATIBLE|signatures do not match")) {
    Write-Host "Desinstalando version anterior (firma distinta) ..." -ForegroundColor Yellow
    & $adb uninstall com.blindsbook.draperycalculator 2>$null
    & $adb install -r $apk
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "Fallo instalacion. Revisa USB y depuracion USB. adb: $adb" -ForegroundColor Red
    exit 1
}
Write-Host "App actualizada en el telefono." -ForegroundColor Green
& $adb shell am start -n com.blindsbook.draperycalculator/.MainActivity 2>$null
Write-Host "Listo." -ForegroundColor Green
