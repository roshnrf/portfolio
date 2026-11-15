import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = "Roshan Abdul Rauof, MSc Data Science at TU Dortmund";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "radial-gradient(circle at 15% 10%, rgba(94,106,210,0.35), transparent 55%), #020203",
          color: "#ededef",
        }}
      >
        <div style={{ fontSize: 28, color: "#9aa2f0" }}>{profile.eyebrow}</div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3,
            marginTop: 20,
          }}
        >
          {profile.name}
        </div>
        <div
          style={{ fontSize: 36, color: "#9a9fa8", marginTop: 24, maxWidth: 900 }}
        >
          {profile.headline}
        </div>
      </div>
    ),
    size,
  );
}
