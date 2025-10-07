# PowerShell script để setup bảo mật cho Supabase
# Sử dụng: .\setup-security.ps1

Write-Host "🚀 Bắt đầu setup bảo mật cho Supabase..." -ForegroundColor Green

# Kiểm tra xem có file .env.local không
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Không tìm thấy file .env.local" -ForegroundColor Red
    Write-Host "Vui lòng tạo file .env.local với các biến môi trường Supabase" -ForegroundColor Yellow
    exit 1
}

# Load environment variables từ .env.local
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

# Kiểm tra các biến môi trường cần thiết
$supabaseUrl = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL", "Process")
$supabaseKey = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY", "Process")

if ([string]::IsNullOrEmpty($supabaseUrl) -or [string]::IsNullOrEmpty($supabaseKey)) {
    Write-Host "❌ Thiếu biến môi trường Supabase" -ForegroundColor Red
    Write-Host "Cần có NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment variables đã được load" -ForegroundColor Green

# Kiểm tra xem có psql không
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "⚠️  psql không được cài đặt hoặc không có trong PATH" -ForegroundColor Yellow
    Write-Host "Vui lòng cài đặt PostgreSQL client hoặc sử dụng Supabase CLI" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Các file SQL cần chạy thủ công:" -ForegroundColor Cyan
    Write-Host "1. supabase/schema.sql" -ForegroundColor White
    Write-Host "2. supabase/rls-policies.sql" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Hoặc sử dụng Supabase CLI:" -ForegroundColor Cyan
    Write-Host "npx supabase db reset" -ForegroundColor White
    Write-Host "npx supabase db push" -ForegroundColor White
    exit 0
}

# Lấy thông tin database từ environment variables
$dbHost = [Environment]::GetEnvironmentVariable("SUPABASE_DB_HOST", "Process")
$dbPort = [Environment]::GetEnvironmentVariable("SUPABASE_DB_PORT", "Process")
$dbUser = [Environment]::GetEnvironmentVariable("SUPABASE_DB_USER", "Process")
$dbPassword = [Environment]::GetEnvironmentVariable("SUPABASE_DB_PASSWORD", "Process")
$dbName = [Environment]::GetEnvironmentVariable("SUPABASE_DB_NAME", "Process")

if ([string]::IsNullOrEmpty($dbHost) -or [string]::IsNullOrEmpty($dbUser) -or [string]::IsNullOrEmpty($dbPassword) -or [string]::IsNullOrEmpty($dbName)) {
    Write-Host "❌ Thiếu thông tin database connection" -ForegroundColor Red
    Write-Host "Cần có SUPABASE_DB_HOST, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD, SUPABASE_DB_NAME" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Các file SQL cần chạy thủ công trong Supabase Dashboard:" -ForegroundColor Cyan
    Write-Host "1. supabase/schema.sql" -ForegroundColor White
    Write-Host "2. supabase/rls-policies.sql" -ForegroundColor White
    exit 0
}

# Chạy schema chính
Write-Host "📋 Chạy schema chính..." -ForegroundColor Cyan
$env:PGPASSWORD = $dbPassword
$schemaResult = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "supabase/schema.sql" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema chính đã được áp dụng" -ForegroundColor Green
} else {
    Write-Host "❌ Lỗi khi chạy schema chính:" -ForegroundColor Red
    Write-Host $schemaResult -ForegroundColor Red
    exit 1
}

# Chạy RLS policies
Write-Host "🔒 Chạy RLS policies..." -ForegroundColor Cyan
$rlsResult = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "supabase/rls-policies.sql" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ RLS policies đã được áp dụng" -ForegroundColor Green
} else {
    Write-Host "❌ Lỗi khi chạy RLS policies:" -ForegroundColor Red
    Write-Host $rlsResult -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Setup bảo mật hoàn tất!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Các bước tiếp theo:" -ForegroundColor Cyan
Write-Host "1. Tạo tài khoản admin đầu tiên trong Supabase Dashboard" -ForegroundColor White
Write-Host "2. Chạy ứng dụng: npm run dev" -ForegroundColor White
Write-Host "3. Truy cập /debug-permissions để kiểm tra permissions" -ForegroundColor White
Write-Host "4. Test các API endpoints với các role khác nhau" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Các role có sẵn:" -ForegroundColor Cyan
Write-Host "- admin: Toàn quyền hệ thống" -ForegroundColor White
Write-Host "- director: Quản lý cấp cao" -ForegroundColor White
Write-Host "- manager: Quản lý dự án" -ForegroundColor White
Write-Host "- engineer: Kỹ sư" -ForegroundColor White
Write-Host "- sales: Nhân viên bán hàng" -ForegroundColor White
Write-Host "- purchasing: Nhân viên mua sắm" -ForegroundColor White
Write-Host "- accountant: Kế toán" -ForegroundColor White
