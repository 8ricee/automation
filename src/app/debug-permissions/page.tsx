"use client";

import { PermissionsDebug } from "@/components/debug/PermissionsDebug";
import { StatusBadge, CustomBadge } from "@/components/ui/status-badge";

export default function DebugPermissions() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Debug Permissions</h1>
      <PermissionsDebug />
      
      {/* Trạng thái dự án */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trạng thái dự án</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="planning" />
          <StatusBadge status="in_progress" />
          <StatusBadge status="completed" />
          <StatusBadge status="cancelled" />
        </div>
      </section>

      {/* Trạng thái khách hàng */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trạng thái khách hàng</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="active" />
          <StatusBadge status="inactive" />
          <StatusBadge status="pending" />
        </div>
      </section>

      {/* Trạng thái đơn hàng */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trạng thái đơn hàng</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="pending" />
          <StatusBadge status="confirmed" />
          <StatusBadge status="processing" />
          <StatusBadge status="shipped" />
          <StatusBadge status="delivered" />
          <StatusBadge status="cancelled" />
          <StatusBadge status="returned" />
        </div>
      </section>

      {/* Trạng thái báo giá */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trạng thái báo giá</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="draft" />
          <StatusBadge status="sent" />
          <StatusBadge status="accepted" />
          <StatusBadge status="rejected" />
          <StatusBadge status="expired" />
        </div>
      </section>

      {/* Trạng thái nhân viên */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trạng thái nhân viên</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="active" />
          <StatusBadge status="inactive" />
          <StatusBadge status="terminated" />
        </div>
      </section>

      {/* Vai trò người dùng */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vai trò người dùng</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="admin" />
          <StatusBadge status="manager" />
          <StatusBadge status="staff" />
          <StatusBadge status="viewer" />
        </div>
      </section>

      {/* Vai trò chuyên môn */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vai trò chuyên môn</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="engineer" />
          <StatusBadge status="sales" />
          <StatusBadge status="warehouse" />
          <StatusBadge status="director" />
        </div>
      </section>

      {/* Vai trò khác */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vai trò khác</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="accountant" />
          <StatusBadge status="marketing" />
          <StatusBadge status="hr" />
          <StatusBadge status="developer" />
          <StatusBadge status="designer" />
          <StatusBadge status="support" />
        </div>
      </section>

      {/* Mức độ ưu tiên */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mức độ ưu tiên</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="low" />
          <StatusBadge status="medium" />
          <StatusBadge status="high" />
          <StatusBadge status="urgent" />
        </div>
      </section>

      {/* Trạng thái thanh toán */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trạng thái thanh toán</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="pending" />
          <StatusBadge status="paid" />
          <StatusBadge status="overdue" />
        </div>
      </section>

      {/* Trạng thái đơn mua hàng */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trạng thái đơn mua hàng</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="pending" />
          <StatusBadge status="approved" />
          <StatusBadge status="ordered" />
          <StatusBadge status="received" />
          <StatusBadge status="cancelled" />
        </div>
      </section>

      {/* Custom Badge */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Custom Badge</h2>
        <div className="flex flex-wrap gap-2">
          <CustomBadge variant="default">Mặc định</CustomBadge>
          <CustomBadge variant="success">Thành công</CustomBadge>
          <CustomBadge variant="warning">Cảnh báo</CustomBadge>
          <CustomBadge variant="error">Lỗi</CustomBadge>
          <CustomBadge variant="info">Thông tin</CustomBadge>
        </div>
      </section>

      {/* Kích thước khác nhau */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Kích thước khác nhau</h2>
        <div className="flex flex-wrap items-center gap-2">
          <CustomBadge size="sm">Nhỏ</CustomBadge>
          <CustomBadge size="md">Trung bình</CustomBadge>
          <CustomBadge size="lg">Lớn</CustomBadge>
        </div>
      </section>
    </div>
  );    
}
