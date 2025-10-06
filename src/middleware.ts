// src/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROLE_ALLOWED_PAGES } from '@/config/permissions'

// Định nghĩa các route công khai không cần đăng nhập
const PUBLIC_ROUTES = ['/login']

// Các route luôn cho phép truy cập khi đã đăng nhập, bất kể role
const ALWAYS_ALLOWED_ROUTES = ['/dashboard', '/profile']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: CookieOptions) => {
          req.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Lấy session để xác định trạng thái đăng nhập
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  // Bỏ qua các file static và development files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return res
  }

  // --- Xử lý người dùng đã đăng nhập ---
  if (user) {
    // Nếu đã đăng nhập mà truy cập trang công khai (như /login) -> redirect về dashboard
    if (PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Nếu truy cập trang gốc -> redirect về dashboard
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Lấy role của user từ nhiều nguồn để đảm bảo tính ổn định
    let userRole = user.app_metadata?.user_role || 
                   user.user_metadata?.user_role || 
                   user.user_metadata?.role_name || 
                   'employee'
    
    // Debug logging
    console.log(`[Middleware] User: ${user.email}`)
    console.log(`[Middleware] App metadata:`, user.app_metadata)
    console.log(`[Middleware] User metadata:`, user.user_metadata)
    console.log(`[Middleware] Final role: ${userRole}, Path: ${pathname}`)

    // Luôn cho phép truy cập các trang cơ bản như dashboard, profile
    if (ALWAYS_ALLOWED_ROUTES.includes(pathname)) {
      console.log(`[Middleware] Allowed route: ${pathname}`)
      return res
    }

    // Kiểm tra quyền truy cập dựa trên role cho các trang còn lại
    const allowedPagesForRole = ROLE_ALLOWED_PAGES[userRole as keyof typeof ROLE_ALLOWED_PAGES] || ROLE_ALLOWED_PAGES['employee'] || []
    console.log(`[Middleware] Allowed pages for ${userRole}:`, allowedPagesForRole)

    const hasAccess = Array.isArray(allowedPagesForRole) && allowedPagesForRole.some((page) => pathname.startsWith(page))
    console.log(`[Middleware] Has access to ${pathname}: ${hasAccess}`)

    if (!hasAccess) {
      // Nếu không có quyền, redirect về trang an toàn (profile) với thông báo lỗi
      const redirectUrl = new URL('/profile', req.url)
      redirectUrl.searchParams.set('error', 'access_denied')
      redirectUrl.searchParams.set('requestedPath', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Nếu có quyền, cho phép truy cập
    return res
  }

  // --- Xử lý người dùng chưa đăng nhập ---
  // Nếu chưa đăng nhập và truy cập trang không phải công khai -> redirect về login
  if (!PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Nếu truy cập trang công khai thì cho phép
  return res
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon\\.ico|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$).*)',
  ],
}