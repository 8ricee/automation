'use client'

import { useCurrentUser } from '@/hooks/use-permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function PermissionDebugPanel() {
  const { 
    user, 
    loading, 
    isAuthenticated, 
    userRole, 
    userPermissions, 
    isActive,
    isAdmin,
    isDirector,
    isManager,
    isSales,
    isEngineer,
    isPurchasing,
    isAccountant
  } = useCurrentUser()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permission Debug</CardTitle>
          <CardDescription>Đang tải thông tin...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permission Debug</CardTitle>
          <CardDescription>Chưa đăng nhập</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin User</CardTitle>
          <CardDescription>Chi tiết về tài khoản hiện tại</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tên</label>
              <p className="text-sm">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vị trí</label>
              <p className="text-sm">{user?.position || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phòng ban</label>
              <p className="text-sm">{user?.department || 'N/A'}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <Badge variant="outline" className="mt-1">
                {userRole || 'N/A'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
              <Badge variant={isActive ? "default" : "destructive"} className="mt-1">
                {isActive ? 'Hoạt động' : 'Không hoạt động'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Flags</CardTitle>
          <CardDescription>Các cờ role hiện tại</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant={isAdmin ? "default" : "outline"}>Admin</Badge>
            <Badge variant={isDirector ? "default" : "outline"}>Director</Badge>
            <Badge variant={isManager ? "default" : "outline"}>Manager</Badge>
            <Badge variant={isSales ? "default" : "outline"}>Sales</Badge>
            <Badge variant={isEngineer ? "default" : "outline"}>Engineer</Badge>
            <Badge variant={isPurchasing ? "default" : "outline"}>Purchasing</Badge>
            <Badge variant={isAccountant ? "default" : "outline"}>Accountant</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Danh sách quyền hạn ({userPermissions.length} permissions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {userPermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có permissions</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {userPermissions.map((permission) => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission Tests</CardTitle>
          <CardDescription>Kiểm tra các permissions cụ thể</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              'customers:view',
              'customers:create',
              'products:view',
              'products:create',
              'orders:view',
              'orders:create',
              'employees:view',
              'projects:view',
              'tasks:view',
              'quotes:view',
              'purchasing:view',
              'suppliers:view',
              'financials:view',
              'analytics:view',
              'settings:view'
            ].map((permission) => {
              const hasPermission = userPermissions.includes(permission) || userPermissions.includes('*')
              return (
                <div key={permission} className="flex items-center justify-between">
                  <span className="text-sm">{permission}</span>
                  <Badge variant={hasPermission ? "default" : "outline"} className="text-xs">
                    {hasPermission ? '✓' : '✗'}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
