// src/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Định nghĩa các route công khai không cần đăng nhập
const PUBLIC_ROUTES = ['/login']

// Các route luôn cho phép truy cập khi đã đăng nhập, bất kể role
const ALWAYS_ALLOWED_ROUTES = ['/dashboard', '/profile', '/debug-permissions']

// Mapping từ route path sang permission cần thiết
const ROUTE_PERMISSIONS: Record<string, string> = {
  '/customers': 'customers:view',
  '/products': 'products:view',
  '/inventory': 'inventory:view',
  '/orders': 'orders:view',
  '/employees': 'employees:view',
  '/projects': 'projects:view',
  '/tasks': 'tasks:view',
  '/quotes': 'quotes:view',
  '/purchasing': 'purchasing:view',
  '/suppliers': 'suppliers:view',
  '/financials': 'financials:view',
  '/analytics': 'analytics:view',
  '/settings': 'settings:view'
}

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

  const { pathname } = req.nextUrl

  // Lấy session để xác định trạng thái đăng nhập
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // Nếu có lỗi session (JWT expired, invalid, etc.), coi như chưa đăng nhập
  if (userError && (userError.message?.includes('JWT') || userError.message?.includes('expired') || userError.message?.includes('invalid'))) {
    console.log('Session error in middleware:', userError.message)
    // Redirect về login nếu không phải trang công khai
    if (!PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return res
  }

  // Helper function để kiểm tra permission từ database
  const checkUserPermission = async (permission: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_permission', {
        permission_to_check: permission
      })
      
      if (error) {
        console.error('Permission check error:', error)
        return false
      }
      
      return data === true
    } catch (error) {
      console.error('Permission check exception:', error)
      return false
    }
  }

  // Bỏ qua các file static và development files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/src/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('Postgrest') ||
    pathname.includes('Supabase') ||
    pathname.includes('Realtime') ||
    pathname.includes('Storage') ||
    pathname.includes('Functions') ||
    pathname.includes('websocket') ||
    pathname.includes('serializer') ||
    pathname.includes('timer') ||
    pathname.includes('transformers') ||
    pathname.includes('push') ||
    pathname.includes('errors') ||
    pathname.includes('helpers') ||
    pathname.includes('fetch') ||
    pathname.includes('StreamDownload') ||
    pathname.includes('BlobDownload') ||
    pathname.includes('StorageFile') ||
    pathname.includes('StorageBucket') ||
    pathname.includes('SupabaseAuth') ||
    pathname.includes('version') ||
    pathname.includes('constants') ||
    pathname.includes('chunker') ||
    pathname.includes('base64url') ||
    pathname.includes('cookies') ||
    pathname.includes('createBrowser') ||
    pathname.includes('createServer') ||
    pathname.includes('helper') ||
    pathname.includes('types') ||
    pathname.includes('index')
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

    // Debug logging - chỉ log khi cần thiết
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] User: ${user.email}, Path: ${pathname}`)
    }

    // Luôn cho phép truy cập các trang cơ bản như dashboard, profile
    if (ALWAYS_ALLOWED_ROUTES.includes(pathname)) {
      return res
    }

    // Kiểm tra quyền truy cập dựa trên database permissions
    const requiredPermission = ROUTE_PERMISSIONS[pathname]
    
    if (requiredPermission) {
      const hasPermission = await checkUserPermission(requiredPermission)
      
      if (!hasPermission) {
        // Nếu không có quyền, redirect về trang an toàn (profile) với thông báo lỗi
        const redirectUrl = new URL('/profile', req.url)
        redirectUrl.searchParams.set('error', 'access_denied')
        redirectUrl.searchParams.set('requestedPath', pathname)
        redirectUrl.searchParams.set('requiredPermission', requiredPermission)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Nếu có quyền hoặc không cần kiểm tra quyền, cho phép truy cập
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
