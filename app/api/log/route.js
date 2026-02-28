import { NextResponse } from "next/server";
import { logEvent } from "@/lib/sheets";

export async function POST(req) {
  try {
    const { userId, action, placeId, placeName, category } = await req.json();

    await logEvent({ userId: userId || "web-user", action, placeId, placeName, category });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Log API error:", error);
    return NextResponse.json({ success: false, error: "Failed to log" }, { status: 500 });
  }
}
