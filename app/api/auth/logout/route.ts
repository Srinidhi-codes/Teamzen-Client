import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const nextResponse = NextResponse.json({ success: true }, { status: 200 });

        nextResponse.cookies.delete("access_token");
        nextResponse.cookies.delete("refresh_token");
        nextResponse.cookies.delete("session_can_refresh");

        return nextResponse;
    } catch (error) {
        console.error("Logout proxy error:", error);
        return NextResponse.json({ error: "Failed to process logout" }, { status: 500 });
    }
}
