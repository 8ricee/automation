'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/AuthProvider'
import { User, Mail, Building, Shield, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
            <p className="text-muted-foreground">
              Thông tin chi tiết về tài khoản của bạn
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Thông tin cơ bản */}
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin cơ bản
                  </CardTitle>
                  <CardDescription>
                    Thông tin cá nhân và liên hệ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phòng ban</p>
                      <p className="text-sm text-muted-foreground">{user.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Chức vụ</p>
                      <p className="text-sm text-muted-foreground">{user.position}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            {/* Thông tin vai trò */}
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Vai trò và quyền hạn
                  </CardTitle>
                  <CardDescription>
                    Vai trò hiện tại và các quyền hạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Vai trò</p>
                    <Badge variant="secondary" className="text-sm">
                      {user.role_name}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Quyền hạn</p>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions && user.permissions.length > 0 ? (
                        user.permissions.slice(0, 6).map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission.replace('.', ' ')}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Không có quyền hạn</p>
                      )}
                      {user.permissions && user.permissions.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.permissions.length - 6} khác
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Trạng thái</p>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>

          {/* Thông tin bổ sung */}
          <Card>
              <CardHeader>
                <CardTitle>Thông tin hệ thống</CardTitle>
                <CardDescription>
                  Thông tin về tài khoản trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium">ID người dùng</p>
                    <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">ID vai trò</p>
                    <p className="text-sm text-muted-foreground font-mono">{user.role_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tên đầy đủ</p>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
  )
}
