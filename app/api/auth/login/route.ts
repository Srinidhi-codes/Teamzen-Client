import { NextRequest, NextResponse } from 'next/server';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
const DJANGO_API_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL : `${RAW_API_URL}/`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const djangoResponse = await fetch(`${DJANGO_API_URL}auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const responseText = await djangoResponse.text();
        let data: any = {};
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch {
            if (!djangoResponse.ok) {
                return NextResponse.json(
                    { error: 'Auth server unavailable, please try again in a moment.' },
                    { status: 503 }
                );
            }
        }

        if (!djangoResponse.ok) {
            return NextResponse.json(data, { status: djangoResponse.status });
        }

        const nextResponse = NextResponse.json(data, { status: 200 });

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
        };

        const setCookieHeaders = djangoResponse.headers.getSetCookie?.() ??
            [djangoResponse.headers.get('set-cookie') ?? ''].filter(Boolean);

        for (const cookieStr of setCookieHeaders) {
            const [nameValue] = cookieStr.split(';');
            const eqIdx = nameValue.indexOf('=');
            if (eqIdx === -1) continue;
            const name = nameValue.substring(0, eqIdx).trim();
            const value = nameValue.substring(eqIdx + 1).trim();

            if (name === 'access_token') {
                nextResponse.cookies.set(name, value, { ...cookieOptions, maxAge: 30 * 60 });
            } else if (name === 'refresh_token') {
                nextResponse.cookies.set(name, value, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
            } else if (name === 'session_can_refresh') {
                nextResponse.cookies.set(name, value, {
                    httpOnly: false,
                    secure: isProduction,
                    sameSite: 'lax' as const,
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60,
                });
            }
        }

        return nextResponse;
    } catch (error) {
        console.error('Login proxy error:', error);
        return NextResponse.json({ error: 'Failed to connect to auth server' }, { status: 502 });
    }
}
