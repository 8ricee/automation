import {
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconHelp,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

// Removed unused interfaces: NavItem, DocumentItem

export const path = {
  user: {
    name: "AM Tsc.",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Bảng điều khiển",
      url: "/dashboard",
      icon: IconDashboard,
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Hỗ trợ",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Tìm kiếm",
      url: "/",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      title: "Bán hàng",
      items: [
        {
          name: "Khách hàng",
          url: "/customers",
          icon: IconDatabase,
        },
        {
          name: "Báo giá",
          url: "/quotes",
          icon: IconReport,
        },
        {
          name: "Đơn hàng",
          url: "/orders",
          icon: IconFileWord,
        },
      ],
    },
    {
      title: "Quản lý",
      items: [
        {
        name: "Dự án",
        url: "/projects",
          icon: IconDatabase,
        },
        {
        name: "Công việc",
        url: "/tasks",
          icon: IconReport,
        },
      ],
    },
    {
      title: "Vật tư",
      items: [
        {
          name: "Sản phẩm",
          url: "/products",
          icon: IconDatabase,
        },
        {
          name: "Kho hàng",
          url: "/inventory",
          icon: IconReport,
        },
        {
          name: "Mua hàng",
          url: "/purchasing",
          icon: IconFileWord,
        },
      ],
    },
    {
      title: "Báo cáo",
      items: [
        {
          name: "Phân tích",
          url: "/analytics",
          icon: IconDatabase,
        },
        {
          name: "Tài chính",
          url: "/financials",
          icon: IconReport,
        },
        {
          name: "Nhân viên",
          url: "/employees",
          icon: IconFileWord,
        },
      ],
    },
  ],
};
