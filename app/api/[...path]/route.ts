import { NextRequest, NextResponse } from 'next/server';

// In Docker: INTERNAL_API_URL = http://backend:8000/api (container-to-container via Docker network)
// In local dev: falls back to NEXT_PUBLIC_API_URL = http://localhost:8000/api
const RAW_API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/';
// Strip /api if it exists so we can target root level endpoints like /graphql/
const DJANGO_BASE = RAW_API_URL.replace(/\/api\/?$/, '');

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;

    // If the Next.js route is /api/graphql, the path array is ['graphql']
    // For /api/users, the path array is ['users']
    const isGraphQL = path[0] === 'graphql';

    // Build the Django path. If it's not graphql, prepend 'api/' since we stripped it from base.
    const djangoPath = isGraphQL ? path.join('/') : `api/${path.join('/')}`;

    // Django Strawberry (and DRF) usually require trailing slashes.
    const trailingSlash = djangoPath.endsWith('/') ? '' : '/';
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${DJANGO_BASE}/${djangoPath}${trailingSlash}${searchParams ? `?${searchParams}` : ''}`;

    const accessToken = request.cookies.get('access_token')?.value;
    const forwardedHeaders: Record<string, string> = {};

    request.headers.forEach((value, key) => {
        // Strip accept-encoding to prevent backend from gzipping,
        // passing compressed bytes verbatim can cause ERR_CONTENT_DECODING_FAILED
        if (!['host', 'connection', 'transfer-encoding', 'cookie', 'accept-encoding'].includes(key.toLowerCase())) {
            forwardedHeaders[key] = value;
        }
    });

    if (accessToken) {
        forwardedHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    let body: BodyInit | undefined;
    const method = request.method;
    if (!['GET', 'HEAD', 'DELETE'].includes(method)) {
        body = await request.blob();
    }

    try {
        const djangoResponse = await fetch(targetUrl, {
            method,
            headers: forwardedHeaders,
            body,
            // Do not follow redirects — OAuth (e.g. Google Calendar connect) must
            // return 302 Location to the browser, not Google's HTML via this proxy.
            redirect: 'manual',
            // Required for streaming: don't buffer the response body
            // @ts-ignore - duplex is required for streaming but not in all TS type defs
            duplex: 'half',
        });

        // Pass OAuth / API redirects through to the browser
        if ([301, 302, 303, 307, 308].includes(djangoResponse.status)) {
            const location = djangoResponse.headers.get('location');
            if (location) {
                return NextResponse.redirect(
                    location,
                    djangoResponse.status as 301 | 302 | 303 | 307 | 308
                );
            }
        }

        const responseHeaders = new Headers();
        djangoResponse.headers.forEach((value, key) => {
            // Next.js fetch automatically decompresses the response body.
            // If we forward the 'content-encoding' header (e.g. gzip) but serve
            // the decompressed bytes, the browser will fail to decode it.
            // We also strip content-length because the uncompressed size differs.
            const stripHeaders = [
                'transfer-encoding',
                'connection',
                'keep-alive',
                'content-encoding',
                'content-length'
            ];
            if (!stripHeaders.includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        // For SSE/streaming responses, pipe the body directly without buffering.
        // This ensures tool_start/tool_end events reach the browser in real-time.
        const contentType = djangoResponse.headers.get('content-type') || '';
        if (contentType.includes('text/event-stream') || contentType.includes('application/octet-stream')) {
            // Stream directly — do NOT await djangoResponse.text() or .blob()
            return new NextResponse(djangoResponse.body, {
                status: djangoResponse.status,
                headers: responseHeaders,
            });
        }

        // For non-streaming responses, buffer normally (safe for JSON, etc.)
        const responseBody = await djangoResponse.blob();
        return new NextResponse(responseBody, {
            status: djangoResponse.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error(`[API Proxy] Error forwarding ${method} ${targetUrl}:`, error);
        return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
