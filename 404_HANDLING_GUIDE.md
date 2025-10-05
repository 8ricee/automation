# 🔄 Xử lý trang 404 - Redirect thông minh

## 🎯 **Yêu cầu:**
- **Đã đăng nhập**: Redirect về `/profile`
- **Chưa đăng nhập**: Redirect về `/login`
- **Mọi trường hợp**: Luôn có fallback UI

## ✅ **Giải pháp:**

### **1. Tạo trang 404 custom (`src/app/not-found.tsx`)**
```typescript
"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NotFound() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Đã đăng nhập -> redirect về profile
        router.push('/profile')
      } else {
        // Chưa đăng nhập -> redirect về login
        router.push('/login')
      }
    }
  }, [user, loading, router])
  
  // Fallback UI nếu không redirect được
  return <NotFoundUI user={user} />
}
```

## 🔄 **Luồng hoạt động:**

### **Khi user truy cập trang không tồn tại:**
1. **Next.js** tự động render `not-found.tsx`
2. **useAuth()** kiểm tra trạng thái đăng nhập
3. **useEffect** tự động redirect:
   - ✅ **Có user** → `/profile`
   - ✅ **Không có user** → `/login`
4. **Fallback UI** hiển thị nếu redirect không hoạt động

## 📊 **Các trường hợp xử lý:**

| Trạng thái | Redirect đến | Lý do |
|------------|--------------|-------|
| **Đã đăng nhập** | `/profile` | Trang cá nhân, an toàn |
| **Chưa đăng nhập** | `/login` | Cần đăng nhập trước |
| **Loading** | Hiển thị spinner | Chờ xác định trạng thái |
| **Lỗi redirect** | Fallback UI | Có nút thủ công |

## 🎨 **UI Features:**

### **1. Loading State**
```typescript
if (loading) {
  return <LoadingSpinner />
}
```

### **2. Fallback UI**
- **Card layout** với icon và thông báo
- **Nút thủ công** để redirect
- **Responsive design**

### **3. Smart Buttons**
```typescript
{user ? (
  <Button onClick={() => router.push('/profile')}>
    <User className="mr-2 h-4 w-4" />
    Về trang cá nhân
  </Button>
) : (
  <Button onClick={() => router.push('/login')}>
    <LogIn className="mr-2 h-4 w-4" />
    Đăng nhập
  </Button>
)}
```

## 🚀 **Lợi ích:**

1. ✅ **User-friendly**: Redirect tự động, không cần thao tác
2. ✅ **Smart**: Phân biệt trạng thái đăng nhập
3. ✅ **Safe**: Luôn có fallback UI
4. ✅ **Consistent**: Logic rõ ràng và dễ hiểu
5. ✅ **Fast**: Redirect ngay lập tức

## 🎯 **Kết quả:**

Bây giờ khi user truy cập trang không tồn tại:
- ✅ **Đã đăng nhập** → Tự động về `/profile`
- ✅ **Chưa đăng nhập** → Tự động về `/login`
- ✅ **Có fallback UI** nếu cần thiết
- ✅ **UX mượt mà** và thông minh

Giải pháp này hoàn toàn đúng với yêu cầu của bạn! 🎉
