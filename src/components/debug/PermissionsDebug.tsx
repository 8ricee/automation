'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { usePermissions } from '@/hooks/use-permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PermissionsDebug() {
  const { user } = useAuth();
  const permissions = usePermissions();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debug Permissions</CardTitle>
          <CardDescription>Chưa đăng nhập</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>ID:</strong> {user.id}</div>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> <Badge variant="outline">{user.role_name}</Badge></div>
          <div><strong>Position:</strong> {user.position}</div>
          <div><strong>Department:</strong> {user.department}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions ({user.permissions?.length || 0})</CardTitle>
          <CardDescription>Danh sách quyền từ database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.permissions?.map((permission, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission Checks</CardTitle>
          <CardDescription>Kiểm tra các quyền cụ thể</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`p-2 rounded ${permissions.canManageCustomers() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Customers:</strong> {permissions.canManageCustomers() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManageProducts() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Products:</strong> {permissions.canManageProducts() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManageOrders() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Orders:</strong> {permissions.canManageOrders() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManageEmployees() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Employees:</strong> {permissions.canManageEmployees() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManageProjects() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Projects:</strong> {permissions.canManageProjects() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManageTasks() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Tasks:</strong> {permissions.canManageTasks() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManageQuotes() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Quotes:</strong> {permissions.canManageQuotes() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManagePurchasing() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Purchasing:</strong> {permissions.canManagePurchasing() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManageSuppliers() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Suppliers:</strong> {permissions.canManageSuppliers() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManageFinancials() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Financials:</strong> {permissions.canManageFinancials() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.isAdmin() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Admin:</strong> {permissions.isAdmin() ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${permissions.canManageRoles() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Manage Roles:</strong> {permissions.canManageRoles() ? '✓' : '✗'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
