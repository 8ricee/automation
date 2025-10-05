import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  // Debug cookies
  console.log('Middleware - Cookies:', req.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`))
  
  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Debug logging
  console.log('Middleware - Path:', req.nextUrl.pathname)
  console.log('Middleware - Session exists:', !!session)
  console.log('Middleware - Session user:', session?.user?.email)
  console.log('Middleware - Session error:', error)

  // Authentication implementation for employee-only access
  const pathname = req.nextUrl.pathname
  
  // Routes accessible without authentication
  const publicRoutes = ['/login']
  
  // All other routes require authentication (employee-only)
  const protectedRoutes = ['/dashboard', '/customers', '/products', '/orders', '/inventory', '/employees', '/projects', '/tasks', '/quotes', '/purchasing', '/financials', '/analytics', '/suppliers', '/profile', '/settings']

  // Redirect to login if accessing protected route without session
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    // Fallback: Check for auth cookies if session is not available
    const authType = req.cookies.get('auth_type')?.value
    const userRole = req.cookies.get('user_role')?.value
    const sessionToken = req.cookies.get('session_token')?.value
    
    console.log('Middleware - Checking fallback auth:', { authType, userRole, hasSessionToken: !!sessionToken })
    
    if (authType === 'supabase' && userRole && sessionToken) {
      console.log('Middleware - Found auth cookies, allowing access')
      // Allow access based on cookies - không redirect
      return res
    } else {
      console.log('Middleware - No session or auth cookies found, redirecting to login')
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from login page
  if (session && pathname === '/login') {
    console.log('Middleware - Redirecting authenticated user away from login')
    // Luôn redirect về dashboard để tránh vòng lặp
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Fallback: Check auth cookies for login page redirect
  if (!session && pathname === '/login') {
    const authType = req.cookies.get('auth_type')?.value
    const userRole = req.cookies.get('user_role')?.value
    const sessionToken = req.cookies.get('session_token')?.value
    
    if (authType === 'supabase' && userRole && sessionToken) {
      console.log('Middleware - Found auth cookies on login page, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Redirect root path to dashboard for authenticated users, login for others
  if (pathname === '/') {
    if (session) {
      console.log('Middleware - Redirecting root to dashboard (authenticated)')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } else {
      // Fallback: Check auth cookies for root path
      const authType = req.cookies.get('auth_type')?.value
      const userRole = req.cookies.get('user_role')?.value
      const sessionToken = req.cookies.get('session_token')?.value
      
      if (authType === 'supabase' && userRole && sessionToken) {
        console.log('Middleware - Found auth cookies on root, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
      } else {
        console.log('Middleware - Redirecting root to login (not authenticated)')
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  }

  console.log('Middleware - Allowing request to proceed')
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
