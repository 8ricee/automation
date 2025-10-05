# 🎯 Tối ưu hóa Logic Phân quyền - Sử dụng Config Centralized

## 🔧 **Vấn đề đã sửa:**

**❌ Logic cũ (không tối ưu):**
```typescript
// Hardcode logic trong PageGuard
const allowedPages = ROLE_ALLOWED_PAGES[user.role_name || 'employee'] || []
const hasPageAccess = allowedPages.includes(window.location.pathname) || 
  allowedPages.some(page => window.location.pathname.startsWith(page))
```

**✅ Logic mới (tối ưu):**
```typescript
// Sử dụng utility function từ config
const hasPageAccess = canAccessPage(user.role_name || 'employee', window.location.pathname)
```

## 🏗️ **Cấu trúc tối ưu:**

### 1. **Config Centralized (`src/config/permissions.ts`)**
```typescript
// Utility function để kiểm tra quyền truy cập trang
export function canAccessPage(userRole: string, pagePath: string): boolean {
  const allowedPages = ROLE_ALLOWED_PAGES[userRole] || []
  return allowedPages.includes(pagePath) || allowedPages.some(page => pagePath.startsWith(page))
}

// Utility function để lấy danh sách trang được phép truy cập
export function getAllowedPages(userRole: string): string[] {
  return ROLE_ALLOWED_PAGES[userRole] || []
}
```

### 2. **Middleware sử dụng utility function**
```typescript
import { canAccessPage } from '@/config/permissions'

// Kiểm tra quyền truy cập trang
const hasPageAccess = canAccessPage(userRole, pathname)
```

### 3. **PageGuard sử dụng utility function**
```typescript
import { canAccessPage, getRoleDescription } from '@/config/permissions'

// Redirect về dashboard nếu không có quyền truy cập trang
useEffect(() => {
  if (user) {
    const hasPageAccess = canAccessPage(user.role_name || 'employee', window.location.pathname)
    
    if (!hasPageAccess) {
      router.push(fallbackPath)
      return
    }
  }
}, [user, router, fallbackPath])
```

## 📊 **Lợi ích của cách tiếp cận mới:**

### **1. DRY Principle (Don't Repeat Yourself)**
- ✅ Logic kiểm tra quyền được định nghĩa **1 lần** trong config
- ✅ Tất cả components sử dụng **cùng 1 function**
- ❌ Không còn duplicate code

### **2. Maintainability (Dễ bảo trì)**
- ✅ Thay đổi logic chỉ cần sửa **1 chỗ** trong config
- ✅ Tất cả components tự động cập nhật
- ❌ Không cần sửa nhiều file

### **3. Consistency (Nhất quán)**
- ✅ Tất cả components sử dụng **cùng logic**
- ✅ Không có sự khác biệt giữa middleware và PageGuard
- ❌ Không có bug do logic khác nhau

### **4. Testability (Dễ test)**
- ✅ Có thể test utility function **độc lập**
- ✅ Mock function dễ dàng
- ❌ Không cần test logic phức tạp trong components

## 🔄 **Luồng hoạt động:**

```mermaid
graph TD
    A[User truy cập trang] --> B[Middleware]
    B --> C{canAccessPage()}
    C -->|false| D[Redirect về /dashboard]
    C -->|true| E[Cho phép truy cập]
    E --> F[PageGuard]
    F --> G{canAccessPage()}
    G -->|false| H[Redirect về fallbackPath]
    G -->|true| I[Kiểm tra permissions cụ thể]
    I --> J[Hiển thị nội dung]
```

## 📝 **Ví dụ sử dụng:**

### **Trong Middleware:**
```typescript
import { canAccessPage } from '@/config/permissions'

const hasPageAccess = canAccessPage(userRole, pathname)
if (!hasPageAccess) {
  return NextResponse.redirect(new URL('/dashboard', req.url))
}
```

### **Trong PageGuard:**
```typescript
import { canAccessPage } from '@/config/permissions'

const hasPageAccess = canAccessPage(user.role_name || 'employee', window.location.pathname)
if (!hasPageAccess) {
  router.push(fallbackPath)
}
```

### **Trong Component khác:**
```typescript
import { canAccessPage, getAllowedPages } from '@/config/permissions'

// Kiểm tra quyền truy cập
const canAccess = canAccessPage(userRole, '/customers')

// Lấy danh sách trang được phép
const allowedPages = getAllowedPages(userRole)
```

## 🎯 **Kết luận:**

Việc tối ưu hóa logic phân quyền bằng cách:

1. ✅ **Centralized Config**: Tất cả logic trong `src/config/permissions.ts`
2. ✅ **Utility Functions**: `canAccessPage()`, `getAllowedPages()`
3. ✅ **DRY Principle**: Không duplicate code
4. ✅ **Consistent Logic**: Cùng logic ở mọi nơi
5. ✅ **Easy Maintenance**: Sửa 1 chỗ, cập nhật toàn bộ

Hệ thống phân quyền giờ đây **sạch sẽ**, **dễ bảo trì** và **nhất quán**! 🚀
