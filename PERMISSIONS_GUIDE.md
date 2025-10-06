# Hệ thống Quyền (Permissions System)

## Tổng quan

Hệ thống quyền đã được triển khai hoàn chỉnh với các tính năng:

- ✅ **Phân quyền chi tiết** cho từng role
- ✅ **Kiểm tra quyền** trong UI components
- ✅ **Bảo vệ** các chức năng thêm/sửa/xóa
- ✅ **Database permissions** được cập nhật

## Các Roles và Quyền

### 1. Admin (`admin`)
- **Quyền**: Toàn quyền hệ thống (`["*"]`)
- **Có thể**: Tất cả các chức năng

### 2. Director (`director`)
- **Quyền**: Quản lý toàn bộ hệ thống (trừ một số chức năng admin)
- **Có thể**: 
  - Xem, thêm, sửa, xóa tất cả modules
  - Phê duyệt orders, quotes, purchasing, financials
  - Xuất báo cáo và phân tích
  - Quản lý settings

### 3. Manager (`manager`)
- **Quyền**: Quản lý dự án và nhân viên
- **Có thể**:
  - Quản lý customers, products, inventory
  - Quản lý employees, projects, tasks
  - Phê duyệt orders, quotes, purchasing
  - Xem financials và analytics

### 4. Sales (`sales`)
- **Quyền**: Chăm sóc khách hàng và tạo báo giá
- **Có thể**:
  - Xem và quản lý customers
  - Xem products và inventory
  - Tạo và quản lý orders, quotes
  - Xem analytics

### 5. Accountant (`accountant`)
- **Quyền**: Quản lý tài chính và báo cáo
- **Có thể**:
  - Xem customers, products, inventory
  - Phê duyệt orders
  - Quản lý financials (thêm, sửa, phê duyệt, xuất)
  - Xem và xuất analytics

### 6. Engineer (`engineer`)
- **Quyền**: Thực hiện dự án và nhiệm vụ kỹ thuật
- **Có thể**:
  - Xem customers, products, inventory
  - Quản lý projects và tasks
  - Hoàn thành tasks

### 7. Purchasing (`purchasing`)
- **Quyền**: Quản lý mua sắm và tồn kho
- **Có thể**:
  - Quản lý products và inventory
  - Quản lý purchasing orders
  - Quản lý suppliers

## Cách sử dụng trong Code

### 1. Hook usePermissions

```typescript
import { usePermissions } from '@/hooks/use-permissions';

function MyComponent() {
  const { canCreate, canEdit, canDelete, canManageCustomers } = usePermissions();
  
  return (
    <div>
      {canManageCustomers() && (
        <button>Tạo khách hàng mới</button>
      )}
    </div>
  );
}
```

### 2. Permission Guards

```typescript
import { CreatePermissionGuard, EditPermissionGuard } from '@/hooks/use-permissions';

function MyComponent() {
  return (
    <CreatePermissionGuard resource="customers">
      <button>Tạo khách hàng</button>
    </CreatePermissionGuard>
  );
}
```

### 3. Trong Table Components

```typescript
// CreateRecordButton
<CreateRecordButton
  title="Thêm khách hàng"
  resource="customers" // Quan trọng: phải truyền resource
  fields={[...]}
/>

// GenericRowActions
<GenericRowActions
  row={row}
  onEdit={onEdit}
  onDelete={onDelete}
  resource="customers" // Quan trọng: phải truyền resource
/>
```

### 4. Trong Form Components

```typescript
import { usePermissions } from '@/hooks/use-permissions';

function CustomerForm() {
  const { canEditCustomers } = usePermissions();
  
  return (
    <Button 
      disabled={!canEditCustomers()}
      title={!canEditCustomers() ? 'Bạn không có quyền chỉnh sửa' : ''}
    >
      Cập nhật
    </Button>
  );
}
```

## Database Schema

### Bảng `roles`
```sql
CREATE TABLE roles (
  id uuid PRIMARY KEY,
  name varchar UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}', -- Legacy field, không sử dụng nữa
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### Bảng `permissions`
```sql
CREATE TABLE permissions (
  id uuid PRIMARY KEY,
  name varchar NOT NULL UNIQUE,
  resource varchar NOT NULL,
  action varchar NOT NULL,
  description text,
  created_at timestamp DEFAULT now()
);
```

### Bảng `role_permissions`
```sql
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY,
  role_id uuid REFERENCES roles(id),
  permission_id uuid REFERENCES permissions(id),
  created_at timestamp DEFAULT now()
);
```

### Bảng `employees`
```sql
CREATE TABLE employees (
  id uuid PRIMARY KEY,
  name varchar NOT NULL,
  email varchar UNIQUE,
  role_id uuid REFERENCES roles(id),
  -- ... other fields
);
```

### Cách hoạt động:
1. **Permissions** được định nghĩa trong bảng `permissions` với format `resource:action`
2. **Role-Permission mapping** được lưu trong bảng `role_permissions`
3. **AuthProvider** load permissions từ `role_permissions` thông qua JOIN queries
4. **UI components** sử dụng permissions để kiểm tra quyền truy cập

## Cập nhật Database

Database permissions đã được thiết lập sẵn với:
- ✅ **Bảng `permissions`**: Chứa tất cả permissions có thể có
- ✅ **Bảng `role_permissions`**: Mapping giữa roles và permissions
- ✅ **AuthProvider**: Load permissions từ `role_permissions` table

### Kiểm tra Database:
```bash
# Kiểm tra permissions của một role
SELECT r.name as role_name, p.name as permission_name, p.resource, p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin'
ORDER BY p.resource, p.action;
```

### Test Script:
```bash
# Chạy test script để kiểm tra permissions
node scripts/test-permissions.js
```

## Kiểm tra Permissions

### 1. Kiểm tra trong Browser Console

```javascript
// Mở Developer Tools và chạy:
const { user } = window.__NEXT_DATA__.props.pageProps;
console.log('User permissions:', user?.permissions);
console.log('User role:', user?.role_name);
```

### 3. Debug Page
Truy cập `/debug-permissions` để xem thông tin chi tiết về permissions của user hiện tại.

### 4. Kiểm tra trong Component
```typescript
import { useAuth } from '@/components/providers/AuthProvider';

function DebugComponent() {
  const { user } = useAuth();
  
  console.log('User:', user);
  console.log('Permissions:', user?.permissions);
  console.log('Role:', user?.role_name);
  
  return <div>Check console for debug info</div>;
}
```

## Troubleshooting

### 1. Permissions không hoạt động
- Kiểm tra user có được load permissions từ database không
- Kiểm tra role_id trong bảng employees
- Kiểm tra permissions trong bảng roles

### 2. UI không ẩn/hiện đúng
- Đảm bảo đã truyền `resource` parameter cho components
- Kiểm tra permission names có đúng format không (e.g., `customers:create`)

### 3. Database permissions không cập nhật
- Chạy lại script `supabase/role_permissions.sql`
- Kiểm tra kết nối database
- Restart ứng dụng sau khi cập nhật database

## Best Practices

1. **Luôn kiểm tra permissions** trước khi hiển thị UI
2. **Sử dụng Permission Guards** cho các components phức tạp
3. **Truyền resource parameter** cho table components
4. **Test permissions** với các roles khác nhau
5. **Cập nhật permissions** khi thêm tính năng mới

## Tương lai

- [ ] Thêm audit logs cho permission changes
- [ ] Dynamic permissions từ admin panel
- [ ] Permission inheritance
- [ ] Time-based permissions
- [ ] Resource-specific permissions
