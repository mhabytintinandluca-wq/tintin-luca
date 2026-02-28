export const metadata = {
  title: "TinTin & Luca — Pet Friendly Directory",
  description: "สถานที่ Pet Friendly ที่ TinTin & Luca ไปรีวิวจริง ให้ Rating เอง!",
  openGraph: {
    title: "TinTin & Luca — Pet Friendly Directory 🐾",
    description: "Sniffed, Tested & Approved! ค้นหาสถานที่ Pet Friendly ที่ดีที่สุด",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Kanit:wght@300;400;500;600;700&family=Caveat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
