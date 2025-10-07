"use client"

import { usePathname } from 'next/navigation'
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar"
import { SiteHeader } from "@/components/layout/header/site-header"
import { useAuth } from "@/components/providers/AuthProvider"
import { PermissionErrorAlert } from "@/components/ui/permission-error-alert"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  
  // Routes that should use auth layout (no sidebar/header)
  const authRoutes = ['/login']
  
  // If current route is an auth route, render children directly
  if (authRoutes.includes(pathname)) {
    return <>{children}</>
  }
  
  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }
  
  // If not authenticated, redirect will be handled by middleware
  if (!user) {
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
          <PermissionErrorAlert />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
