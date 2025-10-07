#!/bin/bash

# Script test hệ thống bảo mật
# Sử dụng: ./test-security.sh

echo "🧪 Bắt đầu test hệ thống bảo mật..."

# Kiểm tra xem có file .env.local không
if [ ! -f .env.local ]; then
    echo "❌ Không tìm thấy file .env.local"
    exit 1
fi

# Load environment variables
source .env.local

# Kiểm tra các biến môi trường cần thiết
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Thiếu biến môi trường Supabase"
    exit 1
fi

echo "✅ Environment variables đã được load"

# Test 1: Kiểm tra database connection
echo ""
echo "🔍 Test 1: Kiểm tra kết nối database..."

if command -v psql &> /dev/null; then
    PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -c "SELECT version();" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Kết nối database thành công"
    else
        echo "❌ Không thể kết nối database"
        exit 1
    fi
else
    echo "⚠️  psql không được cài đặt, bỏ qua test database"
fi

# Test 2: Kiểm tra các bảng quan trọng
echo ""
echo "🔍 Test 2: Kiểm tra các bảng quan trọng..."

if command -v psql &> /dev/null; then
    TABLES=("roles" "employees" "customers" "products" "orders" "projects" "tasks")
    
    for table in "${TABLES[@]}"; do
        PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -c "SELECT COUNT(*) FROM public.$table;" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ Bảng $table tồn tại"
        else
            echo "❌ Bảng $table không tồn tại hoặc có lỗi"
        fi
    done
else
    echo "⚠️  psql không được cài đặt, bỏ qua test bảng"
fi

# Test 3: Kiểm tra RLS policies
echo ""
echo "🔍 Test 3: Kiểm tra RLS policies..."

if command -v psql &> /dev/null; then
    TABLES=("employees" "customers" "products" "orders" "projects" "tasks")
    
    for table in "${TABLES[@]}"; do
        POLICY_COUNT=$(PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -t -c "SELECT COUNT(*) FROM pg_policies WHERE tablename = '$table';" 2>/dev/null | tr -d ' ')
        
        if [ "$POLICY_COUNT" -gt 0 ]; then
            echo "✅ Bảng $table có $POLICY_COUNT policies"
        else
            echo "❌ Bảng $table không có policies"
        fi
    done
else
    echo "⚠️  psql không được cài đặt, bỏ qua test RLS"
fi

# Test 4: Kiểm tra functions
echo ""
echo "🔍 Test 4: Kiểm tra functions..."

if command -v psql &> /dev/null; then
    FUNCTIONS=("check_permission" "get_current_user_info" "is_admin" "is_manager")
    
    for func in "${FUNCTIONS[@]}"; do
        PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -c "SELECT $func('test');" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ Function $func hoạt động"
        else
            echo "❌ Function $func có lỗi"
        fi
    done
else
    echo "⚠️  psql không được cài đặt, bỏ qua test functions"
fi

# Test 5: Kiểm tra roles và permissions
echo ""
echo "🔍 Test 5: Kiểm tra roles và permissions..."

if command -v psql &> /dev/null; then
    ROLE_COUNT=$(PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -t -c "SELECT COUNT(*) FROM public.roles;" 2>/dev/null | tr -d ' ')
    
    if [ "$ROLE_COUNT" -gt 0 ]; then
        echo "✅ Có $ROLE_COUNT roles trong hệ thống"
        
        # Hiển thị danh sách roles
        echo "📋 Danh sách roles:"
        PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -c "SELECT name, description FROM public.roles ORDER BY name;" 2>/dev/null
    else
        echo "❌ Không có roles nào trong hệ thống"
    fi
else
    echo "⚠️  psql không được cài đặt, bỏ qua test roles"
fi

# Test 6: Kiểm tra ứng dụng Next.js
echo ""
echo "🔍 Test 6: Kiểm tra ứng dụng Next.js..."

if command -v npm &> /dev/null; then
    echo "📦 Kiểm tra dependencies..."
    npm list @supabase/supabase-js @supabase/ssr > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Supabase dependencies đã được cài đặt"
    else
        echo "❌ Supabase dependencies chưa được cài đặt"
        echo "Chạy: npm install @supabase/supabase-js @supabase/ssr"
    fi
else
    echo "⚠️  npm không được cài đặt, bỏ qua test dependencies"
fi

# Test 7: Kiểm tra files quan trọng
echo ""
echo "🔍 Test 7: Kiểm tra files quan trọng..."

FILES=(
    "src/middleware.ts"
    "src/utils/auth-utils.ts"
    "src/hooks/use-permissions.tsx"
    "src/components/ui/permission-guard.tsx"
    "src/lib/api/auth-helpers.ts"
    "supabase/schema.sql"
    "supabase/rls-policies.sql"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ File $file tồn tại"
    else
        echo "❌ File $file không tồn tại"
    fi
done

echo ""
echo "🎉 Test hoàn tất!"
echo ""
echo "📝 Các bước tiếp theo:"
echo "1. Chạy ứng dụng: npm run dev"
echo "2. Truy cập /debug-permissions để kiểm tra permissions"
echo "3. Test đăng nhập với các role khác nhau"
echo "4. Kiểm tra các API endpoints"
echo "5. Test RLS policies trong Supabase Dashboard"
echo ""
echo "🔧 Troubleshooting:"
echo "- Nếu có lỗi database, kiểm tra connection string"
echo "- Nếu có lỗi permissions, kiểm tra RLS policies"
echo "- Nếu có lỗi auth, kiểm tra Supabase configuration"
