"use client"

import Link from "next/link"
import { SidebarItem } from "@/config/permissions"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Import icons từ lucide-react để mapping với string icon names
import {
  LayoutDashboard,
  Users,
  Package,
  Package2,
  ShoppingCart,
  UserCheck,
  FolderOpen,
  CheckSquare,
  FileText,
  ShoppingBag,
  Truck,
  DollarSign,
  BarChart3,
  User,
  Settings,
  Shield,
} from "lucide-react"

// Mapping icon names sang components
const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  Package,
  Package2,
  ShoppingCart,
  UserCheck,
  FolderOpen,
  CheckSquare,
  FileText,
  ShoppingBag,
  Truck,
  DollarSign,
  BarChart3,
  User,
  Settings,
  Shield,
}

type NavDocumentsProps = {
  data: {
    title: string;
    items: SidebarItem[];
  };
};

export function NavDocuments({ data }: NavDocumentsProps) {
  // Chỉ hiển thị section nếu có items
  if (!data.items || data.items.length === 0) {
    return null
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{data.title}</SidebarGroupLabel>
      <SidebarMenu>
        {data.items.map((item) => {
          const IconComponent = iconMap[item.icon] || Package
          
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href}>
                  <IconComponent className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
