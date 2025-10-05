# Hệ thống Authentication - Anh Minh Tsc.

## Tổng quan
Đây là hệ thống authentication cho trang web nội bộ công ty Anh Minh Tsc. Chỉ dành cho nhân viên đã được cấp tài khoản.

## Tính năng
- ✅ Đăng nhập cho nhân viên hiện có
- ✅ Bảo vệ routes với permissions
- ✅ Quản lý session và cookies
- ❌ Đăng ký tài khoản mới (chỉ IT có thể tạo)
- ❌ Đặt lại mật khẩu tự động (liên hệ IT)

## Cách sử dụng

### Production Mode (AuthProvider)
Hiện tại đang sử dụng AuthProvider với Supabase thật:

**Đăng nhập:**
- Email: `nhanvien@anhminhtsc.com` (hoặc bất kỳ email nào có @anhminhtsc.com)
- Password: Mật khẩu được cấp bởi IT

**Yêu cầu:**
1. **Environment variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Database setup:**
- Bảng `employees` với email và thông tin nhân viên
- Bảng `roles` và `permissions` để quản lý quyền
- Supabase Auth được cấu hình đúng

## Cấu trúc Database

### Bảng `employees`
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  position TEXT,
  department TEXT,
  role_id UUID REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  password_hash TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng `roles`
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng `permissions`
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng `role_permissions`
```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);
```

## Quy trình Authentication

1. **Đăng nhập:** User nhập email/password
2. **Xác thực Supabase:** Kiểm tra credentials với Supabase Auth
3. **Kiểm tra Employee:** Tìm employee trong database với email
4. **Load Permissions:** Lấy role và permissions của employee
5. **Tạo Session:** Lưu thông tin user vào context và cookies
6. **Redirect:** Chuyển hướng đến dashboard hoặc trang được yêu cầu

## Bảo mật

- Chỉ nhân viên có trong database mới được phép đăng nhập
- Session được quản lý bởi Supabase với auto-refresh
- Cookies được set với httpOnly và secure flags
- Audit logs được ghi lại cho mọi hoạt động đăng nhập/đăng xuất

## Troubleshooting

### Lỗi "Tài khoản không tồn tại trong hệ thống"
- Kiểm tra email có trong bảng `employees` không
- Kiểm tra `is_active = true`
- Liên hệ IT để được thêm vào hệ thống

### Lỗi "Email hoặc mật khẩu không đúng"
- Kiểm tra credentials với Supabase Auth
- Đảm bảo email đã được confirm
- Kiểm tra không bị rate limit

### Không redirect được sau đăng nhập
- Kiểm tra middleware configuration
- Kiểm tra ProtectedRoute permissions
- Kiểm tra console logs để debug

## Liên hệ IT
Để được hỗ trợ về tài khoản, vui lòng liên hệ:
- Email: it@anhminhtsc.com
- Hotline: 1900-xxxx
