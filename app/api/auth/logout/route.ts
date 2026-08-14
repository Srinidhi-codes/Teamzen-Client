import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/authCookies";

export async function POST() {
    try {
        const nextResponse = NextResponse.json({ success: true }, { status: 200 });
        clearAuthCookies(nextResponse);
        return nextResponse;
    } catch (error) {
        console.error("Logout proxy error:", error);
        return NextResponse.json({ error: "Failed to process logout" }, { status: 500 });
    }
}
