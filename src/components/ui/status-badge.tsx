"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

// Định nghĩa màu sắc cho các trạng thái
const statusColors = {
  // Trạng thái dự án
  planning: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    label: "Lập kế hoạch"
  },
  in_progress: {
    bg: "bg-blue-100", 
    text: "text-blue-800",
    label: "Đang thực hiện"
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-800", 
    label: "Hoàn thành"
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Đã hủy"
  },
  
  // Trạng thái khách hàng
  active: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Hoạt động"
  },
  inactive: {
    bg: "bg-gray-100", 
    text: "text-gray-800",
    label: "Không hoạt động"
  },
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800", 
    label: "Chờ xử lý"
  },
  
  // Trạng thái đơn hàng
  confirmed: {
    bg: "bg-blue-100",
    text: "text-blue-800", 
    label: "Đã xác nhận"
  },
  processing: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    label: "Đang xử lý"
  },
  shipped: {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    label: "Đã gửi hàng"
  },
  delivered: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Đã giao hàng"
  },
  returned: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    label: "Đã trả hàng"
  },
  
  // Trạng thái báo giá
  draft: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    label: "Bản nháp"
  },
  sent: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    label: "Đã gửi"
  },
  accepted: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Đã chấp nhận"
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Đã từ chối"
  },
  expired: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    label: "Đã hết hạn"
  },
  
  // Trạng thái nhân viên
  terminated: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Đã nghỉ việc"
  },
  
  // Trạng thái sản phẩm
  discontinued: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    label: "Ngừng sản xuất"
  },
  
  // Trạng thái thanh toán
  paid: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Đã thanh toán"
  },
  overdue: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Quá hạn"
  },
  
  // Trạng thái đơn mua hàng
  approved: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Đã duyệt"
  },
  ordered: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    label: "Đã đặt hàng"
  },
  received: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Đã nhận hàng"
  },
  
  // Trạng thái nhiệm vụ
  todo: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    label: "Cần làm"
  },
  
  // Mức độ ưu tiên
  low: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    label: "Thấp"
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    label: "Trung bình"
  },
  high: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    label: "Cao"
  },
  urgent: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Khẩn cấp"
  },
  
  // Vai trò người dùng
  admin: {
    bg: "bg-pink-100",
    text: "text-pink-800",
    label: "Quản trị viên"
  },
  manager: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    label: "Quản lý"
  },
  staff: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    label: "Nhân viên"
  },
  viewer: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    label: "Người xem"
  },
  
  // Vai trò chuyên môn
  engineer: {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    label: "Kỹ sư"
  },
  sales: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Kinh doanh"
  },
  warehouse: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    label: "Kho hàng"
  },
  director: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Giám đốc"
  },
  
  // Vai trò khác
  accountant: {
    bg: "bg-teal-100",
    text: "text-teal-800",
    label: "Kế toán"
  },
  marketing: {
    bg: "bg-pink-100",
    text: "text-pink-800",
    label: "Marketing"
  },
  hr: {
    bg: "bg-cyan-100",
    text: "text-cyan-800",
    label: "Nhân sự"
  },
  developer: {
    bg: "bg-violet-100",
    text: "text-violet-800",
    label: "Lập trình viên"
  },
  designer: {
    bg: "bg-rose-100",
    text: "text-rose-800",
    label: "Thiết kế"
  },
  support: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "Hỗ trợ"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorConfig = statusColors[status as keyof typeof statusColors];
  
  if (!colorConfig) {
    // Fallback cho các trạng thái không được định nghĩa
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        "bg-gray-100 text-gray-800",
        className
      )}>
        {status}
      </span>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      colorConfig.bg,
      colorConfig.text,
      className
    )}>
      {colorConfig.label}
    </span>
  );
}

// Component cho badge tùy chỉnh
interface CustomBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CustomBadge({ 
  children, 
  variant = "default", 
  size = "md",
  className 
}: CustomBadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800", 
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium",
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
}
