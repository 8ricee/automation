"use client"

import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react"
import { SidebarItem } from "@/config/permissions"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

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

export function NavMain({
  items,
}: {
  items: SidebarItem[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Tạo đơn hàng</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const IconComponent = iconMap[item.icon] || Package
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.href}>
                    <IconComponent className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
