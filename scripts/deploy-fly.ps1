param(
  [string]$AppName = "la-virtual-zone",
  [Parameter(Mandatory = $true)][string]$DatabaseUrl,
  [Parameter(Mandatory = $true)][string]$JwtSecret,
  [string]$SupabaseUrl = "",
  [string]$SupabaseAnonKey = "",
  [string]$AllowedOrigins = "",
  [switch]$NoSupabase
)

Write-Host "[1/3] Configurando secrets en Fly ($AppName)" -ForegroundColor Cyan
$secrets = @("DATABASE_URL=$DatabaseUrl", "JWT_SECRET=$JwtSecret", "NODE_ENV=production")
if ($AllowedOrigins -ne "") { $secrets += "ALLOWED_ORIGINS=$AllowedOrigins" }

$secretsArgs = $secrets | ForEach-Object { '"{0}"' -f $_ } | Join-String -Separator ' '
fly secrets set $secretsArgs --app $AppName

Write-Host "[2/3] Desplegando a Fly ($AppName)" -ForegroundColor Cyan

$deployArgs = @('--app', $AppName)
if (-not $NoSupabase) {
  if ($SupabaseUrl -ne "") { $deployArgs += @('--build-arg', "VITE_SUPABASE_URL=$SupabaseUrl") }
  if ($SupabaseAnonKey -ne "") { $deployArgs += @('--build-arg', "VITE_SUPABASE_ANON_KEY=$SupabaseAnonKey") }
}

fly deploy @deployArgs

Write-Host "[3/3] Listo. Revisa el estado con: fly status --app $AppName" -ForegroundColor Green


