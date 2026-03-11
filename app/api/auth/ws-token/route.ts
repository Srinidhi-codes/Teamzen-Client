import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    // This route is used internally by the frontend to fetch the HttpOnly access token
    // exclusively for authenticating the WebSocket connection to the Render backend.
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ token });
}
