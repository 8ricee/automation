#!/bin/bash

# Script để chạy migration và setup RLS policies
# Sử dụng: ./setup-security.sh

echo "🚀 Bắt đầu setup bảo mật cho Supabase..."

# Kiểm tra xem có file .env không
if [ ! -f .env.local ]; then
    echo "❌ Không tìm thấy file .env.local"
    echo "Vui lòng tạo file .env.local với các biến môi trường Supabase"
    exit 1
fi

# Load environment variables
source .env.local

# Kiểm tra các biến môi trường cần thiết
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Thiếu biến môi trường Supabase"
    echo "Cần có NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ Environment variables đã được load"

# Chạy schema chính
echo "📋 Chạy schema chính..."
if command -v psql &> /dev/null; then
    PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -f supabase/schema.sql
    if [ $? -eq 0 ]; then
        echo "✅ Schema chính đã được áp dụng"
    else
        echo "❌ Lỗi khi chạy schema chính"
        exit 1
    fi
else
    echo "⚠️  psql không được cài đặt. Vui lòng chạy thủ công:"
    echo "psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -f supabase/schema.sql"
fi

# Chạy RLS policies
echo "🔒 Chạy RLS policies..."
if command -v psql &> /dev/null; then
    PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -f supabase/rls-policies.sql
    if [ $? -eq 0 ]; then
        echo "✅ RLS policies đã được áp dụng"
    else
        echo "❌ Lỗi khi chạy RLS policies"
        exit 1
    fi
else
    echo "⚠️  psql không được cài đặt. Vui lòng chạy thủ công:"
    echo "psql -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -f supabase/rls-policies.sql"
fi

echo "🎉 Setup bảo mật hoàn tất!"
echo ""
echo "📝 Các bước tiếp theo:"
echo "1. Tạo tài khoản admin đầu tiên trong Supabase Dashboard"
echo "2. Chạy ứng dụng: npm run dev"
echo "3. Truy cập /debug-permissions để kiểm tra permissions"
echo "4. Test các API endpoints với các role khác nhau"
echo ""
echo "🔧 Các role có sẵn:"
echo "- admin: Toàn quyền hệ thống"
echo "- director: Quản lý cấp cao"
echo "- manager: Quản lý dự án"
echo "- engineer: Kỹ sư"
echo "- sales: Nhân viên bán hàng"
echo "- purchasing: Nhân viên mua sắm"
echo "- accountant: Kế toán"
