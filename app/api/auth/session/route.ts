import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight cookie presence check for client auth sync.
 * Does not call Django — just reports whether session cookies exist.
 */
export async function GET(request: NextRequest) {
  const access = request.cookies.get("access_token")?.value;
  const refresh = request.cookies.get("refresh_token")?.value;

  return NextResponse.json({
    authenticated: Boolean(access || refresh),
    hasAccess: Boolean(access),
    hasRefresh: Boolean(refresh),
  });
}
