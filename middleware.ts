import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const protectedPaths = [
    '/dashboard',
    '/attendance',
    '/employees',
    '/leaves',
    '/payroll',
    '/profile',
    '/analytics'
  ]

  const authPaths = ['/login', '/register']

  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  const isAuth = authPaths.some(path => pathname.startsWith(path))

  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // If accessing protected route
  if (isProtected && !accessToken) {
    // Try to refresh if we have a refresh token
    if (refreshToken) {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/'
        const refreshEndpoint = process.env.NEXT_PUBLIC_REFRESH_ENDPOINT || 'auth/token/refresh/'
        
        const response = await fetch(`${API_BASE_URL}${refreshEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `refresh_token=${refreshToken}`
          },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          
          // Create response and set new cookies
          const nextResponse = NextResponse.next()
          
          // Cookie settings must match Django settings
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
          } as const
          
          if (data.access) {
            nextResponse.cookies.set('access_token', data.access, {
              ...cookieOptions,
              maxAge: 30 * 60, // 30 minutes
            })
          }
          
          if (data.refresh) {
            nextResponse.cookies.set('refresh_token', data.refresh, {
              ...cookieOptions,
              maxAge: 7 * 24 * 60 * 60, // 7 days
            })
          }
          
          return nextResponse
        }
      } catch (error) {
        console.error('Token refresh failed in middleware:', error)
      }
    }
    
    // No refresh token or refresh failed → redirect to login
    const loginUrl = new URL('/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    
    // Clear invalid cookies
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    
    return response
  }

  // If accessing auth routes while logged in, redirect to dashboard
  if (isAuth && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}