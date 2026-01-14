
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define paths that require authentication
  // These are the top-level paths for the dashboard and other protected areas
  const protectedPaths = [
    '/dashboard',
    '/attendance',
    '/employees',
    '/leaves',
    '/payroll',
    '/profile',
    '/analytics'
  ]

  // Define auth paths where logged-in users shouldn't go
  const authPaths = [
    '/login',
    '/register'
  ]

  // Check if current path matches any protected path
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  
  // Check if current path matches any auth path
  const isAuth = authPaths.some(path => pathname.startsWith(path))

  // Get access token from cookies
  // Backend uses 'access_token' for JWT authentication
  const token = request.cookies.get('access_token')?.value

  // If accessing a protected route without a token, redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    // Add the original URL as a 'next' search param to redirect back after login
    // loginUrl.searchParams.set('next', pathname) 
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth routes (login/register) while already logged in, redirect to dashboard
  if (isAuth && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

export const config = {
  // Apply middleware to all paths except API routes, static files, images, and favicon
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
