import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clearAuthCookies, setRefreshedAuthCookies, wantsRememberMe } from './lib/authCookies'

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public marketing pages — never force auth
    const publicExact = ['/', '/forgot-password', '/reset-password', '/privacy']
    if (publicExact.includes(pathname)) {
        return NextResponse.next()
    }

    const protectedPaths = [
        '/dashboard',
        '/attendance',
        '/employees',
        '/leaves',
        '/payroll',
        '/profile',
        '/analytics',
        '/performance',
        '/notifications',
        '/team',
        '/policies',
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
                const API_BASE_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/'
                const refreshEndpoint = process.env.NEXT_PUBLIC_REFRESH_ENDPOINT || 'auth/refresh/'

                // Ensure base URL ends with a slash for consistent concatenation
                const normalizedBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`
                const normalizedEndpoint = refreshEndpoint.startsWith('/') ? refreshEndpoint.slice(1) : refreshEndpoint

                const remember = wantsRememberMe(request)
                const rememberCookie = request.cookies.get('remember_me')?.value
                const cookieHeader = rememberCookie
                    ? `refresh_token=${refreshToken}; remember_me=${rememberCookie}`
                    : `refresh_token=${refreshToken}`

                const response = await fetch(`${normalizedBaseUrl}${normalizedEndpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': cookieHeader,
                    },
                    credentials: 'include',
                })

                if (response.ok) {
                    const data = await response.json()
                    const nextResponse = NextResponse.next()
                    setRefreshedAuthCookies(nextResponse, data, remember)
                    return nextResponse
                }
            } catch (error) {
                console.error('Token refresh failed in middleware:', error)
            }
        }

        // No refresh token or refresh failed → redirect to login
        const loginUrl = new URL('/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        clearAuthCookies(response)
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
