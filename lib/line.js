import * as line from "@line/bot-sdk";

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

// ===== VERIFY SIGNATURE =====
export function verifySignature(body, signature) {
  return line.validateSignature(
    body,
    config.channelSecret,
    signature
  );
}

// ===== REPLY =====
export async function reply(replyToken, messages) {
  await client.replyMessage({ replyToken, messages });
}

// ===== BUILD WELCOME MESSAGE =====
export function buildWelcome() {
  return {
    type: "text",
    text: "สวัสดีค่ะ! 🐾\n\nยินดีต้อนรับสู่ TinTin & Luca\nPet Friendly Directory!\n\n🐕 เลือกหมวดหมู่ด้านล่าง\n📍 หรือส่ง Location เพื่อหาร้านใกล้คุณ\n🌐 หรือกด 'ดู Directory' เพื่อเปิดหน้าเว็บ",
    quickReply: {
      items: [
        quickReplyItem("☕ คาเฟ่", "category=cafe"),
        quickReplyItem("🍽️ ร้านอาหาร", "category=restaurant"),
        quickReplyItem("🏨 โรงแรม", "category=hotel"),
        quickReplyItem("🌳 สวน", "category=park"),
        quickReplyItem("💆 สปา", "category=spa"),
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

function quickReplyItem(label, data) {
  return {
    type: "action",
    action: { type: "postback", label, data, displayText: label },
  };
}

// ===== BUILD CAROUSEL FLEX =====
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
        {
          type: "text",
          text: p.name,
          weight: "bold",
          size: "md",
          wrap: true,
          maxLines: 2,
        },
        {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          contents: [
            { type: "text", text: pawText(p.score), size: "sm", color: "#FFB300", flex: 0 },
            { type: "text", text: p.score.toFixed(1), size: "sm", color: "#F2994A", weight: "bold", flex: 0 },
            { type: "text", text: `📍 ${p.area}`, size: "xs", color: "#8D6E63", flex: 0 },
          ],
        },
        {
          type: "text",
          text: `🐕 ${p.petSize} | ${p.price || ""}`,
          size: "xs",
          color: "#8D6E63",
        },
        {
          type: "text",
          text: `💬 ${p.reviewer}: "${p.comment?.substring(0, 40) || "แนะนำ!"}..."`,
          size: "xs",
          color: "#D97706",
          wrap: true,
          maxLines: 2,
          margin: "sm",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "horizontal",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#F2994A",
          height: "sm",
          action: {
            type: "postback",
            label: "ดูรีวิว",
            data: `action=view&place_id=${p.id}`,
            displayText: `ดูรีวิว ${p.name}`,
          },
        },
        {
          type: "button",
          style: "secondary",
          height: "sm",
          action: {
            type: "uri",
            label: "🗺️ แผนที่",
            uri: `https://www.google.com/maps?q=${p.lat},${p.lng}`,
          },
        },
      ],
    },
  }));

  return {
    type: "flex",
    altText: "🐾 TinTin & Luca แนะนำสถานที่ Pet Friendly",
    contents: { type: "carousel", contents: bubbles },
  };
}

// ===== BUILD DETAIL FLEX =====
export function buildDetail(p) {
  return {
    type: "flex",
    altText: `🐾 ${p.name} — TinTin & Luca Review`,
    contents: {
      type: "bubble",
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
        spacing: "md",
        contents: [
          { type: "text", text: p.name, weight: "bold", size: "lg", wrap: true },
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              { type: "text", text: `🐾 ${p.score.toFixed(1)}`, size: "md", color: "#F2994A", weight: "bold", flex: 0 },
              { type: "text", text: pawText(p.score), size: "sm", color: "#FFB300", flex: 0 },
              { type: "text", text: "TinTin & Luca Score", size: "xxs", color: "#8D6E63", gravity: "bottom", flex: 0 },
            ],
          },
          { type: "separator" },
          {
            type: "text",
            text: p.description,
            size: "sm",
            color: "#5D4037",
            wrap: true,
          },
          { type: "separator" },
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              infoRow("📍", `${p.area}`),
              infoRow("🐕", `ขนาด: ${p.petSize}`),
              infoRow("📞", p.tel),
              infoRow("🕐", p.hours),
              infoRow("💰", p.price),
            ],
          },
          { type: "separator" },
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#FEF0E1",
            cornerRadius: "md",
            paddingAll: "md",
            contents: [
              { type: "text", text: `💬 ${p.reviewer} says:`, size: "xs", color: "#8D6E63", weight: "bold" },
              { type: "text", text: `"${p.comment || "แนะนำเลย!"}"`, size: "sm", color: "#E07C24", wrap: true, style: "italic" },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#F2994A",
            action: {
              type: "uri",
              label: "🧭 นำทาง Google Maps",
              uri: `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
            },
          },
          {
            type: "button",
            style: "secondary",
            action: {
              type: "uri",
              label: `📞 โทร ${p.tel}`,
              uri: `tel:${p.tel.replace(/-/g, "")}`,
            },
          },
          {
            type: "button",
            style: "secondary",
            action: {
              type: "uri",
              label: "🌐 ดู Directory เต็ม",
              uri: process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app",
            },
          },
        ],
      },
    },
  };
}

function pawText(score) {
  return "🐾".repeat(Math.round(score));
}

function infoRow(icon, text) {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "sm",
    contents: [
      { type: "text", text: icon, size: "sm", flex: 0 },
      { type: "text", text: text || "-", size: "sm", color: "#5D4037", wrap: true },
    ],
  };
}
