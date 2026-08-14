import { NextRequest, NextResponse } from "next/server";

export const ACCESS_MAX_AGE = 30 * 60;
export const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60;

export function wantsRememberMe(
  request: NextRequest,
  body?: Record<string, unknown> | null
): boolean {
  const fromBody = body?.remember_me ?? body?.rememberMe;
  if (fromBody === true || fromBody === "true" || fromBody === 1) return true;
  if (fromBody === false || fromBody === "false" || fromBody === 0) return false;
  const cookie = request.cookies.get("remember_me")?.value;
  return cookie === "true" || cookie === "1";
}

function persistOpts(remember: boolean): { maxAge?: number } {
  return remember ? { maxAge: REMEMBER_MAX_AGE } : {};
}

export function copyDjangoAuthCookies(
  djangoResponse: Response,
  nextResponse: NextResponse,
  remember: boolean
) {
  const isProduction = process.env.NODE_ENV === "production";
  const httpOnly = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };
  const readable = {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };
  const persist = persistOpts(remember);
  let copiedAuth = false;

  const setCookieHeaders =
    djangoResponse.headers.getSetCookie?.() ??
    [djangoResponse.headers.get("set-cookie") ?? ""].filter(Boolean);

  for (const cookieStr of setCookieHeaders) {
    const [nameValue] = cookieStr.split(";");
    const eqIdx = nameValue.indexOf("=");
    if (eqIdx === -1) continue;
    const name = nameValue.substring(0, eqIdx).trim();
    const value = nameValue.substring(eqIdx + 1).trim();

    if (name === "access_token") {
      nextResponse.cookies.set(name, value, { ...httpOnly, maxAge: ACCESS_MAX_AGE });
      copiedAuth = true;
    } else if (name === "refresh_token") {
      nextResponse.cookies.set(name, value, { ...httpOnly, ...persist });
      copiedAuth = true;
    } else if (name === "session_can_refresh" || name === "remember_me") {
      nextResponse.cookies.set(name, value, { ...readable, ...persist });
    }
  }

  if (copiedAuth) {
    nextResponse.cookies.set("remember_me", remember ? "true" : "false", {
      ...readable,
      ...persist,
    });
  }
}

export function setRefreshedAuthCookies(
  nextResponse: NextResponse,
  data: { access?: string; refresh?: string },
  remember: boolean
) {
  const isProduction = process.env.NODE_ENV === "production";
  const httpOnly = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };
  const readable = {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };
  const persist = persistOpts(remember);

  if (data.access) {
    nextResponse.cookies.set("access_token", data.access, {
      ...httpOnly,
      maxAge: ACCESS_MAX_AGE,
    });
  }
  if (data.refresh) {
    nextResponse.cookies.set("refresh_token", data.refresh, {
      ...httpOnly,
      ...persist,
    });
  }
  nextResponse.cookies.set("session_can_refresh", "true", {
    ...readable,
    ...persist,
  });
  nextResponse.cookies.set("remember_me", remember ? "true" : "false", {
    ...readable,
    ...persist,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.delete("session_can_refresh");
  response.cookies.delete("remember_me");
}
