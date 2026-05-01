import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
  Svg,
  Circle,
  Line,
  Polygon,
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";
import {
  BILLBOARD_FORMATS,
  type BillboardPack,
  type BillboardFormat,
} from "@/lib/billboards";

export const runtime = "nodejs";

let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  const fontDir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "Noto Sans",
    fonts: [
      { src: path.join(fontDir, "NotoSans-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontDir, "NotoSans-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const CRIMSON = "#A70A2D";
const CRIMSON_DARK = "#7d0822";
const CYAN = "#00A3C4";
const ORANGE = "#D97641";
const INK = "#0E1216";
const MUTED = "#6B7280";
const LINE = "#E5E7EB";
const BG_PAPER = "#FBF9F9";
const BG_INK = "#0E1216";

interface Props {
  pack: BillboardPack;
  format: BillboardFormat;
}

function loadLogoDataUri(): string | null {
  try {
    const p = path.join(
      process.cwd(),
      "public",
      "brand",
      "adisseo-logo-knockout.svg"
    );
    if (!fs.existsSync(p)) return null;
    return null; // PDF lib's <Image> doesn't accept SVG; we draw the logotype as text instead.
  } catch {
    return null;
  }
}

function BillboardPdf({ pack, format }: Props) {
  const spec = BILLBOARD_FORMATS.find((f) => f.id === format) ?? BILLBOARD_FORMATS[0];
  const W = spec.width;
  const H = spec.height;
  const isSquare = format === "square-linkedin";

  // Scale the layout to the page size — everything is proportional to W
  const HERO_FONT = isSquare ? Math.round(W * 0.06) : Math.round(W * 0.075);
  const SECTION_FONT = Math.round(W * 0.022);
  const BODY_FONT = Math.round(W * 0.016);
  const META_FONT = Math.round(W * 0.012);
  const PAD = Math.round(W * 0.05);

  const pageStyle = {
    fontFamily: "Noto Sans",
    backgroundColor: BG_PAPER,
    color: INK,
    paddingTop: PAD,
    paddingBottom: PAD,
    paddingHorizontal: PAD,
  } as const;

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: { width: W, height: H }, style: pageStyle },

      // ===================== TOP RIBBON =====================
      React.createElement(
        View,
        {
          style: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: PAD * 0.6,
            borderBottomWidth: 1,
            borderBottomColor: LINE,
          },
        },
        React.createElement(
          View,
          { style: { flexDirection: "row", alignItems: "center", gap: 8 } },
          React.createElement(
            View,
            {
              style: {
                width: META_FONT * 1.3,
                height: META_FONT * 1.3,
                backgroundColor: CRIMSON,
                borderRadius: 999,
              },
            }
          ),
          React.createElement(
            Text,
            {
              style: {
                fontSize: META_FONT,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: CRIMSON,
              },
            },
            "Adisseo \u00b7 AdiPlan billboard"
          )
        ),
        React.createElement(
          Text,
          {
            style: {
              fontSize: META_FONT,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: MUTED,
            },
          },
          `${spec.label}`
        )
      ),

      // ===================== STAGE / CBI LINE =====================
      React.createElement(
        View,
        {
          style: {
            paddingTop: PAD * 0.8,
            paddingBottom: PAD * 0.4,
            flexDirection: "row",
            gap: 16,
          },
        },
        React.createElement(
          Text,
          {
            style: {
              fontSize: META_FONT,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: CRIMSON,
            },
          },
          `CBI \u00b7 ${pack.cbi}`
        ),
        React.createElement(
          Text,
          {
            style: {
              fontSize: META_FONT,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: CYAN,
            },
          },
          `Persona \u00b7 ${pack.persona}`
        ),
        React.createElement(
          Text,
          {
            style: {
              fontSize: META_FONT,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: ORANGE,
            },
          },
          `Region \u00b7 ${pack.region}`
        )
      ),

      // ===================== HEADLINE =====================
      React.createElement(
        Text,
        {
          style: {
            fontSize: HERO_FONT,
            fontWeight: 700,
            lineHeight: 1.05,
            color: INK,
            paddingTop: PAD * 0.2,
            paddingBottom: PAD * 0.3,
            // a tight measure for billboard typography
            maxWidth: W * 0.95,
          },
        },
        pack.headline
      ),

      // ===================== HERO VISUAL FRAME =====================
      React.createElement(
        View,
        {
          style: {
            backgroundColor: BG_INK,
            borderRadius: PAD * 0.2,
            padding: PAD * 0.6,
            marginBottom: PAD * 0.5,
            position: "relative",
          },
        },
        React.createElement(
          Text,
          {
            style: {
              color: ORANGE,
              fontSize: META_FONT,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: PAD * 0.2,
            },
          },
          "Hero visual brief"
        ),
        React.createElement(
          Text,
          {
            style: {
              color: "#FFFFFF",
              fontSize: BODY_FONT,
              lineHeight: 1.4,
            },
          },
          pack.visualBrief
        ),
        // a programmatic abstract "stat curve" decoration on the right
        React.createElement(
          View,
          {
            style: {
              position: "absolute",
              right: PAD * 0.4,
              top: PAD * 0.4,
              opacity: 0.55,
            },
          },
          React.createElement(
            Svg,
            { width: W * 0.18, height: W * 0.07, viewBox: "0 0 100 40" },
            React.createElement(Line, {
              x1: "0",
              y1: "32",
              x2: "100",
              y2: "32",
              stroke: "#ffffff",
              strokeWidth: 0.5,
              strokeOpacity: 0.4,
            }),
            React.createElement(Polygon, {
              points: "0,30 18,28 32,18 50,22 68,8 82,12 100,4",
              stroke: CYAN,
              strokeWidth: 1.5,
              fill: "none",
            }),
            React.createElement(Polygon, {
              points: "0,34 18,33 32,30 50,32 68,28 82,30 100,26",
              stroke: ORANGE,
              strokeWidth: 1.5,
              fill: "none",
            })
          )
        )
      ),

      // ===================== DIFFERENTIATION + RTB =====================
      React.createElement(
        View,
        {
          style: {
            flexDirection: isSquare ? "column" : "row",
            gap: PAD * 0.4,
            marginBottom: PAD * 0.4,
          },
        },
        React.createElement(
          View,
          {
            style: {
              flex: 2,
              borderLeftWidth: 4,
              borderLeftColor: CRIMSON,
              paddingLeft: PAD * 0.3,
            },
          },
          React.createElement(
            Text,
            {
              style: {
                fontSize: META_FONT,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: CRIMSON,
                marginBottom: 4,
              },
            },
            "Adisseo Differentiation"
          ),
          React.createElement(
            Text,
            {
              style: {
                fontSize: SECTION_FONT,
                fontWeight: 700,
                lineHeight: 1.25,
                color: INK,
              },
            },
            pack.differentiation
          )
        ),
        React.createElement(
          View,
          {
            style: {
              flex: 1,
              borderLeftWidth: 4,
              borderLeftColor: CYAN,
              paddingLeft: PAD * 0.3,
            },
          },
          React.createElement(
            Text,
            {
              style: {
                fontSize: META_FONT,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: CYAN,
                marginBottom: 4,
              },
            },
            "Reason to believe"
          ),
          React.createElement(
            Text,
            {
              style: {
                fontSize: SECTION_FONT,
                fontWeight: 700,
                lineHeight: 1.25,
                color: INK,
              },
            },
            pack.reasonToBelieve
          )
        )
      ),

      // ===================== EVIDENCE STACK =====================
      React.createElement(
        View,
        {
          style: {
            flexDirection: isSquare ? "column" : "row",
            gap: PAD * 0.3,
            marginBottom: PAD * 0.5,
          },
        },
        ...pack.evidence.slice(0, 3).map((ev, i) =>
          React.createElement(
            View,
            {
              key: `ev-${i}`,
              style: {
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: LINE,
                borderRadius: 4,
                padding: PAD * 0.3,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 8,
              },
            },
            React.createElement(
              View,
              {
                style: {
                  width: META_FONT * 2,
                  height: META_FONT * 2,
                  borderRadius: 999,
                  backgroundColor: i === 0 ? CRIMSON : i === 1 ? CYAN : ORANGE,
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
              React.createElement(
                Text,
                {
                  style: {
                    color: "#FFFFFF",
                    fontSize: META_FONT,
                    fontWeight: 700,
                  },
                },
                String(i + 1)
              )
            ),
            React.createElement(
              Text,
              {
                style: {
                  flex: 1,
                  fontSize: BODY_FONT,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: INK,
                },
              },
              ev
            )
          )
        )
      ),

      // ===================== BOTTOM CTA + SCORING =====================
      React.createElement(
        View,
        {
          style: {
            marginTop: "auto",
            backgroundColor: CRIMSON,
            borderRadius: 4,
            padding: PAD * 0.5,
            flexDirection: isSquare ? "column" : "row",
            alignItems: isSquare ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: 12,
          },
        },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(
            Text,
            {
              style: {
                color: "#ffd5dd",
                fontSize: META_FONT,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 4,
              },
            },
            "Next move"
          ),
          React.createElement(
            Text,
            {
              style: {
                color: "#FFFFFF",
                fontSize: SECTION_FONT,
                fontWeight: 700,
                lineHeight: 1.2,
              },
            },
            pack.cta
          )
        ),
        React.createElement(
          View,
          {
            style: {
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
            },
          },
          ...(["unique", "important", "believable"] as const).map((k) =>
            React.createElement(
              View,
              {
                key: k,
                style: { alignItems: "center", minWidth: W * 0.07 },
              },
              React.createElement(
                Text,
                {
                  style: {
                    color: "#FFFFFF",
                    fontSize: SECTION_FONT * 1.15,
                    fontWeight: 700,
                  },
                },
                String(pack.scoring[k])
              ),
              React.createElement(
                Text,
                {
                  style: {
                    color: "#ffd5dd",
                    fontSize: META_FONT * 0.85,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  },
                },
                k
              )
            )
          )
        )
      ),

      // ===================== FOOTER LINE =====================
      React.createElement(
        View,
        {
          style: {
            paddingTop: PAD * 0.4,
            flexDirection: "row",
            justifyContent: "space-between",
          },
        },
        React.createElement(
          Text,
          {
            style: {
              fontSize: META_FONT,
              color: MUTED,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontWeight: 700,
            },
          },
          `Anchor signal \u00b7 ${pack.competitor}`
        ),
        React.createElement(
          Text,
          {
            style: {
              fontSize: META_FONT,
              color: MUTED,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontWeight: 700,
            },
          },
          "AdiPlan AI \u00b7 APAC pilot"
        )
      )
    )
  );
}

export async function POST(req: NextRequest) {
  ensureFonts();
  loadLogoDataUri(); // reserved for future SVG-to-PDF logo support

  const body = (await req.json()) as { pack: BillboardPack; format?: BillboardFormat };
  const pack = body.pack;
  if (!pack || !pack.headline) {
    return NextResponse.json(
      { error: "missing pack" },
      { status: 400 }
    );
  }
  const format: BillboardFormat = body.format ?? "a2-portrait";

  const element = React.createElement(BillboardPdf, { pack, format });
  const buf = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0]
  );
  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="adisseo-billboard-${format}.pdf"`,
    },
  });
}
