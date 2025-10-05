"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { PageGuard } from '@/components/auth/PageGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [showAccessDenied, setShowAccessDenied] = useState(false)

  useEffect(() => {
    const accessDenied = searchParams.get('accessDenied')
    const requestedPath = searchParams.get('requestedPath')
    
    if (accessDenied === 'true' && requestedPath) {
      setShowAccessDenied(true)
      
      // Tự động ẩn thông báo sau 5 giây
      const timer = setTimeout(() => {
        setShowAccessDenied(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <PageGuard 
      requiredPermissions={['dashboard:view']}
      pageName="Dashboard"
    >
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Access Denied Alert */}
        {showAccessDenied && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Không có quyền truy cập
                </h3>
                <p className="text-sm text-red-600 mt-1">
                  Bạn không có quyền truy cập vào trang đã yêu cầu. Vui lòng liên hệ quản trị viên nếu cần thiết.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {user?.role_name || 'Employee'}
            </Badge>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng khách hàng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +20.1% so với tháng trước
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sản phẩm
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">567</div>
              <p className="text-xs text-muted-foreground">
                +12.5% so với tháng trước
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Đơn hàng
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +5.2% so với tháng trước
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Doanh thu
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,345,000₫</div>
              <p className="text-xs text-muted-foreground">
                +8.3% so với tháng trước
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Tổng quan</CardTitle>
              <CardDescription>
                Chào mừng bạn trở lại, {user?.name || 'Nhân viên'}!
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Thông tin cá nhân</p>
                    <p className="text-xs text-muted-foreground">
                      Email: {user?.email} | Vị trí: {user?.position} | Phòng ban: {user?.department}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Hệ thống quản lý nội bộ của Anh Minh Tsc. giúp bạn quản lý công việc hiệu quả.
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Đăng nhập thành công
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vừa xong
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Truy cập dashboard
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vừa xong
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageGuard>
  )
}
