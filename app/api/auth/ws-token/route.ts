import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setRefreshedAuthCookies, wantsRememberMe } from '@/lib/authCookies';

const RAW_API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
const DJANGO_API_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL : `${RAW_API_URL}/`;

export async function GET(request: NextRequest) {
    // This route is used internally by the frontend to fetch the HttpOnly access token
    // exclusively for authenticating the WebSocket connection to the backend.
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const forceRefresh = request.nextUrl.searchParams.get('refresh') === '1';

    // If an access token exists and caller didn't explicitly request a refreshed one, return it
    if (token && !forceRefresh) {
        return NextResponse.json({ token });
    }

    // Attempt token refresh via refresh_token cookie
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (!refreshToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const remember = wantsRememberMe(request);
        const rememberCookie = cookieStore.get('remember_me')?.value;
        const cookieHeader = rememberCookie
            ? `refresh_token=${refreshToken}; remember_me=${rememberCookie}`
            : `refresh_token=${refreshToken}`;

        const djangoResponse = await fetch(`${DJANGO_API_URL}auth/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader,
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!djangoResponse.ok) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await djangoResponse.json();
        const nextResponse = NextResponse.json({ token: data.access || token });
        setRefreshedAuthCookies(nextResponse, data, remember);
        return nextResponse;
    } catch {
        return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }
}
