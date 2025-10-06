'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/providers/AuthProvider'
import { AuthGuard } from '@/components/auth'
import { Bell, Shield, Palette, Database } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <AuthGuard requiredPermissions={['settings:view']} renderMode="fallback">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Cài đặt</h1>
            <p className="text-muted-foreground">
              Quản lý cài đặt tài khoản và hệ thống
            </p>
          </div>

          <div className="grid gap-6">
            {/* Cài đặt thông báo */}
            <AuthGuard requiredPermissions={['settings:view']} renderMode="fallback">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Thông báo
                  </CardTitle>
                  <CardDescription>
                    Quản lý các thông báo và cảnh báo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email thông báo</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo qua email
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thông báo đơn hàng mới</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo khi có đơn hàng mới
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cảnh báo tồn kho</Label>
                      <p className="text-sm text-muted-foreground">
                        Cảnh báo khi sản phẩm sắp hết hàng
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </CardContent>
              </Card>
            </AuthGuard>

            {/* Cài đặt bảo mật */}
            <AuthGuard requiredPermissions={['settings:edit']} renderMode="fallback">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Bảo mật
                  </CardTitle>
                  <CardDescription>
                    Quản lý bảo mật tài khoản
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="Xác nhận mật khẩu mới"
                    />
                  </div>

                  <Button>Đổi mật khẩu</Button>
                </CardContent>
              </Card>
            </AuthGuard>

            {/* Cài đặt giao diện */}
            <AuthGuard requiredPermissions={['settings:view']} renderMode="fallback">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Giao diện
                  </CardTitle>
                  <CardDescription>
                    Tùy chỉnh giao diện ứng dụng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Chế độ tối</Label>
                      <p className="text-sm text-muted-foreground">
                        Sử dụng giao diện tối
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hiệu ứng chuyển tiếp</Label>
                      <p className="text-sm text-muted-foreground">
                        Bật hiệu ứng chuyển tiếp mượt mà
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hiển thị sidebar</Label>
                      <p className="text-sm text-muted-foreground">
                        Luôn hiển thị thanh điều hướng
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </CardContent>
              </Card>
            </AuthGuard>

            {/* Cài đặt hệ thống */}
            <AuthGuard requiredPermissions={['settings:edit']} renderMode="fallback">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Hệ thống
                  </CardTitle>
                  <CardDescription>
                    Cài đặt liên quan đến hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ngôn ngữ</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Tiếng Việt</Button>
                      <Button variant="ghost" size="sm">English</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Múi giờ</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">GMT+7 (Việt Nam)</Button>
                      <Button variant="ghost" size="sm">GMT+0 (UTC)</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lưu trữ dữ liệu</Label>
                      <p className="text-sm text-muted-foreground">
                        Tự động lưu trữ dữ liệu cục bộ
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </CardContent>
              </Card>
            </AuthGuard>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
