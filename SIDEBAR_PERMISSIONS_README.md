# Hệ thống Phân quyền Sidebar

Hệ thống này tích hợp phân quyền từ `permissions.ts` với cấu trúc đường dẫn từ `path.ts` để hiển thị sidebar động theo quyền truy cập của người dùng.

## Cấu trúc Files

### 1. `src/hooks/use-sidebar-permissions.ts`
Hook chính để quản lý quyền truy cập sidebar:
- Nhận `userRole` và `userPermissions`
- Trả về `sidebarData` được nhóm theo chức năng
- Trả về `mainNavItems` (Dashboard)
- Cung cấp function `canAccessPage` để kiểm tra quyền truy cập

### 2. `src/components/layout/sidebar/app-sidebar.tsx`
Component sidebar chính:
- Sử dụng hook `useSidebarPermissions`
- Nhận props `userRole` và `userPermissions`
- Render sidebar động dựa trên quyền

### 3. `src/components/layout/sidebar/nav-documents.tsx`
Component hiển thị các nhóm menu:
- Nhận data từ hook permissions
- Mapping icon names sang Lucide React components
- Chỉ hiển thị section nếu có items

### 4. `src/components/layout/sidebar/nav-main.tsx`
Component hiển thị menu chính (Dashboard):
- Sử dụng SidebarItem interface từ permissions.ts
- Mapping icons tương tự nav-documents

## Cách sử dụng

### 1. Trong Layout chính
```tsx
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar"

export default function Layout({ children }) {
  const userRole = "admin" // Lấy từ auth context
  const userPermissions = ["dashboard:view", "customers:view"] // Lấy từ auth context

  return (
    <SidebarProvider>
      <AppSidebar userRole={userRole} userPermissions={userPermissions} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### 2. Kiểm tra quyền truy cập trang
```tsx
import { useSidebarPermissions } from "@/hooks/use-sidebar-permissions"

function MyComponent() {
  const { canAccessPage } = useSidebarPermissions({
    userRole: "sales",
    userPermissions: []
  })

  if (!canAccessPage("/customers")) {
    return <div>Không có quyền truy cập</div>
  }

  return <div>Nội dung trang</div>
}
```

## Cấu hình Quyền

### 1. Thêm Role mới
Trong `src/config/permissions.ts`:
```typescript
export const ROLE_SIDEBAR_ITEMS: Record<string, SidebarItem[]> = {
  // ... existing roles
  newRole: [
    { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Menu mới', href: '/new-menu', icon: 'Package' },
  ]
}
```

### 2. Thêm Permission mới
```typescript
export const SYSTEM_PERMISSIONS = {
  // ... existing permissions
  NEW_FEATURE_VIEW: 'new-feature:view',
  NEW_FEATURE_CREATE: 'new-feature:create',
} as const
```

### 3. Thêm Icon mới
Trong các component sidebar, thêm icon vào `iconMap`:
```typescript
import { NewIcon } from "lucide-react"

const iconMap: Record<string, any> = {
  // ... existing icons
  NewIcon,
}
```

## Demo

Truy cập `/sidebar-demo` để xem demo hệ thống phân quyền với các role khác nhau.

## Các Role có sẵn

- **admin**: Toàn quyền hệ thống
- **director**: Giám đốc - Toàn quyền hệ thống  
- **manager**: Quản lý - Quản lý dự án và nhân viên
- **sales**: Nhân viên bán hàng - Chăm sóc khách hàng và tạo báo giá
- **accountant**: Kế toán - Quản lý tài chính và báo cáo
- **engineer**: Kỹ sư - Thực hiện dự án và nhiệm vụ kỹ thuật
- **purchasing**: Nhân viên mua sắm - Quản lý mua sắm và tồn kho

## Lưu ý

- Sidebar sẽ tự động ẩn các section không có items
- Dashboard luôn hiển thị trong main nav
- Icons được mapping từ string names sang Lucide React components
- Hệ thống tương thích với cả Tabler Icons và Lucide React
