# PowerShell script để test hệ thống bảo mật
# Sử dụng: .\test-security.ps1

Write-Host "🧪 Bắt đầu test hệ thống bảo mật..." -ForegroundColor Green

# Kiểm tra xem có file .env.local không
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Không tìm thấy file .env.local" -ForegroundColor Red
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
    exit 1
}

Write-Host "✅ Environment variables đã được load" -ForegroundColor Green

# Test 1: Kiểm tra database connection
Write-Host ""
Write-Host "🔍 Test 1: Kiểm tra kết nối database..." -ForegroundColor Cyan

$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlPath) {
    $dbHost = [Environment]::GetEnvironmentVariable("SUPABASE_DB_HOST", "Process")
    $dbPort = [Environment]::GetEnvironmentVariable("SUPABASE_DB_PORT", "Process")
    $dbUser = [Environment]::GetEnvironmentVariable("SUPABASE_DB_USER", "Process")
    $dbPassword = [Environment]::GetEnvironmentVariable("SUPABASE_DB_PASSWORD", "Process")
    $dbName = [Environment]::GetEnvironmentVariable("SUPABASE_DB_NAME", "Process")
    
    if (-not [string]::IsNullOrEmpty($dbHost) -and -not [string]::IsNullOrEmpty($dbUser) -and -not [string]::IsNullOrEmpty($dbPassword) -and -not [string]::IsNullOrEmpty($dbName)) {
        $env:PGPASSWORD = $dbPassword
        $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT version();" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Kết nối database thành công" -ForegroundColor Green
        } else {
            Write-Host "❌ Không thể kết nối database" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Thiếu thông tin database connection" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  psql không được cài đặt, bỏ qua test database" -ForegroundColor Yellow
}

# Test 2: Kiểm tra các bảng quan trọng
Write-Host ""
Write-Host "🔍 Test 2: Kiểm tra các bảng quan trọng..." -ForegroundColor Cyan

if ($psqlPath -and -not [string]::IsNullOrEmpty($dbHost)) {
    $tables = @("roles", "employees", "customers", "products", "orders", "projects", "tasks")
    
    foreach ($table in $tables) {
        $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT COUNT(*) FROM public.$table;" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Bảng $table tồn tại" -ForegroundColor Green
        } else {
            Write-Host "❌ Bảng $table không tồn tại hoặc có lỗi" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  psql không được cài đặt, bỏ qua test bảng" -ForegroundColor Yellow
}

# Test 3: Kiểm tra RLS policies
Write-Host ""
Write-Host "🔍 Test 3: Kiểm tra RLS policies..." -ForegroundColor Cyan

if ($psqlPath -and -not [string]::IsNullOrEmpty($dbHost)) {
    $tables = @("employees", "customers", "products", "orders", "projects", "tasks")
    
    foreach ($table in $tables) {
        $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT COUNT(*) FROM pg_policies WHERE tablename = '$table';" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $policyCount = $result.Trim()
            if ([int]$policyCount -gt 0) {
                Write-Host "✅ Bảng $table có $policyCount policies" -ForegroundColor Green
            } else {
                Write-Host "❌ Bảng $table không có policies" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Không thể kiểm tra policies cho bảng $table" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  psql không được cài đặt, bỏ qua test RLS" -ForegroundColor Yellow
}

# Test 4: Kiểm tra functions
Write-Host ""
Write-Host "🔍 Test 4: Kiểm tra functions..." -ForegroundColor Cyan

if ($psqlPath -and -not [string]::IsNullOrEmpty($dbHost)) {
    $functions = @("check_permission", "get_current_user_info", "is_admin", "is_manager")
    
    foreach ($func in $functions) {
        $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT $func('test');" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Function $func hoạt động" -ForegroundColor Green
        } else {
            Write-Host "❌ Function $func có lỗi" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  psql không được cài đặt, bỏ qua test functions" -ForegroundColor Yellow
}

# Test 5: Kiểm tra roles và permissions
Write-Host ""
Write-Host "🔍 Test 5: Kiểm tra roles và permissions..." -ForegroundColor Cyan

if ($psqlPath -and -not [string]::IsNullOrEmpty($dbHost)) {
    $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT COUNT(*) FROM public.roles;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $roleCount = $result.Trim()
        if ([int]$roleCount -gt 0) {
            Write-Host "✅ Có $roleCount roles trong hệ thống" -ForegroundColor Green
            
            # Hiển thị danh sách roles
            Write-Host "📋 Danh sách roles:" -ForegroundColor Cyan
            psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT name, description FROM public.roles ORDER BY name;" 2>&1
        } else {
            Write-Host "❌ Không có roles nào trong hệ thống" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Không thể kiểm tra roles" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  psql không được cài đặt, bỏ qua test roles" -ForegroundColor Yellow
}

# Test 6: Kiểm tra ứng dụng Next.js
Write-Host ""
Write-Host "🔍 Test 6: Kiểm tra ứng dụng Next.js..." -ForegroundColor Cyan

$npmPath = Get-Command npm -ErrorAction SilentlyContinue
if ($npmPath) {
    Write-Host "📦 Kiểm tra dependencies..." -ForegroundColor Cyan
    $result = npm list @supabase/supabase-js @supabase/ssr 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase dependencies đã được cài đặt" -ForegroundColor Green
    } else {
        Write-Host "❌ Supabase dependencies chưa được cài đặt" -ForegroundColor Red
        Write-Host "Chạy: npm install @supabase/supabase-js @supabase/ssr" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  npm không được cài đặt, bỏ qua test dependencies" -ForegroundColor Yellow
}

# Test 7: Kiểm tra files quan trọng
Write-Host ""
Write-Host "🔍 Test 7: Kiểm tra files quan trọng..." -ForegroundColor Cyan

$files = @(
    "src/middleware.ts",
    "src/utils/auth-utils.ts",
    "src/hooks/use-permissions.tsx",
    "src/components/ui/permission-guard.tsx",
    "src/lib/api/auth-helpers.ts",
    "supabase/schema.sql",
    "supabase/rls-policies.sql"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ File $file tồn tại" -ForegroundColor Green
    } else {
        Write-Host "❌ File $file không tồn tại" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Test hoàn tất!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Các bước tiếp theo:" -ForegroundColor Cyan
Write-Host "1. Chạy ứng dụng: npm run dev" -ForegroundColor White
Write-Host "2. Truy cập /debug-permissions để kiểm tra permissions" -ForegroundColor White
Write-Host "3. Test đăng nhập với các role khác nhau" -ForegroundColor White
Write-Host "4. Kiểm tra các API endpoints" -ForegroundColor White
Write-Host "5. Test RLS policies trong Supabase Dashboard" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Troubleshooting:" -ForegroundColor Cyan
Write-Host "- Nếu có lỗi database, kiểm tra connection string" -ForegroundColor White
Write-Host "- Nếu có lỗi permissions, kiểm tra RLS policies" -ForegroundColor White
Write-Host "- Nếu có lỗi auth, kiểm tra Supabase configuration" -ForegroundColor White
