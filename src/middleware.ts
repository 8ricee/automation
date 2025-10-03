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

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // These variables are prepared for future authentication implementation
  // const pathname = req.nextUrl.pathname
  // const { data: { session } } = await supabase.auth.getSession()
  // const publicRoutes = ['/auth/login', '/auth/signup', '/', '/error']
  // const protectedRoutes = ['/dashboard', '/customers', '/products', '/orders', '/inventory', '/employees', '/projects', '/tasks', '/quotes', '/purchasing', '/financials', '/analytics']

  // TEMPORARILY DISABLED FOR DEVELOPMENT
  // TODO: Re-enable authentication after schema setup
  // if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
  //   const redirectUrl = new URL('/auth/login', req.url)
  //   redirectUrl.searchParams.set('redirectedFrom', pathname)
  //   return NextResponse.redirect(redirectUrl)
  // }

  // TEMPORARILY DISABLED FOR DEVELOPMENT
  // if (session && publicRoutes.includes(pathname)) {
  //   return NextResponse.redirect(new URL('/dashboard', req.url))
  // }

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
