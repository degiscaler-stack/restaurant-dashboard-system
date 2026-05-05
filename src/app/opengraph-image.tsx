import { ImageResponse } from "next/og";

export const alt = "Le Grand Baraka Grill";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #0b0b0b 0%, #1a4d3e 55%, #0b0b0b 100%)",
          color: "#faf7ef",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800 }}>Le Grand Baraka Grill</div>
        <div style={{ marginTop: 18, fontSize: 30, color: "#e8d48b" }}>
          Moroccan grill & delivery — Casablanca
        </div>
        <div style={{ marginTop: 26, fontSize: 26, maxWidth: 900, lineHeight: 1.35 }}>
          Authentic flavors, charcoal grills, online ordering
        </div>
      </div>
    ),
    { ...size },
  );
}
