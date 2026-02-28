"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.href = "/directory.html";
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Kanit, sans-serif",
        background: "#FFF8F0",
        color: "#3E2723",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🐾</div>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>TinTin & Luca</h1>
        <p style={{ color: "#8D6E63" }}>Loading Pet Friendly Directory...</p>
      </div>
    </div>
  );
}
