"use client"

import Link from "next/link"
import React from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggleSimple } from "@/components/ui/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function SiteHeader() {
  const pathname = usePathname()

  // Map các routes thành tên tiếng Việt
  const routeNames: Record<string, string> = {
    '/': 'Trang chủ',

    '/dashboard': 'Tổng quan',
    '/customers': 'Khách hàng',
    '/products': 'Sản phẩm',
    '/orders': 'Đơn hàng',
    '/inventory': 'Kho hàng',
    '/employees': 'Nhân viên',
    '/projects': 'Dự án',
    '/tasks': 'Nhiệm vụ',
    '/quotes': 'Báo giá',
    '/purchasing': 'Mua hàng',
    '/financials': 'Tài chính',
    '/analytics': 'Phân tích',
    '/profile': 'Hồ sơ',
    '/settings': 'Cài đặt',
  }

  // Lấy breadcrumb items từ pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Tạo breadcrumb items, bắt đầu với trang chủ nếu không phải root
  const breadcrumbItems: Array<{href: string, label: string}> = []
  
  // Tạo breadcrumb items với unique keys
  if (pathname === '/') {
    // Trang chủ
    breadcrumbItems.push({
      href: '/dashboard',
      label: 'Trang chủ'
    })
  } else {
    // Luôn bắt đầu với "Trang chủ"
    breadcrumbItems.push({
      href: '/dashboard',
      label: 'Trang chủ'
    })
    
    // Thêm các segments từ pathname, bỏ qua segment đầu tiên nếu đó là trang chủ
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/')
      
      // Bỏ qua nếu đã có "Trang chủ" hoặc cùng href
      if (href !== '/dashboard' && !breadcrumbItems.some(item => item.href === href)) {
        const label = routeNames[href] || segment.charAt(0).toUpperCase() + segment.slice(1)
        breadcrumbItems.push({ href, label })
      }
    })
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-2 sm:px-4 lg:gap-2 lg:px-6 overflow-hidden">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {/* Breadcrumb với responsive design */}
        {breadcrumbItems.length > 0 && (
          <Breadcrumb className="hidden sm:flex flex-1 min-w-0">
            <BreadcrumbList className="truncate">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={`${item.href}-${index}`}>
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage className="truncate">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="truncate">
                        <Link href={item.href} className="truncate">{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        
        {/* Hiển thị title đơn giản trên mobile */}
        <h1 className="text-base font-medium sm:hidden">
          {breadcrumbItems[breadcrumbItems.length - 1]?.label || 'Dashboard'}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggleSimple />
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link href="/" className="dark:text-foreground">
              AM Tsc.
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}