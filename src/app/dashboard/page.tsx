"use client"

import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Package, ShoppingCart, TrendingUp } from 'lucide-react'
export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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
  )
}
