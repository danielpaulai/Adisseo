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
  Polygon,
  Line as SvgLine,
  Circle,
  Path,
  Rect as SvgRect,
  G,
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";
import {
  deterministicBrochure,
  ruminantsAudiences,
  ruminantsCampaigns,
  type RuminantsBrochureData,
  type RuminantsLanguage,
} from "@/lib/ruminants-brochure";

export const runtime = "nodejs";

/* =====================================================================
 * MANGA RENDERER — v2.0
 * Antoine's 2-page Ruminants brochure for Japanese dairy customers.
 *
 * v1 had halftone, bubbles, kuro-koma. v2 adds the missing 90% of what
 * makes a page actually read as manga:
 *
 *   1. Character art — Holstein cow profile + straw-hat farmer
 *      silhouette, both as parametric SVG paths.
 *   2. Multi-layer SFX — a 4-pass onomatopoeia stack (drop-shadow,
 *      black outer stroke, white mid stroke, color fill) so the SFX
 *      reads as letterform-art, not as a typed word.
 *   3. Diagonal panel cuts — splash panel has a slanted bottom edge
 *      drawn as an SVG mask, the way pro manga panels actually break.
 *   4. Screentone variety — 60° diagonal line tone, hex dot tone, and
 *      dense shadow tone, each as their own primitive.
 *   5. Sweat drop — the canonical anime sweat tear with a highlight.
 *   6. Speed lines — parallel diagonal motion lines as a tile.
 *   7. Impact lines — V-burst radiating from a corner.
 *   8. Vertical Japanese caption strip (tategaki feel, traditional).
 *   9. Manga page-number circle in the bottom outer corner.
 *  10. Sun-ray burst — denser, asymmetric, hand-drawn jitter.
 * ===================================================================== */

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
  Font.register({
    family: "Noto Sans JP",
    fonts: [
      { src: path.join(fontDir, "NotoSansJP-Regular.otf"), fontWeight: 400 },
      { src: path.join(fontDir, "NotoSansJP-Bold.otf"), fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const CRIMSON = "#A70A2D";
const CRIMSON_DARK = "#6B0518";
const CYAN = "#00A3C4";
const ORANGE = "#D97641";
const SUN_YELLOW = "#F4C430";
const INK = "#0E1216";
const PAPER = "#FBF6EE"; // newsprint cream
const PAPER_DEEP = "#F1E9D8"; // tone for shadow regions
const BLACK = "#000000";
const WHITE = "#FFFFFF";

/* ---------------------------------------------------------------------
 * ScriptText — Latin runs use Noto Sans, JP runs use Noto Sans JP.
 * --------------------------------------------------------------------- */
function ScriptText({
  text,
  language,
  style,
}: {
  text: string;
  language: RuminantsLanguage;
  style?: ReturnType<typeof StyleSheet.create>[string];
}) {
  if (language !== "ja" || !text) {
    return React.createElement(Text, { style }, text);
  }
  const segments: { text: string; jp: boolean }[] = [];
  let buf = "";
  let cur: boolean | null = null;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    const useJP = code > 0x024f;
    if (cur === null) cur = useJP;
    if (useJP !== cur) {
      segments.push({ text: buf, jp: cur });
      buf = "";
      cur = useJP;
    }
    buf += ch;
  }
  if (buf) segments.push({ text: buf, jp: cur ?? false });
  return React.createElement(
    Text,
    { style },
    ...segments.map((s, i) =>
      React.createElement(
        Text,
        {
          key: i,
          style: { fontFamily: s.jp ? "Noto Sans JP" : "Noto Sans" },
        },
        s.text
      )
    )
  );
}

/* =====================================================================
 * SVG PRIMITIVES — manga visual building blocks
 * ===================================================================== */

/**
 * Holstein cow profile — stylized side-view silhouette in 3 pieces:
 *  - body fill (white)
 *  - black blotches (Holstein pattern)
 *  - outline + features (eye, horn-curl, udder line)
 *
 * Drawn parametric so it scales without rasterizing. The cow looks
 * RIGHT and slightly down (heat-stress posture).
 */
function CowSilhouette({
  width,
  height,
  withSweat = true,
}: {
  width: number;
  height: number;
  withSweat?: boolean;
}) {
  // Body shape — a single closed path, hand-tuned from a profile sketch.
  // Coordinates are in a 200x130 design space; viewBox scales to width/height.
  const bodyPath =
    "M 28 76 " + // back left start
    "C 24 60 32 50 44 50 " + // shoulder rise
    "L 50 42 C 50 36 56 32 62 36 L 64 42 " + // hump
    "C 70 36 78 38 80 46 " + // neck
    "L 92 44 C 100 38 112 38 118 44 " + // head top
    "L 124 40 C 130 38 136 42 134 50 " + // ears/horn
    "L 130 56 C 134 62 132 70 128 72 " + // jaw
    "C 128 78 122 82 116 80 " + // cheek/mouth
    "L 110 82 L 108 78 " + // chin
    "L 102 80 C 96 80 92 76 92 70 " + // throat
    "L 86 72 L 86 80 " + // chest dip
    "L 84 88 L 88 96 L 86 110 L 80 110 L 80 100 L 76 96 " + // front leg
    "L 70 96 L 70 110 L 64 110 L 64 100 " + // 2nd front leg
    "L 56 98 L 50 100 " + // belly
    "L 46 110 L 40 110 L 40 102 L 36 96 " + // back-left leg
    "L 30 96 L 30 110 L 24 110 L 24 96 " + // 2nd back leg
    "L 24 88 " + // rump
    "L 28 84 L 28 76 Z";

  // Holstein blotches as separate filled paths.
  const blotch1 = "M 60 56 C 70 52 78 56 82 64 C 80 72 70 74 60 70 Z"; // shoulder blotch
  const blotch2 = "M 38 78 C 50 76 56 80 56 90 C 50 94 40 92 36 86 Z"; // belly
  const blotch3 = "M 96 60 C 104 56 110 60 110 66 C 106 70 98 70 96 64 Z"; // head spot

  // Eye + nostril
  const eyePath = "M 116 54 m -1.5 0 a 1.5 1.5 0 1 0 3 0 a 1.5 1.5 0 1 0 -3 0";
  const nostrilPath = "M 124 64 m -1 0 a 1 1.4 0 1 0 2 0 a 1 1.4 0 1 0 -2 0";
  // Tail flicking back
  const tailPath = "M 24 76 C 16 70 12 60 18 56 L 22 60 C 20 66 22 72 26 76 Z";

  return React.createElement(
    Svg,
    {
      width,
      height,
      viewBox: "0 0 200 130",
    },
    // base body white
    React.createElement(Path, {
      d: bodyPath,
      fill: WHITE,
      stroke: BLACK,
      strokeWidth: 2.4,
      strokeLinejoin: "round",
    }),
    // tail
    React.createElement(Path, {
      d: tailPath,
      fill: BLACK,
      stroke: BLACK,
      strokeWidth: 1.4,
    }),
    // blotches
    React.createElement(Path, { d: blotch1, fill: BLACK }),
    React.createElement(Path, { d: blotch2, fill: BLACK }),
    React.createElement(Path, { d: blotch3, fill: BLACK }),
    // eye
    React.createElement(Path, { d: eyePath, fill: BLACK }),
    // nostril
    React.createElement(Path, { d: nostrilPath, fill: BLACK }),
    // udder hint
    React.createElement(SvgLine, {
      x1: 56, y1: 95, x2: 70, y2: 95,
      stroke: BLACK, strokeWidth: 1.2,
    }),
    // optional sweat drop above the head (heat-stress narrative)
    withSweat
      ? React.createElement(
          G,
          { transform: "translate(132 26)" },
          React.createElement(Path, {
            d: "M 0 12 C 0 6 4 0 5 0 C 6 0 10 6 10 12 C 10 17 7 20 5 20 C 3 20 0 17 0 12 Z",
            fill: CYAN,
            stroke: BLACK,
            strokeWidth: 1.2,
          }),
          // highlight
          React.createElement(Path, {
            d: "M 3 6 C 3 4 4 3 4.5 3 L 5 5 C 4 6 4 8 4 9 Z",
            fill: WHITE,
          })
        )
      : null
  );
}

/**
 * Straw-hat farmer silhouette — simplified shoulder-up profile, looking
 * left, used as a background motif inside the splash panel. Renders as a
 * single dark silhouette so it doesn't fight the foreground text.
 */
function FarmerSilhouette({
  width,
  height,
  fill = BLACK,
  opacity = 0.85,
}: {
  width: number;
  height: number;
  fill?: string;
  opacity?: number;
}) {
  // 100x130 design space. Hat brim is wide & flat, body tapers down.
  const hat =
    "M 8 38 L 92 38 L 86 30 L 78 28 L 70 26 L 62 28 L 54 30 L 46 30 L 38 28 L 30 26 L 22 28 L 14 30 L 8 38 Z";
  const head =
    "M 30 38 L 30 56 C 30 64 38 70 50 70 C 62 70 70 64 70 56 L 70 38 Z";
  const neck = "M 42 70 L 58 70 L 58 80 L 42 80 Z";
  const shoulders =
    "M 12 130 C 12 100 28 84 42 80 L 58 80 C 72 84 88 100 88 130 Z";
  return React.createElement(
    Svg,
    { width, height, viewBox: "0 0 100 130", style: { opacity } },
    React.createElement(Path, { d: shoulders, fill }),
    React.createElement(Path, { d: neck, fill }),
    React.createElement(Path, { d: head, fill }),
    React.createElement(Path, { d: hat, fill }),
    // hat band highlight
    React.createElement(SvgRect, {
      x: 22, y: 36, width: 56, height: 1.5, fill: WHITE,
    })
  );
}

/**
 * Anime-style sweat drop, free-standing. (The CowSilhouette has its own
 * built-in drop above the head; this is for non-cow contexts.)
 */
function SweatDrop({
  width,
  height,
  fill = CYAN,
}: {
  width: number;
  height: number;
  fill?: string;
}) {
  return React.createElement(
    Svg,
    { width, height, viewBox: "0 0 20 30" },
    React.createElement(Path, {
      d: "M 0 18 C 0 9 8 0 10 0 C 12 0 20 9 20 18 C 20 26 14 30 10 30 C 6 30 0 26 0 18 Z",
      fill,
      stroke: BLACK,
      strokeWidth: 1.2,
    }),
    React.createElement(Path, {
      d: "M 5 9 C 5 6 7 4 8 4 L 9 7 C 7 9 7 12 7 14 Z",
      fill: WHITE,
    })
  );
}

/**
 * Diagonal halftone — Ben-Day dots in a 60° offset pattern.
 */
function DotTone({
  width,
  height,
  dotSize = 1.5,
  spacing = 4,
  color = BLACK,
  opacity = 0.55,
}: {
  width: number;
  height: number;
  dotSize?: number;
  spacing?: number;
  color?: string;
  opacity?: number;
}) {
  const cols = Math.floor(width / spacing);
  const rows = Math.floor(height / spacing);
  const circles: React.ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * spacing + (r % 2 === 0 ? 0 : spacing / 2) + spacing / 2;
      const cy = r * spacing + spacing / 2;
      circles.push(
        React.createElement(Circle, {
          key: `${r}-${c}`,
          cx, cy, r: dotSize, fill: color,
        })
      );
    }
  }
  return React.createElement(
    Svg,
    { width, height, viewBox: `0 0 ${width} ${height}`, style: { opacity } },
    ...circles
  );
}

/**
 * 60° diagonal line tone — used for motion / wind / energy fields.
 */
function LineTone({
  width,
  height,
  spacing = 5,
  strokeWidth = 0.8,
  color = BLACK,
  opacity = 0.4,
  angle = 60,
}: {
  width: number;
  height: number;
  spacing?: number;
  strokeWidth?: number;
  color?: string;
  opacity?: number;
  angle?: number;
}) {
  // Compute parallel lines covering a (width x height) rect at the given angle.
  const diag = Math.sqrt(width * width + height * height);
  const n = Math.floor((diag * 2) / spacing);
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  // Perpendicular shift between lines
  const px = -dy;
  const py = dx;
  const lines: React.ReactElement[] = [];
  for (let i = -n / 2; i < n / 2; i++) {
    const ox = px * i * spacing + width / 2;
    const oy = py * i * spacing + height / 2;
    const x1 = ox - dx * diag;
    const y1 = oy - dy * diag;
    const x2 = ox + dx * diag;
    const y2 = oy + dy * diag;
    lines.push(
      React.createElement(SvgLine, {
        key: i,
        x1, y1, x2, y2,
        stroke: color,
        strokeWidth,
      })
    );
  }
  return React.createElement(
    Svg,
    { width, height, viewBox: `0 0 ${width} ${height}`, style: { opacity } },
    ...lines
  );
}

/**
 * Speed lines — clustered, varying-length parallel diagonals. Less
 * uniform than LineTone; designed to suggest motion / impact.
 */
function SpeedLines({
  width,
  height,
  count = 26,
  color = BLACK,
  strokeWidth = 1.2,
  opacity = 0.85,
  angle = 18,
}: {
  width: number;
  height: number;
  count?: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  angle?: number;
}) {
  const lines: React.ReactElement[] = [];
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  for (let i = 0; i < count; i++) {
    const seed = (i * 1.7) % 1;
    const lengthFrac = 0.35 + seed * 0.6;
    const yOff = (i / count) * height + ((i % 3) - 1) * 2;
    const len = width * lengthFrac;
    const startX = -10 + ((i * 5.3) % 12);
    lines.push(
      React.createElement(SvgLine, {
        key: i,
        x1: startX,
        y1: yOff,
        x2: startX + len * dx * 1.2,
        y2: yOff + len * dy * 1.2,
        stroke: color,
        strokeWidth: strokeWidth + (seed > 0.7 ? 0.6 : 0),
      })
    );
  }
  return React.createElement(
    Svg,
    { width, height, viewBox: `0 0 ${width} ${height}`, style: { opacity } },
    ...lines
  );
}

/**
 * Sun-ray burst — denser than RadialBurst, asymmetric jitter, optional
 * solid sun disc center.
 */
function SunRayBurst({
  size,
  rays = 28,
  innerRadius = 14,
  color = BLACK,
  strokeWidth = 1.4,
  withDisc = false,
  discFill = SUN_YELLOW,
}: {
  size: number;
  rays?: number;
  innerRadius?: number;
  color?: string;
  strokeWidth?: number;
  withDisc?: boolean;
  discFill?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const lines: React.ReactElement[] = [];
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    const seed = (i * 2.1) % 1;
    const lengthJitter = 0.65 + seed * 0.35;
    const r1 = innerRadius;
    const r2 = (size / 2) * lengthJitter;
    lines.push(
      React.createElement(SvgLine, {
        key: i,
        x1: cx + Math.cos(angle) * r1,
        y1: cy + Math.sin(angle) * r1,
        x2: cx + Math.cos(angle) * r2,
        y2: cy + Math.sin(angle) * r2,
        stroke: color,
        strokeWidth: strokeWidth + (seed > 0.7 ? 0.8 : 0),
      })
    );
  }
  return React.createElement(
    Svg,
    { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
    withDisc
      ? React.createElement(Circle, {
          cx, cy, r: innerRadius - 1,
          fill: discFill,
          stroke: color,
          strokeWidth,
        })
      : null,
    ...lines
  );
}

/**
 * Impact lines — V-burst radiating from a single corner.
 * Anchor: "tl" | "tr" | "bl" | "br".
 */
function ImpactLines({
  width,
  height,
  anchor = "tl",
  rays = 14,
  color = BLACK,
  strokeWidth = 1.2,
  opacity = 0.9,
}: {
  width: number;
  height: number;
  anchor?: "tl" | "tr" | "bl" | "br";
  rays?: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
}) {
  const ax = anchor.includes("r") ? width : 0;
  const ay = anchor.includes("b") ? height : 0;
  // Sweep is 90° from the corner outward into the panel.
  const baseAngle = anchor === "tl" ? 0 : anchor === "tr" ? 90 : anchor === "br" ? 180 : 270;
  const lines: React.ReactElement[] = [];
  for (let i = 0; i < rays; i++) {
    const t = i / (rays - 1);
    const angle = ((baseAngle + t * 90) * Math.PI) / 180;
    const seed = (i * 1.9) % 1;
    const len = (Math.max(width, height) * (0.7 + seed * 0.35));
    lines.push(
      React.createElement(SvgLine, {
        key: i,
        x1: ax,
        y1: ay,
        x2: ax + Math.cos(angle) * len,
        y2: ay + Math.sin(angle) * len,
        stroke: color,
        strokeWidth: strokeWidth + (i % 3 === 0 ? 0.5 : 0),
      })
    );
  }
  return React.createElement(
    Svg,
    { width, height, viewBox: `0 0 ${width} ${height}`, style: { opacity } },
    ...lines
  );
}

/**
 * JaggedBubble — manga shout-burst polygon (16-vertex zigzag).
 */
function JaggedBubble({
  width,
  height,
  fill = WHITE,
  stroke = BLACK,
  strokeWidth = 2.4,
}: {
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const cx = width / 2;
  const cy = height / 2;
  const outer = { x: width / 2 - strokeWidth, y: height / 2 - strokeWidth };
  const inner = { x: outer.x * 0.78, y: outer.y * 0.78 };
  const points: string[] = [];
  const spikes = 18;
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const useOuter = i % 2 === 0;
    const r = useOuter
      ? { x: outer.x, y: outer.y }
      : { x: inner.x, y: inner.y };
    const x = cx + Math.cos(angle) * r.x;
    const y = cy + Math.sin(angle) * r.y;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return React.createElement(
    Svg,
    {
      width, height, viewBox: `0 0 ${width} ${height}`,
      style: { position: "absolute", top: 0, left: 0 },
    },
    React.createElement(Polygon, {
      points: points.join(" "),
      fill, stroke, strokeWidth,
      strokeLinejoin: "miter",
    })
  );
}

/**
 * ThoughtBubble — primary cloud + 2 trailing dots.
 */
function ThoughtBubble({
  width,
  height,
  fill = WHITE,
  stroke = BLACK,
  strokeWidth = 2,
}: {
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const cloudH = height * 0.75;
  const r = Math.min(width / 6.5, cloudH / 3.2);
  const cy = cloudH / 2;
  const positions = [
    { cx: r * 1.0, cy: cy + r * 0.2, r: r * 0.95 },
    { cx: r * 2.4, cy: cy - r * 0.4, r: r * 1.15 },
    { cx: r * 4.0, cy: cy - r * 0.6, r: r * 1.25 },
    { cx: r * 5.6, cy: cy - r * 0.3, r: r * 1.1 },
    { cx: r * 6.6, cy: cy + r * 0.3, r: r * 0.9 },
    { cx: r * 5.0, cy: cy + r * 0.8, r: r * 1.05 },
    { cx: r * 2.8, cy: cy + r * 0.85, r: r * 1.0 },
  ];
  return React.createElement(
    Svg,
    {
      width, height, viewBox: `0 0 ${width} ${height}`,
      style: { position: "absolute", top: 0, left: 0 },
    },
    ...positions.map((p, i) =>
      React.createElement(Circle, {
        key: i, ...p, fill, stroke, strokeWidth,
      })
    ),
    React.createElement(Circle, {
      key: "t1", cx: r * 2.2, cy: cloudH + r * 0.7, r: r * 0.42,
      fill, stroke, strokeWidth,
    }),
    React.createElement(Circle, {
      key: "t2", cx: r * 1.5, cy: cloudH + r * 1.5, r: r * 0.26,
      fill, stroke, strokeWidth,
    })
  );
}

/**
 * Diagonal panel cut — used as an overlay strip that visually "slices"
 * a panel's bottom edge. Drawn as a black triangle on top of the panel.
 */
function DiagonalCut({
  width,
  height,
  side = "br",
  fill = BLACK,
}: {
  width: number;
  height: number;
  side?: "bl" | "br" | "tl" | "tr";
  fill?: string;
}) {
  const points =
    side === "br"
      ? `0,${height} ${width},${height} ${width},${height * 0.55}`
      : side === "bl"
        ? `0,${height} ${width},${height} 0,${height * 0.55}`
        : side === "tr"
          ? `${width},0 ${width},${height} ${width * 0.45},0`
          : `0,0 0,${height} ${width * 0.55},0`;
  return React.createElement(
    Svg,
    { width, height, viewBox: `0 0 ${width} ${height}` },
    React.createElement(Polygon, { points, fill })
  );
}

/* =====================================================================
 * Multi-layer SFX rendered as STYLED VIEWS (not SVG) so the manga font
 * is preserved. Uses 4 absolutely-positioned <Text> layers offset
 * slightly: shadow, outer-stroke, mid-stroke, fill.
 * ===================================================================== */
function MangaSfx({
  text,
  language,
  size = 36,
  rotate = -10,
  fillColor = CRIMSON,
  strokeColor = BLACK,
  shadowColor = "#222222",
  position,
}: {
  text: string;
  language: RuminantsLanguage;
  size?: number;
  rotate?: number;
  fillColor?: string;
  strokeColor?: string;
  shadowColor?: string;
  position: {
    top?: number; bottom?: number; left?: number; right?: number;
  };
}) {
  const baseStyle = {
    position: "absolute" as const,
    fontFamily: language === "ja" ? "Noto Sans JP" : "Noto Sans",
    fontSize: size,
    fontWeight: 700 as const,
    letterSpacing: -1,
    transform: `rotate(${rotate}deg)`,
    ...position,
  };
  // Layer offsets for chunky stacked effect
  const shadowOff = { top: position.top !== undefined ? position.top + 4 : undefined,
                      bottom: position.bottom !== undefined ? position.bottom - 4 : undefined,
                      left: position.left !== undefined ? position.left + 4 : undefined,
                      right: position.right !== undefined ? position.right - 4 : undefined };
  const strokeOff1 = { top: position.top !== undefined ? position.top + 1 : undefined,
                       bottom: position.bottom !== undefined ? position.bottom - 1 : undefined,
                       left: position.left !== undefined ? position.left + 1 : undefined,
                       right: position.right !== undefined ? position.right - 1 : undefined };
  return React.createElement(
    React.Fragment,
    null,
    // shadow
    React.createElement(
      Text,
      { style: { ...baseStyle, ...shadowOff, color: shadowColor, opacity: 0.6 } },
      text
    ),
    // outer stroke (offset 1px in 4 directions with the same color)
    React.createElement(
      Text,
      {
        style: {
          ...baseStyle,
          ...strokeOff1,
          color: strokeColor,
        },
      },
      text
    ),
    React.createElement(
      Text,
      {
        style: {
          ...baseStyle,
          top: position.top !== undefined ? position.top - 1 : undefined,
          bottom: position.bottom !== undefined ? position.bottom + 1 : undefined,
          left: position.left !== undefined ? position.left - 1 : undefined,
          right: position.right !== undefined ? position.right + 1 : undefined,
          color: strokeColor,
        },
      },
      text
    ),
    // white inner stroke
    React.createElement(
      Text,
      {
        style: {
          ...baseStyle,
          color: WHITE,
          // inset slightly via no offset; the stroke layers above bleed outside
        },
      },
      text
    ),
    // color fill, slightly inset
    React.createElement(
      Text,
      {
        style: {
          ...baseStyle,
          color: fillColor,
          opacity: 0.95,
          fontSize: size - 0.5,
          // fractional inset by font-size shrink
        },
      },
      text
    )
  );
}

/**
 * Page-number circle in the manga corner style ("P.1"/"P.2" inside a
 * black ring, traditionally bottom-outer corner of each page).
 */
function PageNumberMark({
  num,
  language,
  position,
}: {
  num: number;
  language: RuminantsLanguage;
  position: { bottom?: number; right?: number; left?: number };
}) {
  const label = language === "ja" ? `P.${num}` : `P.${num}`;
  return React.createElement(
    View,
    {
      style: {
        position: "absolute",
        ...position,
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2.6,
        borderColor: BLACK,
        backgroundColor: WHITE,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      },
    },
    React.createElement(
      Text,
      {
        style: {
          fontFamily: "Noto Sans",
          fontSize: 11,
          fontWeight: 700,
          color: BLACK,
          letterSpacing: 0.4,
        },
      },
      label
    )
  );
}

/**
 * Vertical Japanese caption strip — a column of single chars stacked
 * vertically with thin vertical rules to feel tategaki.
 */
function VerticalCaption({
  text,
  height,
  fontSize = 11,
  color = WHITE,
  background = BLACK,
}: {
  text: string;
  height: number;
  fontSize?: number;
  color?: string;
  background?: string;
}) {
  // Convert string into single-char rows
  const chars = Array.from(text).slice(0, Math.floor(height / (fontSize * 1.55)));
  return React.createElement(
    View,
    {
      style: {
        backgroundColor: background,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderLeftWidth: 2,
        borderLeftColor: CRIMSON,
        alignItems: "center",
        height,
      },
    },
    ...chars.map((ch, i) =>
      React.createElement(
        Text,
        {
          key: i,
          style: {
            fontFamily: "Noto Sans JP",
            fontSize,
            fontWeight: 700,
            color,
            letterSpacing: 0,
            lineHeight: 1.3,
          },
        },
        ch
      )
    )
  );
}

/* =====================================================================
 * Styles
 * ===================================================================== */
function styles(language: RuminantsLanguage) {
  const fontFamily = language === "ja" ? "Noto Sans JP" : "Noto Sans";
  const isJa = language === "ja";
  return StyleSheet.create({
    page: {
      fontFamily,
      backgroundColor: PAPER,
      color: INK,
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: 0,
      fontSize: 10,
      position: "relative",
    },

    /* ===== COVER (page 1) ===== */
    coverHeaderBar: {
      backgroundColor: BLACK,
      paddingTop: 12,
      paddingBottom: 12,
      paddingHorizontal: 24,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    coverHeaderEyebrow: {
      color: WHITE,
      fontSize: 8,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      fontWeight: 700,
    },
    rtlBadge: {
      color: WHITE,
      fontSize: 7,
      letterSpacing: 0.8,
      borderWidth: 1,
      borderColor: WHITE,
      paddingVertical: 2,
      paddingHorizontal: 6,
      marginRight: 8,
    },
    coverTitleStrip: {
      backgroundColor: BLACK,
      paddingHorizontal: 24,
      paddingTop: 14,
      paddingBottom: 32,
      borderBottomWidth: 6,
      borderBottomColor: CRIMSON,
      position: "relative",
      minHeight: isJa ? 158 : 130,
      // reserve right margin for vertical caption + issue stamp
      paddingRight: 130,
    },
    coverTitleJa: {
      color: WHITE,
      fontSize: isJa ? 56 : 50,
      fontWeight: 700,
      lineHeight: 1.04,
      letterSpacing: isJa ? -2 : -1,
    },
    coverTitleVerticalWrap: {
      position: "absolute",
      top: 14,
      bottom: 18,
      right: 88,
      width: 30,
      flexDirection: "row",
    },
    coverHook: {
      color: ORANGE,
      fontSize: 11,
      fontWeight: 700,
      marginTop: 14,
      letterSpacing: 0.4,
    },
    issueStamp: {
      position: "absolute",
      top: 14,
      right: 22,
      backgroundColor: CRIMSON,
      borderWidth: 2.4,
      borderColor: WHITE,
      paddingVertical: 6,
      paddingHorizontal: 10,
      transform: "rotate(-7deg)",
    },
    issueStampText: {
      color: WHITE,
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: 1,
      textAlign: "center",
    },

    // === HERO row — 2-column composition ===
    heroRow: {
      flexDirection: "row",
      marginHorizontal: 24,
      marginTop: 22,
      borderWidth: 4,
      borderColor: BLACK,
      backgroundColor: WHITE,
      position: "relative",
      overflow: "hidden",
      // (Don't set min/max height; let content drive it.)
    },
    heroRowInnerLine: {
      position: "absolute",
      top: 5,
      left: 5,
      right: 5,
      bottom: 5,
      borderWidth: 1,
      borderColor: BLACK,
      pointerEvents: "none",
    },
    heroLeft: {
      width: "55%",
      padding: 16,
      paddingRight: 12,
      position: "relative",
    },
    heroRight: {
      width: "45%",
      backgroundColor: PAPER_DEEP,
      borderLeftWidth: 3,
      borderLeftColor: BLACK,
      position: "relative",
      // contains the cow + tone + impact lines + sun rays
    },
    heroRightInner: {
      position: "relative",
      width: "100%",
      height: 220,
      alignItems: "center",
      justifyContent: "center",
    },
    heroRightDotLayer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroRightSunWrap: {
      position: "absolute",
      top: 8,
      right: 8,
      opacity: 0.85,
    },
    heroRightImpactWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroRightCowWrap: {
      position: "absolute",
      bottom: 12,
      left: 16,
      right: 16,
      alignItems: "center",
    },

    bubbleWrap: {
      position: "relative",
      alignSelf: "flex-start",
      marginBottom: 12,
    },
    bubbleSpeech: {
      borderWidth: 2.2,
      borderColor: BLACK,
      backgroundColor: WHITE,
      borderRadius: 18,
      paddingVertical: 8,
      paddingHorizontal: 14,
      maxWidth: "94%",
    },
    bubbleSpeechTail: {
      width: 10,
      height: 10,
      backgroundColor: WHITE,
      borderRightWidth: 2.2,
      borderBottomWidth: 2.2,
      borderColor: BLACK,
      transform: "rotate(45deg)",
      marginTop: -10,
      marginLeft: 28,
      marginBottom: 8,
    },
    bubbleVariantWrap: {
      position: "relative",
      width: "94%",
      height: 70,
      alignSelf: "flex-start",
      marginBottom: 12,
      justifyContent: "center",
    },
    bubbleVariantText: {
      position: "absolute",
      top: 24,
      left: 22,
      right: 22,
      fontSize: 10.5,
      fontWeight: 700,
      color: INK,
      textAlign: "center",
    },

    heroClaim: {
      fontSize: isJa ? 18 : 19,
      fontWeight: 700,
      color: INK,
      lineHeight: 1.22,
      marginBottom: 8,
    },
    heroEvidence: {
      fontSize: 9.5,
      color: INK,
      lineHeight: 1.55,
    },
    emphasisStamp: {
      position: "absolute",
      top: 12,
      left: 14,
      backgroundColor: CRIMSON,
      borderWidth: 2.5,
      borderColor: BLACK,
      paddingVertical: 6,
      paddingHorizontal: 10,
      transform: "rotate(-9deg)",
      zIndex: 5,
    },
    emphasisStampText: {
      color: WHITE,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 1,
    },


    // Tease block & footer
    coverTeaseBlock: {
      marginTop: 16,
      marginHorizontal: 24,
      backgroundColor: BLACK,
      paddingVertical: 12,
      paddingHorizontal: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 3,
      borderTopColor: CRIMSON,
    },
    coverTeaseText: {
      color: WHITE,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.4,
    },
    coverFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 14,
      paddingBottom: 18,
      marginTop: "auto",
      borderTopWidth: 1,
      borderColor: "#222222",
    },
    coverFooterLogo: { width: 68, height: 28, objectFit: "contain" },
    coverFooterCaption: { fontSize: 8, color: "#3A3A3A", lineHeight: 1.4, maxWidth: "70%" },

    /* ===== CONTENT (page 2) — splash with character + 3-stack ===== */
    contentTopBar: {
      backgroundColor: BLACK,
      paddingHorizontal: 24,
      paddingVertical: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 4,
      borderBottomColor: CRIMSON,
    },
    contentTopTitle: {
      color: WHITE,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    contentTopMeta: {
      color: WHITE,
      fontSize: 8,
      letterSpacing: 0.4,
      opacity: 0.7,
    },
    contentLayout: {
      flexDirection: "row",
      paddingHorizontal: 24,
      paddingTop: 14,
      paddingBottom: 8,
      gap: 12,
    },
    splashColumn: { width: "58%" },
    stackColumn: {
      width: "42%",
      flexDirection: "column",
      gap: 10,
    },

    splashPanel: {
      borderWidth: 4,
      borderColor: BLACK,
      backgroundColor: WHITE,
      padding: 14,
      flexGrow: 1,
      position: "relative",
      overflow: "hidden",
    },
    splashPanelBlack: {
      borderWidth: 4,
      borderColor: BLACK,
      backgroundColor: BLACK,
      padding: 14,
      flexGrow: 1,
      position: "relative",
      overflow: "hidden",
    },
    splashFarmerLayer: {
      position: "absolute",
      bottom: -10,
      right: -8,
      opacity: 0.92,
      // farmer sits behind text; text continues to be readable
    },
    splashLineToneLayer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 70,
      opacity: 0.35,
    },
    splashHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
      zIndex: 2,
    },
    splashIndex: {
      width: 26,
      height: 26,
      backgroundColor: CRIMSON,
      color: WHITE,
      fontSize: 13,
      fontWeight: 700,
      textAlign: "center",
      paddingTop: 5,
    },
    splashIndexBlack: {
      width: 26,
      height: 26,
      backgroundColor: WHITE,
      color: BLACK,
      fontSize: 13,
      fontWeight: 700,
      textAlign: "center",
      paddingTop: 5,
    },
    splashLabel: {
      fontSize: 9,
      fontWeight: 700,
      color: CYAN,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    splashLabelBlack: {
      fontSize: 9,
      fontWeight: 700,
      color: ORANGE,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    splashHeading: {
      fontSize: 16,
      fontWeight: 700,
      color: INK,
      lineHeight: 1.25,
      marginBottom: 8,
      zIndex: 2,
      // pull-quote feel
      borderLeftWidth: 3,
      borderLeftColor: CRIMSON,
      paddingLeft: 10,
    },
    splashHeadingBlack: {
      fontSize: 16,
      fontWeight: 700,
      color: WHITE,
      lineHeight: 1.25,
      marginBottom: 8,
      zIndex: 2,
      borderLeftWidth: 3,
      borderLeftColor: ORANGE,
      paddingLeft: 10,
    },
    splashBody: {
      fontSize: 10,
      color: INK,
      lineHeight: 1.6,
      zIndex: 2,
      maxWidth: "78%", // farmer takes the right slice
    },
    splashBodyBlack: {
      fontSize: 10,
      color: WHITE,
      lineHeight: 1.6,
      opacity: 0.92,
      zIndex: 2,
      maxWidth: "78%",
    },
    splashDiagonalCutLayer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 28,
      opacity: 0.95,
    },

    smallPanel: {
      borderWidth: 2.5,
      borderColor: BLACK,
      backgroundColor: WHITE,
      padding: 10,
      position: "relative",
    },
    smallPanelToneLayer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.18,
    },
    smallPanelHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginBottom: 4,
      zIndex: 2,
    },
    smallPanelIndex: {
      width: 18,
      height: 18,
      backgroundColor: CRIMSON,
      color: WHITE,
      fontSize: 9,
      fontWeight: 700,
      textAlign: "center",
      paddingTop: 4,
    },
    smallPanelLabel: {
      fontSize: 7,
      fontWeight: 700,
      color: CYAN,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    smallPanelHeading: {
      fontSize: 10.5,
      fontWeight: 700,
      color: INK,
      lineHeight: 1.3,
      marginBottom: 4,
      zIndex: 2,
    },
    smallPanelBody: {
      fontSize: 8.5,
      color: INK,
      lineHeight: 1.5,
      zIndex: 2,
    },
    statBox: {
      marginTop: 6,
      borderTopWidth: 1.5,
      borderColor: BLACK,
      paddingTop: 4,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      zIndex: 2,
    },
    statBurstWrap: {
      width: 32,
      height: 32,
      marginTop: 2,
    },
    statTextWrap: {
      flex: 1,
    },
    statValue: {
      fontSize: 26,
      fontWeight: 700,
      color: CRIMSON,
      letterSpacing: -0.5,
      lineHeight: 1.0,
    },
    statUnit: {
      fontSize: 7,
      color: "#3A3A3A",
      marginTop: 2,
      lineHeight: 1.3,
    },

    // Bottom CTA bar — kuro-koma stripe
    ctaBar: {
      marginHorizontal: 24,
      marginTop: 6,
      backgroundColor: BLACK,
      borderWidth: 3,
      borderColor: BLACK,
      padding: 14,
      flexDirection: "row",
      gap: 16,
      alignItems: "flex-start",
      position: "relative",
    },
    ctaCornerStamp: {
      position: "absolute",
      top: -10,
      right: 14,
      width: 96,
      backgroundColor: CRIMSON,
      borderWidth: 2,
      borderColor: WHITE,
      paddingVertical: 4,
      paddingHorizontal: 6,
      transform: "rotate(-4deg)",
      alignItems: "center",
      justifyContent: "center",
    },
    ctaCornerStampText: {
      color: WHITE,
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: 1,
      textAlign: "center",
    },
    ctaBlock: { flex: 1 },
    ctaLabel: {
      fontSize: 8,
      fontWeight: 700,
      color: ORANGE,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    ctaHeading: {
      fontSize: 14,
      fontWeight: 700,
      color: WHITE,
      lineHeight: 1.25,
      marginBottom: 6,
    },
    ctaBody: {
      fontSize: 9,
      color: WHITE,
      lineHeight: 1.55,
      opacity: 0.92,
    },
    ctaArrow: {
      fontSize: 26,
      fontWeight: 700,
      color: ORANGE,
      paddingTop: 14,
    },

    contentFooter: {
      backgroundColor: BLACK,
      paddingHorizontal: 24,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "auto",
    },
    contentFooterLogo: { width: 60, height: 24, objectFit: "contain" },
    contentFooterText: {
      color: WHITE,
      fontSize: 7,
      lineHeight: 1.5,
      maxWidth: "70%",
      textAlign: "right",
    },
  });
}

/* ---------------------------------------------------------------------
 * Cover bubble — pick variant by data.bubbleKind.
 * --------------------------------------------------------------------- */
function CoverBubble({
  text,
  kind,
  s,
  T,
}: {
  text: string;
  kind: "speech" | "shout" | "thought";
  s: ReturnType<typeof styles>;
  T: (text: string, style?: ReturnType<typeof StyleSheet.create>[string]) => React.ReactElement;
}) {
  if (kind === "shout") {
    return React.createElement(
      View,
      { style: s.bubbleVariantWrap },
      React.createElement(JaggedBubble, { width: 260, height: 70 }),
      T(text, s.bubbleVariantText)
    );
  }
  if (kind === "thought") {
    return React.createElement(
      View,
      { style: s.bubbleVariantWrap },
      React.createElement(ThoughtBubble, { width: 260, height: 70 }),
      T(text, s.bubbleVariantText)
    );
  }
  return React.createElement(
    View,
    { style: s.bubbleWrap },
    React.createElement(View, { style: s.bubbleSpeech }, T(text)),
    React.createElement(View, { style: s.bubbleSpeechTail })
  );
}

/* =====================================================================
 * COVER PAGE
 * ===================================================================== */
function CoverPage({
  data,
  s,
  logoSrc,
  T,
}: {
  data: RuminantsBrochureData;
  s: ReturnType<typeof styles>;
  logoSrc: string;
  T: (text: string, style?: ReturnType<typeof StyleSheet.create>[string]) => React.ReactElement;
}) {
  const isJa = data.language === "ja";
  const bubbleKind = data.bubbleKind ?? "speech";
  const campaign = ruminantsCampaigns.find((c) => c.id === data.campaignId);
  // The campaign.hook is JP-only; only use it when the brochure is JP.
  // EN renders fall back to a Latin-only "Feature — <topic>" line.
  const coverSubtitle = isJa
    ? (campaign?.hook ?? `特集 — ${data.topic.slice(0, 38)}`)
    : `Feature — ${data.topic.length > 48 ? data.topic.slice(0, 47) + "…" : data.topic}`;

  return React.createElement(
    Page,
    { size: "A4", style: s.page },

    // === Header bar ===
    React.createElement(
      View,
      { style: s.coverHeaderBar },
      T(data.coverEyebrow, s.coverHeaderEyebrow),
      React.createElement(
        View,
        { style: { flexDirection: "row", alignItems: "center" } },
        isJa
          ? React.createElement(
              View,
              { style: { flexDirection: "row", alignItems: "center" } },
              T("右開き / RTL", s.rtlBadge)
            )
          : null,
        T(data.issueBadge, {
          backgroundColor: CRIMSON,
          color: WHITE,
          fontSize: 8,
          fontWeight: 700,
          paddingVertical: 3,
          paddingHorizontal: 8,
          letterSpacing: 0.8,
        })
      )
    ),

    // === Black title strip — title + tagline; (JP-only) tategaki caption + rotated issue stamp float in the right margin ===
    React.createElement(
      View,
      { style: s.coverTitleStrip },
      T(data.coverTitle, s.coverTitleJa),
      T(coverSubtitle, s.coverHook),
      isJa
        ? React.createElement(
            View,
            { style: s.coverTitleVerticalWrap },
            React.createElement(VerticalCaption, {
              text: "ルミナンツAPAC",
              height: 126,
              fontSize: 9,
              color: WHITE,
              background: CRIMSON_DARK,
            })
          )
        : null,
      React.createElement(
        View,
        { style: s.issueStamp },
        T(isJa ? "VOL.04\n全12号" : "VOL.04\nof 12", s.issueStampText)
      )
    ),

    // === HERO ROW: 2-column composition (text left, illustrated panel right) ===
    React.createElement(
      View,
      { style: s.heroRow },
      // inner double-line frame
      React.createElement(View, { style: s.heroRowInnerLine }),

      // --- LEFT: text content + emphasis stamp ---
      React.createElement(
        View,
        { style: s.heroLeft },
        // Emphasis stamp (重要 / IMPACT)
        React.createElement(
          View,
          { style: s.emphasisStamp },
          T(data.emphasisStamp, s.emphasisStampText)
        ),
        // The bubble
        React.createElement(
          View,
          { style: { marginTop: 28 } },
          React.createElement(CoverBubble, {
            text: data.bubbleLine,
            kind: bubbleKind,
            s, T,
          })
        ),
        // Big claim
        T(data.heroClaim, s.heroClaim),
        // Supporting evidence
        T(data.heroEvidence, s.heroEvidence)
      ),

      // --- RIGHT: illustrated panel — cow + tone + sun + impact lines ---
      React.createElement(
        View,
        { style: s.heroRight },
        React.createElement(
          View,
          { style: s.heroRightInner },
          // Background dot tone
          React.createElement(
            View,
            { style: s.heroRightDotLayer },
            React.createElement(DotTone, {
              width: 230,
              height: 220,
              dotSize: 1.4,
              spacing: 4,
              color: BLACK,
              opacity: 0.32,
            })
          ),
          // Impact lines from top-left into the panel
          React.createElement(
            View,
            { style: s.heroRightImpactWrap },
            React.createElement(ImpactLines, {
              width: 230,
              height: 220,
              anchor: "tl",
              rays: 16,
              color: BLACK,
              strokeWidth: 1.1,
              opacity: 0.5,
            })
          ),
          // Sun-ray burst sitting in the top-right with a yellow disc
          React.createElement(
            View,
            { style: s.heroRightSunWrap },
            React.createElement(SunRayBurst, {
              size: 78,
              rays: 24,
              innerRadius: 14,
              color: BLACK,
              strokeWidth: 1.2,
              withDisc: true,
              discFill: SUN_YELLOW,
            })
          ),
          // Cow silhouette anchored to bottom of the right panel
          React.createElement(
            View,
            { style: s.heroRightCowWrap },
            React.createElement(CowSilhouette, {
              width: 200,
              height: 130,
              withSweat: true,
            })
          )
        ),

        // SFX overlapping bottom-right of the right panel
        data.coverSfx
          ? React.createElement(MangaSfx, {
              text: data.coverSfx,
              language: data.language,
              size: 42,
              rotate: -12,
              fillColor: CRIMSON,
              strokeColor: BLACK,
              shadowColor: "#222222",
              position: { bottom: -6, right: -10 },
            })
          : null
      )
    ),

    // === Tease block ===
    React.createElement(
      View,
      { style: s.coverTeaseBlock },
      T(data.coverTease, s.coverTeaseText),
      T("ADIPLAN AI", { color: ORANGE, fontSize: 9, fontWeight: 700, letterSpacing: 1 })
    ),

    // === Footer: logo + caption ===
    React.createElement(
      View,
      { style: s.coverFooter },
      React.createElement(Image, { src: logoSrc, style: s.coverFooterLogo }),
      T(data.contactLine, s.coverFooterCaption)
    ),

    // Page-number circle — sits ABOVE the footer in the right margin.
    React.createElement(PageNumberMark, {
      num: 1,
      language: data.language,
      position: { bottom: 88, right: 14 },
    })
  );
}

/* =====================================================================
 * CONTENT PAGE
 * ===================================================================== */
function ContentPage({
  data,
  s,
  logoSrc,
  T,
}: {
  data: RuminantsBrochureData;
  s: ReturnType<typeof styles>;
  logoSrc: string;
  T: (text: string, style?: ReturnType<typeof StyleSheet.create>[string]) => React.ReactElement;
}) {
  const panels = data.panels.slice(0, 4);
  const splash = panels[0];
  const stack = panels.slice(1);
  const isSplashBlack = splash?.blackPanel === true;

  return React.createElement(
    Page,
    { size: "A4", style: s.page },

    // Top bar
    React.createElement(
      View,
      { style: s.contentTopBar },
      T(
        data.language === "ja" ? "本編 / SPLASH + 3 STACK" : "MAIN STORY · SPLASH + 3 STACK",
        s.contentTopTitle
      ),
      T(data.issueBadge, s.contentTopMeta)
    ),

    // Asymmetric layout
    React.createElement(
      View,
      { style: s.contentLayout },

      // === Splash column (left, 58%) ===
      React.createElement(
        View,
        { style: s.splashColumn },
        splash
          ? React.createElement(
              View,
              { style: isSplashBlack ? s.splashPanelBlack : s.splashPanel },

              // Subtle line-tone band only at the very top edge of white
              // splash panels — gives the screentone "feel" without
              // obscuring the heading.
              !isSplashBlack
                ? React.createElement(
                    View,
                    {
                      style: {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 14,
                        opacity: 0.25,
                      },
                    },
                    React.createElement(LineTone, {
                      width: 320,
                      height: 14,
                      spacing: 3,
                      strokeWidth: 0.6,
                      angle: 60,
                      opacity: 0.7,
                    })
                  )
                : null,

              // Farmer silhouette in the bottom-right behind the text
              React.createElement(
                View,
                { style: s.splashFarmerLayer },
                React.createElement(FarmerSilhouette, {
                  width: 110,
                  height: 150,
                  fill: isSplashBlack ? "#1a1a1a" : "#222222",
                  opacity: isSplashBlack ? 0.55 : 0.18,
                })
              ),

              // Header
              React.createElement(
                View,
                { style: s.splashHeader },
                T("1", isSplashBlack ? s.splashIndexBlack : s.splashIndex),
                T(splash.label, isSplashBlack ? s.splashLabelBlack : s.splashLabel)
              ),
              T(splash.heading, isSplashBlack ? s.splashHeadingBlack : s.splashHeading),
              T(splash.body, isSplashBlack ? s.splashBodyBlack : s.splashBody),

              // Diagonal cut at the bottom — the manga "torn-edge" effect
              React.createElement(
                View,
                { style: s.splashDiagonalCutLayer },
                React.createElement(DiagonalCut, {
                  width: 320,
                  height: 28,
                  side: "br",
                  fill: isSplashBlack ? CRIMSON : BLACK,
                })
              ),

              // Splash SFX (if provided on panel 0)
              splash.sfx
                ? React.createElement(MangaSfx, {
                    text: splash.sfx,
                    language: data.language,
                    size: 28,
                    rotate: -10,
                    fillColor: ORANGE,
                    strokeColor: BLACK,
                    position: { bottom: 10, right: 14 },
                  })
                : null
            )
          : null
      ),

      // === Stack column (right, 42%) ===
      React.createElement(
        View,
        { style: s.stackColumn },
        ...stack.map((p, i) => {
          const idx = i + 2;
          const indexStyle = p.blackPanel
            ? [s.smallPanelIndex, { backgroundColor: WHITE, color: BLACK }]
            : s.smallPanelIndex;
          const labelStyle = p.blackPanel
            ? [s.smallPanelLabel, { color: ORANGE }]
            : s.smallPanelLabel;
          const headingStyle = p.blackPanel
            ? [s.smallPanelHeading, { color: WHITE }]
            : s.smallPanelHeading;
          const bodyStyle = p.blackPanel
            ? [s.smallPanelBody, { color: WHITE, opacity: 0.92 }]
            : s.smallPanelBody;
          const panelStyle = p.blackPanel
            ? [s.smallPanel, { backgroundColor: BLACK, borderColor: BLACK }]
            : s.smallPanel;

          // Per-panel tone variation kept restrained — only the TOP edge
          // gets a thin tone strip so body copy stays readable.
          const toneLayer =
            i === 0 && !p.blackPanel
              ? React.createElement(
                  View,
                  {
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 22,
                      opacity: 0.22,
                    },
                  },
                  React.createElement(SpeedLines, {
                    width: 200,
                    height: 22,
                    count: 8,
                    color: BLACK,
                    strokeWidth: 0.7,
                    opacity: 0.7,
                    angle: 14,
                  })
                )
              : i === 1 && !p.blackPanel
                ? React.createElement(
                    View,
                    {
                      style: {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 18,
                        opacity: 0.2,
                      },
                    },
                    React.createElement(DotTone, {
                      width: 200,
                      height: 18,
                      dotSize: 0.9,
                      spacing: 5,
                      color: BLACK,
                      opacity: 0.6,
                    })
                  )
                : null;

          return React.createElement(
            View,
            { key: idx, style: panelStyle },

            toneLayer,

            React.createElement(
              View,
              { style: s.smallPanelHeader },
              T(`${idx}`, indexStyle as ReturnType<typeof StyleSheet.create>[string]),
              T(p.label, labelStyle as ReturnType<typeof StyleSheet.create>[string])
            ),
            T(p.heading, headingStyle as ReturnType<typeof StyleSheet.create>[string]),
            T(p.body, bodyStyle as ReturnType<typeof StyleSheet.create>[string]),

            p.stat
              ? React.createElement(
                  View,
                  { style: s.statBox },
                  // Mini sun-ray burst behind the stat number
                  React.createElement(
                    View,
                    { style: s.statBurstWrap },
                    React.createElement(SunRayBurst, {
                      size: 32,
                      rays: 12,
                      innerRadius: 6,
                      color: p.blackPanel ? ORANGE : CRIMSON,
                      strokeWidth: 1.0,
                      withDisc: true,
                      discFill: p.blackPanel ? ORANGE : CRIMSON,
                    })
                  ),
                  React.createElement(
                    View,
                    { style: s.statTextWrap },
                    T(
                      p.stat.value,
                      p.blackPanel
                        ? ({ ...s.statValue, color: ORANGE } as ReturnType<typeof StyleSheet.create>[string])
                        : s.statValue
                    ),
                    T(
                      p.stat.unit,
                      p.blackPanel
                        ? ({ ...s.statUnit, color: WHITE, opacity: 0.7 } as ReturnType<typeof StyleSheet.create>[string])
                        : s.statUnit
                    )
                  )
                )
              : null,

            // Stack panel SFX — multi-layer, smaller scale
            p.sfx
              ? React.createElement(MangaSfx, {
                  text: p.sfx,
                  language: data.language,
                  size: 22,
                  rotate: -12,
                  fillColor: p.blackPanel ? ORANGE : CRIMSON,
                  strokeColor: p.blackPanel ? WHITE : BLACK,
                  position: { top: -14, right: -10 },
                })
              : null
          );
        })
      )
    ),

    // CTA bar (kuro-koma)
    React.createElement(
      View,
      { style: s.ctaBar },
      React.createElement(
        View,
        { style: s.ctaCornerStamp },
        T(data.language === "ja" ? "次の一歩" : "NEXT STEP", s.ctaCornerStampText)
      ),
      React.createElement(
        View,
        { style: s.ctaBlock },
        T(
          data.language === "ja" ? "Adisseo Ruminants APAC" : "Adisseo Ruminants APAC",
          s.ctaLabel
        ),
        T(data.ctaHeading, s.ctaHeading),
        T(data.ctaBody, s.ctaBody)
      ),
      T(">", s.ctaArrow)
    ),

    // Footer
    React.createElement(
      View,
      { style: s.contentFooter },
      React.createElement(Image, { src: logoSrc, style: s.contentFooterLogo }),
      T(data.citationLine, s.contentFooterText)
    ),

    // Page-number circle — sits ABOVE the footer in the left margin (manga reads RTL on JP).
    React.createElement(PageNumberMark, {
      num: 2,
      language: data.language,
      position: { bottom: 64, left: 14 },
    })
  );
}

function BrochureDocument({
  data,
  logoSrc,
}: {
  data: RuminantsBrochureData;
  logoSrc: string;
}) {
  const s = styles(data.language);
  const T = (text: string, style?: ReturnType<typeof StyleSheet.create>[string]) =>
    React.createElement(ScriptText, { text, language: data.language, style });
  return React.createElement(
    Document,
    null,
    CoverPage({ data, s, logoSrc, T }),
    ContentPage({ data, s, logoSrc, T })
  );
}

export async function POST(req: NextRequest) {
  ensureFonts();
  const body = (await req.json()) as {
    brochure?: RuminantsBrochureData;
    topic?: string;
    language?: RuminantsLanguage;
    audienceId?: string;
    campaignId?: string;
  };

  let data: RuminantsBrochureData;
  if (body.brochure) {
    data = body.brochure;
  } else {
    const audience =
      ruminantsAudiences.find((a) => a.id === body.audienceId) ??
      ruminantsAudiences[0];
    const campaign =
      ruminantsCampaigns.find((c) => c.id === body.campaignId) ??
      ruminantsCampaigns[0];
    data = deterministicBrochure(
      body.topic ?? campaign.topicSeed,
      (body.language as RuminantsLanguage) ?? "ja",
      audience.id,
      campaign.id
    );
  }

  const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
  const logoBuffer = fs.readFileSync(logoPath);
  const element = React.createElement(BrochureDocument, {
    data,
    logoSrc: logoBuffer as unknown as string,
  });
  const pdfBuffer = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0]
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="adisseo-ruminants-${data.language}.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
