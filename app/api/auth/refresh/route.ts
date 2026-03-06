import { NextRequest, NextResponse } from 'next/server';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
const DJANGO_API_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL : `${RAW_API_URL}/`;

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get('refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: 'No refresh token found' }, { status: 401 });
        }

        const djangoResponse = await fetch(`${DJANGO_API_URL}auth/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `refresh_token=${refreshToken}`,
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
            errResponse.cookies.delete('access_token');
            errResponse.cookies.delete('refresh_token');
            errResponse.cookies.delete('session_can_refresh');
            return errResponse;
        }

        const nextResponse = NextResponse.json(data, { status: 200 });
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
        };

        if (data.access) {
            nextResponse.cookies.set('access_token', data.access, { ...cookieOptions, maxAge: 30 * 60 });
        }

        if (data.refresh) {
            nextResponse.cookies.set('refresh_token', data.refresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
        }

        nextResponse.cookies.set('session_can_refresh', 'true', {
            httpOnly: false,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
        });

        return nextResponse;
    } catch (error) {
        console.error('Refresh proxy error:', error);
        return NextResponse.json({ error: 'Failed to connect to auth server' }, { status: 502 });
    }
}
