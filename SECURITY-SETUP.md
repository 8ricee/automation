# Hệ thống Authentication và Bảo mật với Supabase

Dự án này đã được tái cấu trúc để sử dụng Supabase Authentication và Row Level Security (RLS) để đảm bảo bảo mật toàn diện.

## 🚀 Tính năng chính

### 1. Authentication System
- **Supabase Auth**: Sử dụng Supabase để quản lý authentication
- **Role-based Access Control**: Hệ thống phân quyền dựa trên roles
- **Permission System**: Kiểm tra permissions chi tiết từ database
- **Session Management**: Quản lý session an toàn với cookies

### 2. Security Features
- **Row Level Security (RLS)**: Bảo mật dữ liệu ở cấp độ database
- **Permission Guards**: Components để kiểm tra quyền truy cập
- **Middleware Protection**: Bảo vệ routes ở cấp độ middleware
- **API Security**: Bảo mật API endpoints với permission checks

### 3. Database Schema
- **Roles Table**: Quản lý các vai trò trong hệ thống
- **Permissions**: Hệ thống permissions chi tiết
- **Audit Logs**: Ghi log các hoạt động quan trọng
- **Triggers**: Tự động cập nhật timestamps và audit logs

## 📋 Các Roles có sẵn

| Role | Mô tả | Permissions chính |
|------|-------|-------------------|
| `admin` | Quản trị viên | Toàn quyền hệ thống (`*`) |
| `director` | Giám đốc | Quản lý cấp cao, phê duyệt |
| `manager` | Quản lý dự án | Quản lý nhân viên, dự án |
| `engineer` | Kỹ sư | Thực hiện dự án, nhiệm vụ |
| `sales` | Nhân viên bán hàng | Chăm sóc khách hàng, báo giá |
| `purchasing` | Nhân viên mua sắm | Quản lý mua sắm, tồn kho |
| `accountant` | Kế toán | Quản lý tài chính, báo cáo |

## 🛠️ Setup và Cài đặt

### 1. Chuẩn bị môi trường

Tạo file `.env.local` với các biến môi trường:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Connection (cho migration)
SUPABASE_DB_HOST=your_db_host
SUPABASE_DB_PORT=5432
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_db_password
SUPABASE_DB_NAME=postgres
```

### 2. Chạy Migration

#### Windows (PowerShell):
```powershell
.\setup-security.ps1
```

#### Linux/Mac:
```bash
./setup-security.sh
```

#### Thủ công:
1. Chạy `supabase/schema.sql` trong Supabase Dashboard
2. Chạy `supabase/rls-policies.sql` trong Supabase Dashboard

### 3. Tạo tài khoản admin đầu tiên

1. Truy cập Supabase Dashboard
2. Vào Authentication > Users
3. Tạo user mới với email admin
4. Vào Database > Table Editor
5. Cập nhật bảng `employees` với role_id của admin

## 🔧 Sử dụng trong Code

### 1. Permission Guards

```tsx
import { RequirePermission, RequireRole } from '@/components/ui/permission-guard'

// Kiểm tra permission
<RequirePermission permission="customers:view">
  <CustomerList />
</RequirePermission>

// Kiểm tra role
<RequireRole role="admin">
  <AdminPanel />
</RequireRole>
```

### 2. Hooks

```tsx
import { usePermissions, useCurrentUser } from '@/hooks/use-permissions'

function MyComponent() {
  const { hasPermission, userRole } = usePermissions()
  const { isAdmin, isManager } = useCurrentUser()
  
  if (hasPermission('customers:create')) {
    // Hiển thị nút tạo customer
  }
}
```

### 3. API Routes

```typescript
import { requirePermission, createSuccessResponse } from '@/lib/api/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('customers:view', request)
    
    // Logic xử lý...
    
    return createSuccessResponse(data)
  } catch (error) {
    return createErrorResponse('Permission denied', 403)
  }
}
```

## 🧪 Testing và Debug

### 1. Debug Permissions

Truy cập `/debug-permissions` để xem:
- Thông tin user hiện tại
- Danh sách permissions
- Role flags
- Test các permissions cụ thể

### 2. Test API Endpoints

```bash
# Test với permission
curl -H "Authorization: Bearer <token>" /api/customers

# Test với role khác nhau
# Đăng nhập với các tài khoản có role khác nhau
```

### 3. Kiểm tra RLS

```sql
-- Kiểm tra policies
SELECT * FROM pg_policies WHERE tablename = 'customers';

-- Test permission function
SELECT check_permission('customers:view');
```

## 📁 Cấu trúc Files

```
src/
├── components/
│   ├── ui/
│   │   ├── permission-guard.tsx      # Components bảo vệ permissions
│   │   ├── permission-error-alert.tsx # Hiển thị lỗi permission
│   │   └── permission-debug-panel.tsx # Panel debug permissions
│   └── providers/
│       └── AuthProvider.tsx           # Context authentication
├── hooks/
│   └── use-permissions.tsx           # Hooks cho permissions
├── lib/
│   └── api/
│       └── auth-helpers.ts           # Utilities cho API auth
├── utils/
│   └── auth-utils.ts                 # Utilities authentication
├── middleware.ts                     # Middleware bảo vệ routes
└── app/
    ├── api/
    │   └── auth/                      # API authentication
    └── debug-permissions/             # Trang debug permissions

supabase/
├── schema.sql                        # Schema chính
└── rls-policies.sql                  # RLS policies
```

## 🔒 Bảo mật

### 1. Database Level
- **RLS Policies**: Bảo vệ dữ liệu ở cấp độ database
- **Permission Functions**: Kiểm tra quyền hạn từ database
- **Audit Logging**: Ghi log tất cả hoạt động quan trọng

### 2. Application Level
- **Middleware Protection**: Bảo vệ routes
- **Permission Guards**: Bảo vệ components
- **API Security**: Kiểm tra permissions trong API

### 3. Session Security
- **HttpOnly Cookies**: Bảo vệ session cookies
- **Secure Cookies**: Chỉ HTTPS trong production
- **Session Validation**: Kiểm tra session hợp lệ

## 🚨 Lưu ý quan trọng

1. **Luôn kiểm tra permissions** trước khi cho phép truy cập
2. **Sử dụng RLS policies** để bảo vệ dữ liệu ở database level
3. **Ghi audit logs** cho các hoạt động quan trọng
4. **Test kỹ** với các role khác nhau
5. **Cập nhật permissions** khi thêm tính năng mới

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra `/debug-permissions` để xem thông tin user
2. Kiểm tra console logs để debug
3. Kiểm tra Supabase Dashboard để xem logs
4. Kiểm tra database policies và functions
