"use client"

import { useMemo } from 'react'
import { ROLE_SIDEBAR_ITEMS, ROLE_ALLOWED_PAGES, SidebarItem } from '@/config/permissions'

interface UseSidebarPermissionsProps {
  userRole: string
  userPermissions?: string[]
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

export function useSidebarPermissions({ userRole, userPermissions = [] }: UseSidebarPermissionsProps) {
  const sidebarData = useMemo(() => {
    // Lấy sidebar items từ permissions.ts dựa trên role
    const roleSidebarItems = ROLE_SIDEBAR_ITEMS[userRole] || []
    
    // Nhóm các items theo chức năng (tương tự như path.ts)
    const sections: SidebarSection[] = [
      {
        title: "Bán hàng",
        items: roleSidebarItems.filter(item => 
          ['/customers', '/quotes', '/orders'].includes(item.href)
        )
      },
      {
        title: "Quản lý",
        items: roleSidebarItems.filter(item => 
          ['/projects', '/tasks', '/employees'].includes(item.href)
        )
      },
      {
        title: "Vật tư",
        items: roleSidebarItems.filter(item => 
          ['/products', '/inventory', '/purchasing', '/suppliers'].includes(item.href)
        )
      },
      {
        title: "Báo cáo",
        items: roleSidebarItems.filter(item => 
          ['/analytics', '/financials'].includes(item.href)
        )
      },
      {
        title: "Hệ thống",
        items: roleSidebarItems.filter(item => 
          ['/profile', '/settings', '/role-management'].includes(item.href)
        )
      }
    ]

    // Lọc bỏ các section trống
    return sections.filter(section => section.items.length > 0)
  }, [userRole])

  const mainNavItems = useMemo(() => {
    // Dashboard luôn có trong main nav
    const dashboardItem = ROLE_SIDEBAR_ITEMS[userRole]?.find(item => item.href === '/dashboard')
    return dashboardItem ? [dashboardItem] : []
  }, [userRole])

  const canAccessPage = (pagePath: string): boolean => {
    const allowedPages = ROLE_ALLOWED_PAGES[userRole] || []
    return allowedPages.includes(pagePath) || allowedPages.some(page => pagePath.startsWith(page))
  }

  return {
    sidebarData,
    mainNavItems,
    canAccessPage,
    userRole
  }
}
