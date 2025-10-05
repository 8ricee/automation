"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const ROLES = [
  { value: "admin", label: "Admin - Toàn quyền" },
  { value: "director", label: "Director - Giám đốc" },
  { value: "manager", label: "Manager - Quản lý" },
  { value: "sales", label: "Sales - Bán hàng" },
  { value: "accountant", label: "Accountant - Kế toán" },
  { value: "engineer", label: "Engineer - Kỹ sư" },
  { value: "purchasing", label: "Purchasing - Mua sắm" },
]

export default function SidebarPermissionsDemo() {
  const [selectedRole, setSelectedRole] = useState("admin")

  return (
    <SidebarProvider>
      <AppSidebar userRole={selectedRole} />
      <SidebarInset>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Demo Phân Quyền Sidebar</h1>
            <div className="flex items-center gap-4">
              <label htmlFor="role-select" className="text-sm font-medium">
                Chọn Role:
              </label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin Role hiện tại</CardTitle>
              <CardDescription>
                Sidebar sẽ hiển thị các menu tương ứng với quyền của role được chọn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Role: {selectedRole}</h3>
                  <p className="text-sm text-muted-foreground">
                    {ROLES.find(r => r.value === selectedRole)?.label}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Các menu hiển thị:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Dashboard (luôn có)</li>
                    {selectedRole === "admin" && (
                      <>
                        <li>• Tất cả các menu</li>
                        <li>• Quản lý Roles</li>
                      </>
                    )}
                    {selectedRole === "sales" && (
                      <>
                        <li>• Khách hàng</li>
                        <li>• Sản phẩm</li>
                        <li>• Đơn hàng</li>
                        <li>• Báo giá</li>
                        <li>• Phân tích</li>
                      </>
                    )}
                    {selectedRole === "engineer" && (
                      <>
                        <li>• Dự án</li>
                        <li>• Nhiệm vụ</li>
                        <li>• Sản phẩm</li>
                        <li>• Tồn kho</li>
                      </>
                    )}
                    {selectedRole === "purchasing" && (
                      <>
                        <li>• Mua sắm</li>
                        <li>• Nhà cung cấp</li>
                        <li>• Sản phẩm</li>
                        <li>• Tồn kho</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn sử dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">1. Thay đổi Role</h4>
                  <p className="text-sm text-muted-foreground">
                    Sử dụng dropdown ở trên để thay đổi role và xem sidebar thay đổi tương ứng.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">2. Tích hợp vào ứng dụng</h4>
                  <p className="text-sm text-muted-foreground">
                    Truyền <code className="bg-muted px-1 rounded">userRole</code> và <code className="bg-muted px-1 rounded">userPermissions</code> vào component <code className="bg-muted px-1 rounded">AppSidebar</code>.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">3. Cấu hình quyền</h4>
                  <p className="text-sm text-muted-foreground">
                    Chỉnh sửa file <code className="bg-muted px-1 rounded">src/config/permissions.ts</code> để thay đổi quyền truy cập cho từng role.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
