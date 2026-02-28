import { NextResponse } from "next/server";
import { getPlaces } from "@/lib/sheets";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")) : null;
    const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")) : null;
    const search = searchParams.get("q");

    const places = await getPlaces({ category, lat, lng, search });

    return NextResponse.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    console.error("Places API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch places" }, { status: 500 });
  }
}
