import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Vercel Satori OG-card generator.
 *
 * Every shipped deliverable can show off a 1200x630 social card built from
 * the trust-layer telemetry: title, deck, species, trust score, citations,
 * and the manager's voice-match. No screenshots, no Photoshop — just URL
 * params.
 *
 * Query params:
 *   title       — main headline (required)
 *   deck        — sub-headline / framing
 *   species     — aqua | poultry | ruminants | swine | cross
 *   manager     — manager id, e.g. "vish"
 *   trust       — 0–100 trust composite
 *   citations   — number of vault-resolved citations
 *   variant     — "linkedin" (1200x630, default) | "square" (1200x1200)
 */

const SPECIES_TINT: Record<string, { bg: string; accent: string; tag: string }> = {
  aqua: { bg: "#0e7490", accent: "#67e8f9", tag: "AQUA" },
  poultry: { bg: "#ca8a04", accent: "#fde68a", tag: "POULTRY" },
  ruminants: { bg: "#9f1239", accent: "#fda4af", tag: "RUMINANTS" },
  swine: { bg: "#15803d", accent: "#86efac", tag: "SWINE" },
  cross: { bg: "#1e293b", accent: "#cbd5e1", tag: "CROSS-SPECIES" },
};

const ADISSEO_RED = "#9b1c2c";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const title = (sp.get("title") ?? "Adisseo APAC — trial-anchored").slice(0, 120);
  const deck = (sp.get("deck") ?? "APAC AI · trust-gated deliverable").slice(0, 200);
  const species = (sp.get("species") ?? "cross") as keyof typeof SPECIES_TINT;
  const manager = sp.get("manager") ?? "Ricardo";
  const trustRaw = sp.get("trust");
  const trust = trustRaw ? Math.max(0, Math.min(100, parseInt(trustRaw, 10) || 0)) : null;
  const citations = sp.get("citations") ? parseInt(sp.get("citations") ?? "0", 10) : null;
  const variant = sp.get("variant") === "square" ? "square" : "linkedin";

  const tint = SPECIES_TINT[species] ?? SPECIES_TINT.cross;
  const dims = variant === "square" ? { width: 1200, height: 1200 } : { width: 1200, height: 630 };

  const trustTone =
    trust === null
      ? { bg: "#f5f5f4", text: "#44403c" }
      : trust >= 80
        ? { bg: "#dcfce7", text: "#166534" }
        : trust >= 60
          ? { bg: "#fef3c7", text: "#92400e" }
          : { bg: "#ffe4e6", text: "#9f1239" };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, #fafaf9 0%, #ffffff 60%, ${tint.accent}33 100%)`,
          fontFamily: "Inter, sans-serif",
          padding: "64px",
          position: "relative",
        }}
      >
        {/* Vertical accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "16px",
            background: ADISSEO_RED,
          }}
        />

        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: ADISSEO_RED,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              A
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#1c1917" }}>APAC AI</span>
              <span
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  color: ADISSEO_RED,
                  fontWeight: 700,
                }}
              >
                Adisseo APAC · trust-gated
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 999,
              background: tint.bg,
              color: "white",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 3,
            }}
          >
            <span>{tint.tag}</span>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
          <span
            style={{
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: 3,
              color: "#525252",
              fontWeight: 700,
            }}
          >
            {deck}
          </span>
          <h1
            style={{
              fontSize: variant === "square" ? 80 : 72,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#0c0a09",
              margin: 0,
              maxWidth: variant === "square" ? "1000px" : "1050px",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Bottom row — telemetry */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #e7e5e4",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {trust !== null && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 18px",
                  borderRadius: 12,
                  background: trustTone.bg,
                  color: trustTone.text,
                  minWidth: 140,
                }}
              >
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>
                  Trust gate
                </span>
                <span style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>
                  {trust}/100
                </span>
              </div>
            )}
            {citations !== null && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 18px",
                  borderRadius: 12,
                  background: "#f5f5f4",
                  color: "#1c1917",
                  minWidth: 140,
                }}
              >
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>
                  Citations
                </span>
                <span style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>
                  {citations}
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 18px",
                borderRadius: 12,
                background: "#f5f5f4",
                color: "#1c1917",
                minWidth: 140,
              }}
            >
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>
                Owner
              </span>
              <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
                {manager}
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 14,
              color: "#78716c",
              fontWeight: 600,
            }}
          >
            APAC pilot · Adisseo workspace · May 2026
          </span>
        </div>
      </div>
    ),
    {
      width: dims.width,
      height: dims.height,
    }
  );
}
