import { NextResponse } from "next/server";
import { verifySignature, reply, buildWelcome, buildCarousel, buildDetail } from "@/lib/line";
import { getPlaces, getPlaceById, logEvent } from "@/lib/sheets";

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { events } = JSON.parse(body);

    for (const event of events) {
      const userId = event.source?.userId;
      const replyToken = event.replyToken;

      if (!replyToken) continue;

      if (event.type === "message" && event.message.type === "text") {
        const text = event.message.text.trim();

        if (["สวัสดี", "hi", "hello", "help", "เมนู", "menu", "start"].includes(text.toLowerCase())) {
          await reply(replyToken, [buildWelcome()]);
          continue;
        }

        const places = await getPlaces({ search: text });
        await logEvent({ userId, action: "search", placeName: text, category: "text" });
        await reply(replyToken, [buildCarousel(places)]);
      }

      else if (event.type === "message" && event.message.type === "location") {
        const { latitude, longitude } = event.message;
        const places = await getPlaces({ lat: latitude, lng: longitude });
        await logEvent({ userId, action: "search", placeName: latitude + "," + longitude, category: "location" });
        await reply(replyToken, [buildCarousel(places)]);
      }

      else if (event.type === "postback") {
        const params = new URLSearchParams(event.postback.data);
        const action = params.get("action");
        const category = params.get("category");
        const placeId = params.get("place_id");

        if (category) {
          const places = await getPlaces({ category });
          await logEvent({ userId, action: "search", category });
          await reply(replyToken, [buildCarousel(places)]);
        }

        else if (action === "view" && placeId) {
          const place = await getPlaceById(placeId);
          if (place) {
            await logEvent({ userId, action: "view", placeId, placeName: place.name, category: place.category });
            await reply(replyToken, [buildDetail(place)]);
          }
        }

        else if ((action === "map" || action === "call") && placeId) {
          const place = await getPlaceById(placeId);
          if (place) {
            await logEvent({ userId, action, placeId, placeName: place.name, category: place.category });
          }
        }
      }

      else if (event.type === "follow") {
        await reply(replyToken, [buildWelcome()]);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "TinTin & Luca Webhook Active 🐾" });
}
