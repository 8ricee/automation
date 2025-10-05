import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROLE_ALLOWED_PAGES } from '@/config/permissions'

// Định nghĩa các route công khai không cần đăng nhập
const publicRoutes = ['/login']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  
  // Đảm bảo pathname tồn tại và là string
  if (!pathname || typeof pathname !== 'string') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // 1. Lấy thông tin user từ session (JWT) - Nguồn xác thực duy nhất
  const { data: { user } } = await supabase.auth.getUser()

  // Kiểm tra nếu là route công khai
  const isPublicRoute = publicRoutes.includes(pathname)

  if (user) {
    // --- Người dùng đã đăng nhập ---

    // 2. Lấy role từ nhiều nguồn để đảm bảo tính ổn định
    let userRole = user.app_metadata?.user_role || 
                   user.user_metadata?.user_role || 
                   user.user_metadata?.role_name || 
                   'employee'
    
    // Đảm bảo userRole là string hợp lệ
    if (!userRole || typeof userRole !== 'string') {
      userRole = 'employee' // Fallback an toàn
    }

    if (isPublicRoute) {
      // Nếu đã đăng nhập mà vào trang login -> đá về dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // 3. Kiểm tra quyền truy cập cho các trang được bảo vệ
    // Đặc biệt: trang /profile và /dashboard luôn cho phép truy cập với user đã đăng nhập
    if (pathname === '/profile' || pathname === '/dashboard') {
      return res
    }
    const allowedPages = ROLE_ALLOWED_PAGES[userRole as keyof typeof ROLE_ALLOWED_PAGES] || []
    
    // Kiểm tra nếu allowedPages là array hợp lệ
    if (!Array.isArray(allowedPages)) {
      // Fallback về trang profile nếu có lỗi
      const redirectUrl = new URL('/profile', req.url)
      redirectUrl.searchParams.set('error', 'invalid_role')
      return NextResponse.redirect(redirectUrl)
    }
    
    const hasAccess = allowedPages.some((page: string) => {
      // Đảm bảo page là string hợp lệ
      if (!page || typeof page !== 'string') {
        return false
      }
      return pathname.startsWith(page)
    })

    if (!hasAccess) {
      // Nếu không có quyền, redirect về trang an toàn (ví dụ: profile hoặc dashboard)
      // Thêm thông báo để người dùng biết tại sao họ bị redirect
      const redirectUrl = new URL('/profile', req.url)
      redirectUrl.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(redirectUrl)
    }

  } else {
    // --- Người dùng chưa đăng nhập ---

    if (!isPublicRoute) {
      // Nếu truy cập trang cần bảo vệ mà chưa đăng nhập -> đá về login
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}