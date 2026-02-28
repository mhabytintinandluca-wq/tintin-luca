import { google } from "googleapis";

let sheetsClient = null;

function getSheets() {
  if (sheetsClient) return sheetsClient;

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

export async function getPlaces({ category, lat, lng, search } = {}) {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: "Places!A2:P",
  });

  const rows = res.data.values || [];

  let places = rows
    .map((row) => ({
      id: row[0],
      name: row[1],
      category: row[2],
      catLabel: row[3],
      description: row[4],
      image: row[5],
      lat: parseFloat(row[6]),
      lng: parseFloat(row[7]),
      tel: row[8],
      petSize: row[9],
      score: parseFloat(row[10]),
      area: row[11],
      hours: row[12] || "",
      price: row[13] || "",
      reviewer: row[14] || "TinTin",
      comment: row[15] || "",
      active: (row[16] || "TRUE").toUpperCase() === "TRUE",
    }))
    .filter((p) => p.active && p.name);

  if (category && category !== "all") {
    places = places.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    places = places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.catLabel.includes(q)
    );
  }

  if (lat && lng) {
    places = places
      .map((p) => ({
        ...p,
        distance: haversine(lat, lng, p.lat, p.lng),
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  return places;
}

export async function getPlaceById(id) {
  const places = await getPlaces();
  return places.find((p) => p.id === String(id));
}

export async function logEvent({ userId, action, placeId, placeName, category }) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: "Logs!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          userId || "anonymous",
          action,
          placeId || "",
          placeName || "",
          category || "",
        ],
      ],
    },
  });
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
