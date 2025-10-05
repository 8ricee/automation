import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
// Giả sử bạn có file này để quản lý quyền
import { ROLE_ALLOWED_PAGES } from '@/config/permissions'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          req.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { pathname } = req.nextUrl
  
  // Lấy session, đây là nguồn xác thực duy nhất
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Fallback: Lấy role từ cookies nếu app_metadata không có
  let userRole = user?.app_metadata?.user_role
  if (!userRole && user) {
    const cookieRole = req.cookies.get('user_role')?.value
    if (cookieRole) {
      userRole = cookieRole
    }
  }
  
  // Nếu có lỗi khi lấy user, có thể session không hợp lệ
  if (error) {
    // Clear invalid session
    const isProtectedRoute = !['/login'].includes(pathname)
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(pathname)
  const isProtectedRoute = !isPublicRoute

  // Kịch bản 1: Người dùng đã đăng nhập
  if (user) {
    // Nếu họ cố vào trang login, redirect về profile
    if (isPublicRoute) {
      // Kiểm tra xem có phải là login success redirect không
      const loginSuccess = req.nextUrl.searchParams.get('loginSuccess')
      if (loginSuccess === 'true') {
        // Đây là redirect sau login thành công, chuyển đến profile
        return NextResponse.redirect(new URL('/profile', req.url))
      }
      // Nếu không phải login success, có thể là user đã đăng nhập nhưng cố vào login
      return NextResponse.redirect(new URL('/profile', req.url))
    }

    // Nếu vào trang được bảo vệ, kiểm tra quyền (role)
    if (isProtectedRoute) {
      // Sử dụng userRole đã được xác định ở trên
      const finalUserRole = userRole || 'employee' // 'employee' là vai trò mặc định an toàn
      
      // Lấy danh sách trang được phép truy cập cho role này
      const allowedPages = ROLE_ALLOWED_PAGES[finalUserRole] || []
      
      // Kiểm tra xem trang hiện tại có trong danh sách được phép không
      const hasAccess = allowedPages.includes(pathname) || 
                       allowedPages.some(page => pathname.startsWith(page))

      if (!hasAccess) {
        // Không có quyền -> redirect về dashboard (không hiển thị giao diện Access Denied)
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }
  // Kịch bản 2: Người dùng chưa đăng nhập
  else {
    // Nếu họ cố vào trang được bảo vệ, redirect về login
    if (isProtectedRoute) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}

