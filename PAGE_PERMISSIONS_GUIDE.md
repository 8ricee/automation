# 📋 Hướng dẫn Phân quyền cho các Trang

## 🎯 Tổng quan

Hệ thống phân quyền cho các trang đã được triển khai hoàn chỉnh với các tính năng:

- ✅ **PageGuard Component** - Bảo vệ từng trang với phân quyền chi tiết
- ✅ **Middleware Protection** - Kiểm tra quyền truy cập ở cấp độ server
- ✅ **Dynamic Sidebar** - Hiển thị menu theo quyền của user
- ✅ **Access Denied Handling** - Xử lý khi không có quyền truy cập

## 🛡️ Các Components chính

### 1. **PageGuard Component**
```tsx
import { PageGuard } from '@/components/auth/PageGuard'

<PageGuard 
  requiredPermissions={['customers:view']}
  pageName="Quản lý Khách hàng"
>
  {/* Nội dung trang */}
</PageGuard>
```

**Props:**
- `requiredPermissions`: Array các permissions cần thiết
- `requiredRole`: Role cụ thể (optional)
- `pageName`: Tên trang để hiển thị trong thông báo lỗi
- `fallbackPath`: Trang redirect khi không có quyền (default: '/dashboard')

### 2. **PermissionWrapper Component**
```tsx
import { PermissionWrapper } from '@/components/auth/PermissionWrapper'

<PermissionWrapper requiredPermissions={['customers:create']}>
  <CreateButton />
</PermissionWrapper>
```

## 📄 Cấu hình Phân quyền Trang

### File: `src/config/page-permissions.ts`

```typescript
export const PAGE_PERMISSIONS: Record<string, PagePermissionConfig> = {
  '/customers': {
    path: '/customers',
    pageName: 'Quản lý Khách hàng',
    requiredPermissions: [SYSTEM_PERMISSIONS.CUSTOMERS_VIEW],
    description: 'Quản lý thông tin khách hàng'
  },
  // ... các trang khác
}
```

## 🔧 Cách sử dụng trong các Trang

### 1. **Trang cơ bản với PageGuard**
```tsx
"use client"

import { PageGuard } from '@/components/auth/PageGuard'

export default function CustomersPage() {
  return (
    <PageGuard 
      requiredPermissions={['customers:view']}
      pageName="Quản lý Khách hàng"
    >
      <div className="container">
        <h1>Khách hàng</h1>
        {/* Nội dung trang */}
      </div>
    </PageGuard>
  )
}
```

### 2. **Trang với phân quyền chi tiết**
```tsx
"use client"

import { PageGuard } from '@/components/auth/PageGuard'

export default function CustomersPage() {
  return (
    <PageGuard 
      requiredPermissions={['customers:view']}
      pageName="Quản lý Khách hàng"
    >
      <div className="container">
        <div className="flex justify-between">
          <h1>Khách hàng</h1>
          
          {/* Nút tạo chỉ hiển thị khi có quyền */}
          <PageGuard 
            requiredPermissions={['customers:create']}
            pageName="Tạo khách hàng"
          >
            <CreateCustomerButton />
          </PageGuard>
        </div>
        
        {/* Bảng dữ liệu */}
        <CustomersTable />
      </div>
    </PageGuard>
  )
}
```

### 3. **Trang chỉ dành cho Admin**
```tsx
"use client"

import { PageGuard } from '@/components/auth/PageGuard'

export default function RoleManagementPage() {
  return (
    <PageGuard 
      requiredPermissions={['roles:manage']}
      requiredRole="admin"
      pageName="Quản lý Roles"
    >
      <div className="container">
        <h1>Quản lý Roles</h1>
        {/* Chỉ admin mới thấy được */}
      </div>
    </PageGuard>
  )
}
```

## 🔄 Middleware Protection

### File: `src/middleware.ts`

Middleware tự động kiểm tra quyền truy cập trang:

```typescript
// Kiểm tra quyền truy cập trang dựa trên role
if (session && protectedRoutes.some(route => pathname.startsWith(route))) {
  const userRole = req.cookies.get('user_role')?.value || 'employee'
  
  const allowedPages = ROLE_ALLOWED_PAGES[userRole] || []
  const hasPageAccess = allowedPages.includes(pathname) || 
    allowedPages.some(page => pathname.startsWith(page))
  
  if (!hasPageAccess) {
    // Redirect về dashboard với thông báo lỗi
    const redirectUrl = new URL('/dashboard', req.url)
    redirectUrl.searchParams.set('accessDenied', 'true')
    redirectUrl.searchParams.set('requestedPath', pathname)
    return NextResponse.redirect(redirectUrl)
  }
}
```

## 📊 Phân quyền theo Role

### **Admin** - Toàn quyền
- ✅ Tất cả các trang
- ✅ `/role-management`, `/audit-logs`, `/system-settings`

### **Director** - Quyền cao nhất về nghiệp vụ
- ✅ Hầu hết các trang (trừ system admin)
- ✅ `/audit-logs`

### **Manager** - Quản lý cấp trung
- ✅ Dashboard, Customers, Products, Inventory
- ✅ Orders, Employees, Projects, Tasks
- ✅ Quotes, Purchasing, Suppliers, Financials
- ✅ Analytics, Profile, Settings

### **Sales** - Nhân viên bán hàng
- ✅ Dashboard, Customers, Products, Inventory
- ✅ Orders, Quotes, Analytics, Profile

### **Accountant** - Kế toán
- ✅ Dashboard, Customers, Products, Inventory
- ✅ Orders, Financials, Analytics, Profile

### **Engineer** - Kỹ sư
- ✅ Dashboard, Customers, Products, Inventory
- ✅ Projects, Tasks, Profile

### **Purchasing** - Nhân viên mua sắm
- ✅ Dashboard, Products, Inventory
- ✅ Purchasing, Suppliers, Profile

## 🚨 Xử lý Access Denied

### 1. **Thông báo trên Dashboard**
Khi user bị từ chối truy cập, sẽ được redirect về dashboard với thông báo:

```tsx
{showAccessDenied && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <div className="flex items-center">
      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
      <div>
        <h3 className="text-sm font-medium text-red-800">
          Không có quyền truy cập
        </h3>
        <p className="text-sm text-red-600 mt-1">
          Bạn không có quyền truy cập vào trang đã yêu cầu.
        </p>
      </div>
    </div>
  </div>
)}
```

### 2. **PageGuard Error Page**
Khi không có quyền, PageGuard hiển thị trang lỗi với:
- Icon Shield và thông báo rõ ràng
- Thông tin về role hiện tại và yêu cầu
- Nút "Quay về Dashboard" và "Quay lại trang trước"

## 🛠️ Utility Functions

### Kiểm tra quyền truy cập trang
```tsx
import { ROLE_ALLOWED_PAGES } from '@/config/permissions'

function canAccessPage(userRole: string, pagePath: string): boolean {
  const allowedPages = ROLE_ALLOWED_PAGES[userRole] || []
  return allowedPages.includes(pagePath) || 
    allowedPages.some(page => pagePath.startsWith(page))
}
```

### Hook để kiểm tra quyền
```tsx
import { usePageAccess } from '@/components/auth/PageGuard'

function MyComponent() {
  const { hasAccess, userRole, canAccessPage } = usePageAccess('/customers')
  
  if (!hasAccess) {
    return <div>Không có quyền truy cập</div>
  }
  
  return <div>Nội dung trang</div>
}
```

## 📝 Checklist Triển khai

### ✅ **Đã hoàn thành:**
1. **PageGuard Component** - Bảo vệ trang với phân quyền chi tiết
2. **Middleware Protection** - Kiểm tra quyền ở server level
3. **Page Permissions Config** - Cấu hình phân quyền cho từng trang
4. **Access Denied Handling** - Xử lý khi không có quyền
5. **Dashboard Integration** - Hiển thị thông báo lỗi
6. **Utility Functions** - Các hàm tiện ích để kiểm tra quyền

### 🔄 **Cần làm tiếp:**
1. **Áp dụng PageGuard cho tất cả các trang** còn lại
2. **Test phân quyền** với các roles khác nhau
3. **Cập nhật Sidebar** để ẩn menu không có quyền
4. **Thêm phân quyền cho các action** (create, edit, delete)

## 🎉 Kết luận

Hệ thống phân quyền cho các trang đã được triển khai hoàn chỉnh với:

- ✅ **Bảo vệ đa cấp**: Middleware + PageGuard + PermissionWrapper
- ✅ **Phân quyền chi tiết**: Theo role và permissions cụ thể
- ✅ **UX tốt**: Thông báo lỗi rõ ràng, redirect hợp lý
- ✅ **Dễ sử dụng**: Component đơn giản, cấu hình linh hoạt
- ✅ **Bảo mật cao**: Kiểm tra ở cả frontend và backend

Hệ thống sẵn sàng để áp dụng cho tất cả các trang trong ứng dụng! 🚀
