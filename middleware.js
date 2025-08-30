// middleware.js (Create this in your root directory)
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    console.log('🔒 Middleware check:', {
      pathname: req.nextUrl.pathname,
      role: req.nextauth.token?.role,
      email: req.nextauth.token?.email
    })

    const { pathname } = req.nextUrl
    const userRole = req.nextauth.token?.role

    // Admin route protection
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      console.log('❌ Admin access denied for role:', userRole)
      return Response.redirect(new URL('/admin/login', req.url))
    }

    // Writer route protection
    if (pathname.startsWith('/writer') && userRole !== 'writer') {
      console.log('❌ Writer access denied for role:', userRole)
      return Response.redirect(new URL('/writer/login', req.url))
    }

    // Student dashboard protection (default dashboard)
    if (pathname.startsWith('/dashboard') && !userRole) {
      console.log('❌ Dashboard access denied - no role')
      return Response.redirect(new URL('/auth/login', req.url))
    }

    // Redirect users to appropriate dashboards if they access wrong areas
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      if (userRole === 'admin') {
        return Response.redirect(new URL('/admin/dashboard', req.url))
      }
      if (userRole === 'writer') {
        return Response.redirect(new URL('/writer/dashboard', req.url))
      }
      // Students go to overview
      return Response.redirect(new URL('/dashboard/overview', req.url))
    }

    console.log('✅ Access granted')
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow public routes
        const publicRoutes = [
          '/',
          '/auth/login',
          '/auth/register',
          '/auth/forgot-password',
          '/auth/reset-password',
          '/auth/email-verify',
          '/writer/login',
          '/writer/register',
          '/admin/login',
          '/admin/register',
          '/api/auth',
          '/terms',
          '/privacy'
        ]

        // Check if the route is public or an API route
        if (publicRoutes.some(route => pathname.startsWith(route)) || 
            pathname.startsWith('/api/auth/') ||
            pathname.startsWith('/_next/') ||
            pathname.startsWith('/favicon.ico')) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}