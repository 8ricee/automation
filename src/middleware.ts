import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { canAccessPage } from '@/config/permissions'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  
  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession()
  

  // Authentication implementation for employee-only access
  const pathname = req.nextUrl.pathname
  
  // Routes accessible without authentication
  const publicRoutes = ['/login']
  
  // All other routes require authentication (employee-only)
  const protectedRoutes = ['/dashboard', '/customers', '/products', '/orders', '/inventory', '/employees', '/projects', '/tasks', '/quotes', '/purchasing', '/financials', '/analytics', '/suppliers', '/profile', '/settings', '/role-management', '/audit-logs', '/system-settings']

  // Xử lý 404 - trang không tồn tại
  const isPublicRoute = publicRoutes.includes(pathname)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!isPublicRoute && !isProtectedRoute) {
    // Kiểm tra trạng thái đăng nhập để redirect phù hợp
    const authType = req.cookies.get('auth_type')?.value
    const userRole = req.cookies.get('user_role')?.value
    const sessionToken = req.cookies.get('session_token')?.value
    
    if (authType === 'supabase' && userRole && sessionToken) {
      // Đã đăng nhập -> redirect về profile
      return NextResponse.redirect(new URL('/profile', req.url))
    } else {
      // Chưa đăng nhập -> redirect về login
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Redirect to login if accessing protected route without session
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    // Fallback: Check for auth cookies if session is not available
    const authType = req.cookies.get('auth_type')?.value
    const userRole = req.cookies.get('user_role')?.value
    const sessionToken = req.cookies.get('session_token')?.value
    
    if (authType === 'supabase' && userRole && sessionToken) {
      // Allow access based on cookies - không redirect
      return res
    } else {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Kiểm tra quyền truy cập trang dựa trên role (chỉ khi đã có session)
  if (session && protectedRoutes.some(route => pathname.startsWith(route))) {
    const userRole = req.cookies.get('user_role')?.value || 'employee'
    
    // Kiểm tra quyền truy cập trang
    const hasPageAccess = canAccessPage(userRole, pathname)
    
    if (!hasPageAccess) {
      // Redirect về dashboard nếu không có quyền truy cập
      const redirectUrl = new URL('/dashboard', req.url)
      redirectUrl.searchParams.set('accessDenied', 'true')
      redirectUrl.searchParams.set('requestedPath', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from login page
  if (session && pathname === '/login') {
    // Luôn redirect về dashboard để tránh vòng lặp
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Fallback: Check auth cookies for login page redirect
  if (!session && pathname === '/login') {
    const authType = req.cookies.get('auth_type')?.value
    const userRole = req.cookies.get('user_role')?.value
    const sessionToken = req.cookies.get('session_token')?.value
    
    if (authType === 'supabase' && userRole && sessionToken) {

      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Redirect root path to dashboard for authenticated users, login for others
  if (pathname === '/') {
    if (session) {

      return NextResponse.redirect(new URL('/dashboard', req.url))
    } else {
      // Fallback: Check auth cookies for root path
      const authType = req.cookies.get('auth_type')?.value
      const userRole = req.cookies.get('user_role')?.value
      const sessionToken = req.cookies.get('session_token')?.value
      
      if (authType === 'supabase' && userRole && sessionToken) {

        return NextResponse.redirect(new URL('/dashboard', req.url))
      } else {

        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  }


  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
