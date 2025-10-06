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

// Mapping từ string icon names sang React components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

interface NavDocumentsProps {
  items: SidebarItem[]
}

export function NavDocuments({ items }: NavDocumentsProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tài liệu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const IconComponent = iconMap[item.icon] || FileText
          
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
  )
}
