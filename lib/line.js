import * as line from "@line/bot-sdk";

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

export function verifySignature(body, signature) {
  return line.validateSignature(
    body,
    process.env.LINE_CHANNEL_SECRET,
    signature
  );
}

export async function reply(replyToken, messages) {
  await client.replyMessage({ replyToken, messages });
}

export function buildWelcome() {
  return {
    type: "text",
    text: "สวัสดีค่ะ! 🐾\n\nยินดีต้อนรับสู่ TinTin & Luca\nPet Friendly Directory!\n\n🐕 เลือกหมวดหมู่ด้านล่าง\n📍 หรือส่ง Location เพื่อหาร้านใกล้คุณ\n🌐 หรือกด 'ดู Directory' เพื่อเปิดหน้าเว็บ",
    quickReply: {
      items: [
        qr("☕ คาเฟ่", "category=cafe"),
        qr("🍽️ ร้านอาหาร", "category=restaurant"),
        qr("🏨 โรงแรม", "category=hotel"),
        qr("🌳 สวน", "category=park"),
        qr("💆 สปา", "category=spa"),
        {
          type: "action",
          action: {
            type: "uri",
            label: "🌐 ดู Directory",
            uri: process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app",
          },
        },
        {
          type: "action",
          action: { type: "location", label: "📍 ส่งตำแหน่ง" },
        },
      ],
    },
  };
}

function qr(label, data) {
  return {
    type: "action",
    action: { type: "postback", label, data, displayText: label },
  };
}

export function buildCarousel(places) {
  if (!places || places.length === 0) {
    return { type: "text", text: "ไม่พบสถานที่ที่ตรงกับเงื่อนไข 🐾 ลองค้นหาใหม่นะคะ" };
  }

  const bubbles = places.slice(0, 5).map((p) => ({
    type: "bubble",
    size: "kilo",
    hero: {
      type: "image",
      url: p.image,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        { type: "text", text: p.name, weight: "bold", size: "md", wrap: true, maxLines: 2 },
        {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          contents: [
            { type: "text", text: "🐾".repeat(Math.round(p.score)), size: "sm", color: "#FFB300", flex: 0 },
            { type: "text", text: p.score.toFixed(1), size: "sm", color: "#F2994A", weight: "bold", flex: 0 },
            { type: "text", text: "📍 " + p.area, size: "xs", color: "#8D6E63", flex: 0 },
          ],
        }
