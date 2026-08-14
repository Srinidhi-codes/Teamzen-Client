import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, setRefreshedAuthCookies, wantsRememberMe } from '@/lib/authCookies';

const RAW_API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
const DJANGO_API_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL : `${RAW_API_URL}/`;

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get('refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: 'No refresh token found' }, { status: 401 });
        }

        const remember = wantsRememberMe(request);
        const rememberCookie = request.cookies.get('remember_me')?.value;
        const cookieHeader = rememberCookie
            ? `refresh_token=${refreshToken}; remember_me=${rememberCookie}`
            : `refresh_token=${refreshToken}`;

        const djangoResponse = await fetch(`${DJANGO_API_URL}auth/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader,
            },
        });

        const responseText = await djangoResponse.text();
        let data: any = {};
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch {
            return NextResponse.json(
                { error: 'Auth server unavailable, please try again in a moment.' },
                { status: 503 }
            );
        }

        if (!djangoResponse.ok) {
            const errResponse = NextResponse.json(data, { status: djangoResponse.status });
            clearAuthCookies(errResponse);
            return errResponse;
        }

        const nextResponse = NextResponse.json(data, { status: 200 });
        setRefreshedAuthCookies(nextResponse, data, remember);
        return nextResponse;
    } catch (error) {
        console.error('Refresh proxy error:', error);
        return NextResponse.json({ error: 'Failed to connect to auth server' }, { status: 502 });
    }
}
