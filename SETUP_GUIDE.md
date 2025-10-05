# Hướng dẫn Setup Database và Authentication

## Bước 1: Setup Supabase

1. **Tạo Supabase project:**
   - Truy cập [supabase.com](https://supabase.com)
   - Tạo project mới
   - Lưu lại URL và Anon Key

2. **Cấu hình Environment Variables:**
   Tạo file `.env.local` trong root project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Bước 2: Setup Database Schema

1. **Chạy schema trong Supabase SQL Editor:**
   - Mở Supabase Dashboard
   - Vào SQL Editor
   - Copy và chạy schema từ file `supabase/schema.sql`

2. **Chạy seed data:**
   - Copy và chạy script từ file `database-seed.sql`
   - Script này sẽ tạo:
     - 3 roles: admin, manager, employee
     - 16 permissions
     - 4 employees mẫu
     - Dữ liệu mẫu cho các bảng khác

## Bước 3: Setup Supabase Auth

1. **Cấu hình Authentication:**
   - Vào Authentication > Settings
   - Enable Email authentication
   - Disable "Enable email confirmations" (để test dễ hơn)

2. **Tạo tài khoản trong Supabase Auth:**
   - Vào Authentication > Users
   - Click "Add user"
   - Tạo các tài khoản:
     - Email: `admin@anhminhtsc.com`, Password: `123456`
     - Email: `manager@anhminhtsc.com`, Password: `123456`
     - Email: `employee@anhminhtsc.com`, Password: `123456`
     - Email: `8ricee@anhminhtsc.com`, Password: `123456`

## Bước 4: Test Authentication

1. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```

2. **Test đăng nhập:**
   - Truy cập `http://localhost:3001`
   - Đăng nhập với một trong các tài khoản trên
   - Kiểm tra redirect và permissions

## Bước 5: Kiểm tra Database

1. **Kiểm tra employees:**
   ```sql
   SELECT e.name, e.email, e.position, r.name as role_name 
   FROM employees e 
   LEFT JOIN roles r ON e.role_id = r.id;
   ```

2. **Kiểm tra permissions:**
   ```sql
   SELECT r.name as role_name, p.name as permission_name
   FROM roles r
   JOIN role_permissions rp ON r.id = rp.role_id
   JOIN permissions p ON rp.permission_id = p.id
   ORDER BY r.name, p.name;
   ```

## Troubleshooting

### Lỗi "Invalid login credentials"
- Kiểm tra email có trong Supabase Auth không
- Kiểm tra password có đúng không
- Kiểm tra email có trong bảng employees không

### Lỗi "Tài khoản không tồn tại trong hệ thống"
- Kiểm tra email có trong bảng employees không
- Kiểm tra `is_active = true`
- Kiểm tra email có đúng format @anhminhtsc.com không

### Lỗi middleware redirect
- Kiểm tra environment variables
- Kiểm tra Supabase URL và Key có đúng không
- Kiểm tra console logs để debug

## Tài khoản Test

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@anhminhtsc.com | 123456 | admin | Tất cả quyền |
| manager@anhminhtsc.com | 123456 | manager | Xem và chỉnh sửa |
| employee@anhminhtsc.com | 123456 | employee | Chỉ xem |
| 8ricee@anhminhtsc.com | 123456 | employee | Chỉ xem |

## Cấu trúc Database

- **employees**: Thông tin nhân viên
- **roles**: Vai trò (admin, manager, employee)
- **permissions**: Quyền hạn
- **role_permissions**: Liên kết role và permission
- **customers**: Khách hàng
- **products**: Sản phẩm
- **orders**: Đơn hàng
- **projects**: Dự án
- **tasks**: Nhiệm vụ
- **suppliers**: Nhà cung cấp
- **quotes**: Báo giá
- **purchase_orders**: Đơn mua hàng
- **audit_logs**: Log hoạt động
- **notifications**: Thông báo
- **system_settings**: Cài đặt hệ thống
