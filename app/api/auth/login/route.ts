import { NextRequest, NextResponse } from 'next/server';
import { copyDjangoAuthCookies, wantsRememberMe } from '@/lib/authCookies';

const RAW_API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
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
        copyDjangoAuthCookies(djangoResponse, nextResponse, wantsRememberMe(request, body));
        return nextResponse;
    } catch (error) {
        console.error('Login proxy error:', error);
        return NextResponse.json({ error: 'Failed to connect to auth server' }, { status: 502 });
    }
}
