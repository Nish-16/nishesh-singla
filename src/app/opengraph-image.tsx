import { ImageResponse } from "next/og";
import { hero, identity } from "@/content";

export const alt = `${identity.name} — ${identity.altTagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0B0B0B",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "#F5F5F5",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#C6F432", fontSize: 26 }}>
          <div style={{ width: 16, height: 16, borderRadius: 8, background: "#C6F432", boxShadow: "0 0 18px #3DF5C4" }} />
          {identity.status}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -3, fontFamily: "sans-serif" }}>{identity.name}</div>
          <div style={{ marginTop: 20, fontSize: 36, color: "#8A8A8A", maxWidth: 980 }}>{identity.altTagline}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: "#8A8A8A" }}>
          {[hero.graph.client.label, hero.graph.next.label, hero.graph.api.label, hero.graph.pg.label].map((n, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {i > 0 && <div style={{ width: 48, height: 2, background: "#C6F432" }} />}
              <div style={{ display: "flex", padding: "10px 18px", border: "2px solid #3A3A3A", borderRadius: 8, color: "#F5F5F5" }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
