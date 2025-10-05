"use client"

import { usePathname } from 'next/navigation'
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar"
import { SiteHeader } from "@/components/layout/header/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Routes that should use auth layout (no sidebar/header)
  const authRoutes = ['/login', '/signup', '/unauthorized']
  
  // If current route is an auth route, render children directly
  if (authRoutes.includes(pathname)) {
    return <>{children}</>
  }
  
  // Otherwise render the main layout with sidebar and header
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-w-0 overflow-x-auto">
        <SiteHeader />
        <main className="min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
