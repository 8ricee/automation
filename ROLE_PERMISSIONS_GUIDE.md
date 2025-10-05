# 📋 Hướng dẫn Hệ thống Phân quyền

## 🎯 Tổng quan

Hệ thống phân quyền đã được triển khai hoàn chỉnh với 7 roles chính dựa trên cấu trúc database hiện có:

### 🔐 Các Roles trong Hệ thống

| Role | ID | Mô tả | Quyền hạn chính |
|------|----|----|----------------|
| **admin** | `5f5c7b1b-98c1-44cf-8ea9-f9f9ad65813a` | Quản trị viên | Toàn quyền hệ thống |
| **director** | `3a1f2770-0eaf-4652-aefa-3a57ea55f570` | Giám đốc | Toàn quyền quản lý hệ thống |
| **manager** | `6eba8551-a057-4ef4-b64a-17042180fc83` | Quản lý | Quản lý dự án và nhân viên |
| **sales** | `df52099f-de8d-44e0-9a09-919f0c68d874` | Nhân viên bán hàng | Chăm sóc khách hàng và tạo báo giá |
| **accountant** | `a7dff125-058a-40af-8aec-83516e4bf63e` | Kế toán | Quản lý tài chính và báo cáo |
| **engineer** | `bf392fa0-f4dc-4cb8-9f7c-b7846bddac6f` | Kỹ sư | Thực hiện dự án và nhiệm vụ kỹ thuật |
| **purchasing** | `4c64d7ed-140a-4c39-ae08-46a8be744baa` | Nhân viên mua sắm | Quản lý mua sắm và tồn kho |

## 🛡️ Chi tiết Phân quyền

### 1. **Admin** - Toàn quyền hệ thống
- ✅ **Tất cả permissions** trong hệ thống
- ✅ **Truy cập tất cả trang** bao gồm:
  - Dashboard, Khách hàng, Sản phẩm, Tồn kho
  - Đơn hàng, Nhân viên, Dự án, Nhiệm vụ
  - Báo giá, Mua sắm, Nhà cung cấp
  - Tài chính, Phân tích, Hồ sơ, Cài đặt
  - **Quản lý Roles**, **Audit Logs**, **System Settings**

### 2. **Director** - Toàn quyền quản lý hệ thống
- ✅ **Hầu hết permissions** (trừ system admin)
- ✅ **Truy cập tất cả trang** bao gồm:
  - Tất cả trang như Admin (trừ role-management, system-settings)
  - **Audit Logs** để theo dõi hoạt động

### 3. **Manager** - Quản lý cấp trung
- ✅ **Quyền xem, tạo, chỉnh sửa** (không có delete)
- ✅ **Truy cập các trang chính**:
  - Dashboard, Khách hàng, Sản phẩm, Tồn kho
  - Đơn hàng, Nhân viên, Dự án, Nhiệm vụ
  - Báo giá, Mua sắm, Nhà cung cấp
  - Tài chính, Phân tích, Hồ sơ, Cài đặt

### 4. **Sales** - Nhân viên bán hàng
- ✅ **Quyền xem, tạo, chỉnh sửa** khách hàng và đơn hàng
- ✅ **Truy cập các trang**:
  - Dashboard, Khách hàng, Sản phẩm, Tồn kho
  - Đơn hàng, Báo giá, Phân tích, Hồ sơ

### 5. **Accountant** - Kế toán
- ✅ **Quyền xem và quản lý tài chính**
- ✅ **Truy cập các trang**:
  - Dashboard, Khách hàng, Sản phẩm, Tồn kho
  - Đơn hàng, **Tài chính**, Phân tích, Hồ sơ

### 6. **Engineer** - Kỹ sư
- ✅ **Quyền quản lý dự án và nhiệm vụ**
- ✅ **Truy cập các trang**:
  - Dashboard, Khách hàng, Sản phẩm, Tồn kho
  - **Dự án**, **Nhiệm vụ**, Hồ sơ

### 7. **Purchasing** - Nhân viên mua sắm
- ✅ **Quyền quản lý mua sắm và tồn kho**
- ✅ **Truy cập các trang**:
  - Dashboard, Sản phẩm, **Tồn kho**
  - **Mua sắm**, **Nhà cung cấp**, Hồ sơ

## 🔧 Cấu trúc Kỹ thuật

### Database Schema
```sql
-- Bảng roles
CREATE TABLE public.roles (
  id uuid PRIMARY KEY,
  name varchar(100) UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Bảng permissions
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY,
  name varchar UNIQUE NOT NULL,
  resource varchar NOT NULL,
  action varchar NOT NULL,
  description text,
  created_at timestamp DEFAULT now()
);

-- Bảng role_permissions (many-to-many)
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY,
  role_id uuid REFERENCES roles(id),
  permission_id uuid REFERENCES permissions(id),
  created_at timestamp DEFAULT now(),
  UNIQUE(role_id, permission_id)
);
```

### File Cấu hình
- **`src/config/role-permissions.ts`**: Định nghĩa tất cả permissions và cấu hình roles
- **`src/components/auth/PermissionWrapper.tsx`**: Component kiểm tra quyền truy cập
- **`src/components/providers/AuthProvider.tsx`**: Provider quản lý authentication và permissions

## 🚀 Cách sử dụng

### 1. Kiểm tra quyền trong Component
```tsx
import { PermissionWrapper } from '@/components/auth/PermissionWrapper'

<PermissionWrapper requiredPermissions={['customers:create']}>
  <CreateCustomerButton />
</PermissionWrapper>
```

### 2. Kiểm tra quyền trong Hook
```tsx
import { useRolePermissions } from '@/components/auth/PermissionWrapper'

const { hasPermission, hasRole } = useRolePermissions()

if (hasPermission('customers:create')) {
  // Hiển thị nút tạo khách hàng
}
```

### 3. Kiểm tra quyền truy cập trang
```tsx
import { canAccessPage } from '@/config/role-permissions'

if (canAccessPage(userRole, '/customers')) {
  // Cho phép truy cập trang khách hàng
}
```

## 📊 Permissions System

### Pattern Permissions
Tất cả permissions theo pattern: `resource:action`

**Ví dụ:**
- `customers:view` - Xem danh sách khách hàng
- `customers:create` - Tạo khách hàng mới
- `customers:edit` - Chỉnh sửa khách hàng
- `customers:delete` - Xóa khách hàng
- `customers:export` - Xuất dữ liệu khách hàng

### Resources chính
- `dashboard` - Dashboard
- `customers` - Khách hàng
- `products` - Sản phẩm
- `inventory` - Tồn kho
- `orders` - Đơn hàng
- `employees` - Nhân viên
- `projects` - Dự án
- `tasks` - Nhiệm vụ
- `quotes` - Báo giá
- `purchasing` - Mua sắm
- `suppliers` - Nhà cung cấp
- `financials` - Tài chính
- `analytics` - Phân tích
- `profile` - Hồ sơ cá nhân
- `settings` - Cài đặt
- `system` - Hệ thống

### Actions chính
- `view` - Xem
- `create` - Tạo mới
- `edit` - Chỉnh sửa
- `delete` - Xóa
- `approve` - Phê duyệt
- `export` - Xuất dữ liệu
- `manage` - Quản lý

## 🔄 Cập nhật Permissions

### Thêm Permission mới
1. Thêm vào `SYSTEM_PERMISSIONS` trong `src/config/role-permissions.ts`
2. Cập nhật `DEFAULT_ROLE_PERMISSIONS` cho các roles cần thiết
3. Thêm vào database nếu cần

### Thêm Role mới
1. Thêm vào database table `roles`
2. Cập nhật `DEFAULT_ROLE_PERMISSIONS`, `DEFAULT_ROLE_ALLOWED_PAGES`, `DEFAULT_ROLE_SIDEBAR_ITEMS`
3. Cập nhật `getRoleDescription` function

## 🛠️ Utility Functions

### Kiểm tra quyền
```tsx
// Kiểm tra một permission
hasPermission(userPermissions, 'customers:create')

// Kiểm tra bất kỳ permission nào
hasAnyPermission(userPermissions, ['customers:create', 'customers:edit'])

// Kiểm tra tất cả permissions
hasAllPermissions(userPermissions, ['customers:create', 'customers:edit'])
```

### Lấy thông tin role
```tsx
// Lấy permissions của role
getRolePermissions('manager')

// Lấy các trang được phép truy cập
getRoleAllowedPages('sales')

// Lấy sidebar items
getRoleSidebarItems('engineer')
```

## 📝 Lưu ý quan trọng

1. **Admin luôn có toàn quyền**: Role admin có permission `system:admin` cho phép truy cập mọi thứ
2. **Permissions từ database ưu tiên**: Nếu có permissions từ database, sẽ override permissions mặc định
3. **Fallback permissions**: Nếu role không có trong config, sẽ fallback về permissions mặc định
4. **Security**: Luôn kiểm tra quyền ở cả frontend và backend
5. **Audit**: Tất cả hoạt động được ghi log trong `audit_logs` table

## 🎉 Kết luận

Hệ thống phân quyền đã được triển khai hoàn chỉnh với:
- ✅ 7 roles chính với quyền hạn rõ ràng
- ✅ 50+ permissions chi tiết
- ✅ Kiểm tra quyền ở mọi cấp độ
- ✅ Cấu trúc database chuẩn
- ✅ Utility functions tiện dụng
- ✅ Tài liệu hướng dẫn đầy đủ

Hệ thống sẵn sàng để sử dụng và có thể mở rộng dễ dàng khi cần thiết!
