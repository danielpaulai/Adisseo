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
 * Manga renderer for Antoine's 2-page Ruminants brochure.
 *
 * Visual language adapted from real Japanese paged-PDF manga reference
 * — most directly the libroworks/lw_manga_css Vivliostyle stylesheet,
 * BloomBooks/comical-js bubble taxonomy (speech / shout / thought), and
 * the asymmetric "splash + 3 stack" layout that Manga-Panel-LayoutGAN
 * produces as its modal output.
 *
 * Native to react-pdf — no rasterisation, no external SVG assets.
 * Manga moves implemented:
 *   1. Asymmetric panel grid (60/40 splash + 3-stack) instead of 2x2.
 *   2. Real Ben-Day halftone dots rendered as a programmatic <View> grid.
 *   3. Onomatopoeia / SFX text bleeding across panel borders.
 *   4. Three speech bubble variants — speech / shout (jagged) / thought (cloud).
 *   5. Kuro-koma — black-fill panel with reverse white text for emphasis.
 *   6. Radial action burst replacing horizontal speed lines.
 *   7. Issue stamp rotated -7° in the cover top-right.
 *   8. Reading-direction badge (右開き) on JP pages.
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
const CYAN = "#00A3C4";
const ORANGE = "#D97641";
const INK = "#0E1216";
const PAPER = "#FBF6EE"; // slightly cream — newsprint feel
const BLACK = "#000000";
const WHITE = "#FFFFFF";

/* ---------------------------------------------------------------------
 * ScriptText — Latin runs use Noto Sans (lighter), JP runs use Noto Sans JP.
 * Heuristic: only basic Latin (≤ U+024F) goes to Latin font; everything
 * else (kana, kanji, fullwidth, JP punctuation, arrows like →, ・, em-dash)
 * goes to the JP font, which has full coverage.
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

/* ---------------------------------------------------------------------
 * Halftone — programmatic Ben-Day dot grid.
 * Drawn as two interleaved grids of small filled circles inside a clipped
 * <View>. The classic manga halftone uses an offset / hex pattern, which
 * we approximate by alternating row offsets.
 * --------------------------------------------------------------------- */
function Halftone({
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
          cx,
          cy,
          r: dotSize,
          fill: color,
        })
      );
    }
  }
  return React.createElement(
    Svg,
    {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      style: { opacity },
    },
    ...circles
  );
}

/* ---------------------------------------------------------------------
 * RadialBurst — N rays radiating from a focal point.
 * Replaces the previous horizontal speed-line strip on the cover.
 * --------------------------------------------------------------------- */
function RadialBurst({
  size,
  rays = 16,
  innerRadius = 28,
  color = BLACK,
  strokeWidth = 1.4,
}: {
  size: number;
  rays?: number;
  innerRadius?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const lines: React.ReactElement[] = [];
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    // Vary length so it feels hand-drawn, not perfectly even.
    const lengthJitter = 0.78 + ((i * 1.7) % 1) * 0.22;
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
        strokeWidth,
      })
    );
  }
  return React.createElement(
    Svg,
    { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
    ...lines
  );
}

/* ---------------------------------------------------------------------
 * JaggedBubble — manga shout-burst polygon.
 * 16-vertex zigzag (alternating outer/inner radius) — the classic
 * "explosion" outline. Tail is implicit (the spikes themselves serve).
 * --------------------------------------------------------------------- */
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
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      style: { position: "absolute", top: 0, left: 0 },
    },
    React.createElement(Polygon, {
      points: points.join(" "),
      fill,
      stroke,
      strokeWidth,
      strokeLinejoin: "miter",
    })
  );
}

/* ---------------------------------------------------------------------
 * ThoughtBubble — primary cloud + 2 trailing dots.
 * --------------------------------------------------------------------- */
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
  // 7 overlapping circles forming a cloud — the cloud occupies the top
  // ~75% of the bounding box, with 2 small "thought trail" dots beneath.
  const cloudH = height * 0.75;
  const r = Math.min(width / 6.5, cloudH / 3.2);
  const cy = cloudH / 2;
  const positions: { cx: number; cy: number; r: number }[] = [
    { cx: r * 1.0, cy: cy + r * 0.2, r: r * 0.95 },
    { cx: r * 2.4, cy: cy - r * 0.4, r: r * 1.15 },
    { cx: r * 4.0, cy: cy - r * 0.6, r: r * 1.25 },
    { cx: r * 5.6, cy: cy - r * 0.3, r: r * 1.1 },
    { cx: r * 6.6, cy: cy + r * 0.3, r: r * 0.9 },
    { cx: r * 5.0, cy: cy + r * 0.8, r: r * 1.05 },
    { cx: r * 2.8, cy: cy + r * 0.85, r: r * 1.0 },
  ];
  const trailDot1 = { cx: r * 2.2, cy: cloudH + r * 0.7, r: r * 0.42 };
  const trailDot2 = { cx: r * 1.5, cy: cloudH + r * 1.5, r: r * 0.26 };
  return React.createElement(
    Svg,
    {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      style: { position: "absolute", top: 0, left: 0 },
    },
    ...positions.map((p, i) =>
      React.createElement(Circle, {
        key: i,
        cx: p.cx,
        cy: p.cy,
        r: p.r,
        fill,
        stroke,
        strokeWidth,
      })
    ),
    React.createElement(Circle, {
      key: "t1",
      ...trailDot1,
      fill,
      stroke,
      strokeWidth,
    }),
    React.createElement(Circle, {
      key: "t2",
      ...trailDot2,
      fill,
      stroke,
      strokeWidth,
    })
  );
}

/* ---------------------------------------------------------------------
 * Styles
 * --------------------------------------------------------------------- */
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
      paddingTop: 4,
      paddingBottom: 36,
      borderBottomWidth: 6,
      borderBottomColor: CRIMSON,
      position: "relative",
    },
    coverTitleJa: {
      color: WHITE,
      fontSize: isJa ? 64 : 56,
      fontWeight: 700,
      lineHeight: 1.05,
      letterSpacing: isJa ? 0 : -1,
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
      top: 12,
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

    heroPanel: {
      marginHorizontal: 24,
      marginTop: 22,
      borderWidth: 4,
      borderColor: BLACK,
      backgroundColor: WHITE,
      padding: 20,
      position: "relative",
      // Inner double-border feel — using outline-like padding.
      // (Real outline=double isn't supported by react-pdf, so we fake it
      // with a wrapping container in the render fn.)
    },
    heroPanelInnerLine: {
      position: "absolute",
      top: 5,
      left: 5,
      right: 5,
      bottom: 5,
      borderWidth: 1,
      borderColor: BLACK,
    },
    heroHalftoneTopRight: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 150,
      height: 150,
      borderLeftWidth: 4,
      borderBottomWidth: 4,
      borderColor: BLACK,
      backgroundColor: WHITE,
      overflow: "hidden",
    },
    heroBurstWrap: {
      position: "absolute",
      top: 8,
      right: 8,
    },
    bubbleWrap: {
      position: "relative",
      alignSelf: "flex-start",
      marginBottom: 14,
    },
    bubbleSpeech: {
      borderWidth: 2.2,
      borderColor: BLACK,
      backgroundColor: WHITE,
      borderRadius: 18,
      paddingVertical: 8,
      paddingHorizontal: 14,
      maxWidth: "75%",
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
      width: 280,
      height: 78,
      alignSelf: "flex-start",
      marginBottom: 14,
      justifyContent: "center",
    },
    bubbleVariantText: {
      position: "absolute",
      top: 26,
      left: 22,
      right: 22,
      fontSize: 11,
      fontWeight: 700,
      color: INK,
      textAlign: "center",
    },

    heroClaim: {
      fontSize: isJa ? 22 : 24,
      fontWeight: 700,
      color: INK,
      lineHeight: 1.2,
      marginBottom: 10,
      maxWidth: "78%",
    },
    heroEvidence: {
      fontSize: 10,
      color: INK,
      lineHeight: 1.55,
      maxWidth: "78%",
    },
    emphasisStamp: {
      // Sit BELOW the halftone tile (which occupies top-right 0..150px)
      // and to the LEFT of it so the stamp doesn't get hidden.
      position: "absolute",
      top: 158,
      right: 22,
      backgroundColor: CRIMSON,
      borderWidth: 2.5,
      borderColor: BLACK,
      paddingVertical: 8,
      paddingHorizontal: 14,
      transform: "rotate(-9deg)",
      zIndex: 5,
    },
    emphasisStampText: {
      color: WHITE,
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: 1,
    },

    // SFX — bleeds across the right edge of the hero panel.
    coverSfx: {
      position: "absolute",
      bottom: -8,
      right: -16,
      fontSize: 38,
      fontWeight: 700,
      color: CRIMSON,
      transform: "rotate(-12deg)",
      letterSpacing: -1,
    },
    coverSfxStroke: {
      position: "absolute",
      bottom: -7,
      right: -15,
      fontSize: 38,
      fontWeight: 700,
      color: BLACK,
      transform: "rotate(-12deg)",
      letterSpacing: -1,
      opacity: 0.85,
      // Faux "outline" — the stroke layer sits a hair above & is clipped
      // by the crimson layer in front. Cheap but effective.
    },

    coverTeaseBlock: {
      marginTop: 22,
      marginHorizontal: 24,
      backgroundColor: BLACK,
      paddingVertical: 12,
      paddingHorizontal: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    coverFooterCaption: { fontSize: 8, color: "#3A3A3A", lineHeight: 1.4 },

    /* ===== CONTENT (page 2) — asymmetric splash + 3-stack ===== */
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
    splashHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
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
    },
    splashHeadingBlack: {
      fontSize: 16,
      fontWeight: 700,
      color: WHITE,
      lineHeight: 1.25,
      marginBottom: 8,
    },
    splashBody: {
      fontSize: 10,
      color: INK,
      lineHeight: 1.6,
    },
    splashBodyBlack: {
      fontSize: 10,
      color: WHITE,
      lineHeight: 1.6,
      opacity: 0.92,
    },
    splashHalftoneStrip: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 70,
      borderTopWidth: 2,
      borderTopColor: BLACK,
      overflow: "hidden",
    },

    smallPanel: {
      borderWidth: 2.5,
      borderColor: BLACK,
      backgroundColor: WHITE,
      padding: 10,
      // No flex: 1 — let panels size to content. Equal-height flex
      // crops JP body copy that needs more vertical room than the
      // shortest panel.
      position: "relative",
      // overflow:"hidden" was ALSO clipping JP text. Drop it.
    },
    smallPanelHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginBottom: 4,
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
    },
    smallPanelBody: {
      fontSize: 8.5,
      color: INK,
      lineHeight: 1.5,
    },
    statBox: {
      marginTop: 6,
      borderTopWidth: 1.5,
      borderColor: BLACK,
      paddingTop: 4,
    },
    statValue: {
      fontSize: 26,
      fontWeight: 700,
      color: CRIMSON,
      letterSpacing: -0.5,
    },
    statUnit: {
      fontSize: 7,
      color: "#3A3A3A",
      marginTop: 2,
      lineHeight: 1.3,
    },
    panelSfx: {
      // Bleed outside the panel's top-right corner — manga signature.
      // The parent panel no longer has overflow:hidden so we can poke past.
      position: "absolute",
      top: -16,
      right: -14,
      fontSize: 22,
      fontWeight: 700,
      color: CRIMSON,
      transform: "rotate(-12deg)",
      letterSpacing: -0.5,
    },

    // Bottom CTA bar — a black-fill kuro-koma stripe, full width.
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
      // Fixed width prevents JP from wrapping char-by-char vertically.
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
      React.createElement(JaggedBubble, { width: 280, height: 78 }),
      T(text, s.bubbleVariantText)
    );
  }
  if (kind === "thought") {
    return React.createElement(
      View,
      { style: s.bubbleVariantWrap },
      React.createElement(ThoughtBubble, { width: 280, height: 78 }),
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

/* ---------------------------------------------------------------------
 * Pages
 * --------------------------------------------------------------------- */
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
  // Localised orange subtitle: prefer the campaign hook (already in the
  // right language) over the raw topic string (which is often English).
  const campaign = ruminantsCampaigns.find((c) => c.id === data.campaignId);
  const coverSubtitle = campaign
    ? campaign.hook
    : isJa
      ? `特集 — ${data.topic.slice(0, 38)}`
      : `Feature — ${data.topic.slice(0, 60)}`;
  return React.createElement(
    Page,
    { size: "A4", style: s.page },

    // Header bar with RTL hint for JP
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

    // Black title strip with rotated issue stamp
    React.createElement(
      View,
      { style: s.coverTitleStrip },
      T(data.coverTitle, s.coverTitleJa),
      // Small orange tagline below the title — uses the campaign hook
      // (already localised) so it stays JP in JP mode and doesn't
      // duplicate the bubble line shown big inside the hero panel.
      T(coverSubtitle, s.coverHook),
      React.createElement(
        View,
        { style: s.issueStamp },
        T(isJa ? "VOL.04\n全12号" : "VOL.04\nof 12", s.issueStampText)
      )
    ),

    // Hero panel: bubble (kind-aware) + claim + evidence + halftone TR + radial burst + emphasis stamp + SFX
    React.createElement(
      View,
      { style: s.heroPanel },
      // inner double-line
      React.createElement(View, { style: s.heroPanelInnerLine }),

      // Halftone tile in the top-right corner
      React.createElement(
        View,
        { style: s.heroHalftoneTopRight },
        React.createElement(Halftone, {
          width: 150,
          height: 150,
          dotSize: 1.6,
          spacing: 5,
          opacity: 0.7,
        })
      ),
      // Radial burst sitting just inside the halftone tile
      React.createElement(
        View,
        { style: s.heroBurstWrap },
        React.createElement(RadialBurst, {
          size: 130,
          rays: 18,
          innerRadius: 30,
          color: BLACK,
          strokeWidth: 1.6,
        })
      ),

      // Emphasis stamp ("重要" / "IMPACT")
      React.createElement(
        View,
        { style: s.emphasisStamp },
        T(data.emphasisStamp, s.emphasisStampText)
      ),

      // The bubble
      React.createElement(CoverBubble, {
        text: data.bubbleLine,
        kind: bubbleKind,
        s,
        T,
      }),

      // Big claim
      T(data.heroClaim, s.heroClaim),
      // Supporting evidence
      T(data.heroEvidence, s.heroEvidence),

      // Cover SFX — onomatopoeia bleeding across the bottom-right edge
      data.coverSfx
        ? React.createElement(
            React.Fragment,
            null,
            T(data.coverSfx, s.coverSfxStroke),
            T(data.coverSfx, s.coverSfx)
          )
        : null
    ),

    // Tease block
    React.createElement(
      View,
      { style: s.coverTeaseBlock },
      T(data.coverTease, s.coverTeaseText),
      T("ADIPLAN AI", { color: ORANGE, fontSize: 9, fontWeight: 700, letterSpacing: 1 })
    ),

    // Footer: logo + caption
    React.createElement(
      View,
      { style: s.coverFooter },
      React.createElement(Image, { src: logoSrc, style: s.coverFooterLogo }),
      T(data.contactLine, s.coverFooterCaption)
    )
  );
}

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
  // The splash is panel 0 (the dramatic "challenge" panel).
  // Panels 1, 2, 3 stack on the right — panel 2 typically is the stat panel.
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
              React.createElement(
                View,
                { style: s.splashHeader },
                T("1", isSplashBlack ? s.splashIndexBlack : s.splashIndex),
                T(splash.label, isSplashBlack ? s.splashLabelBlack : s.splashLabel)
              ),
              T(splash.heading, isSplashBlack ? s.splashHeadingBlack : s.splashHeading),
              T(splash.body, isSplashBlack ? s.splashBodyBlack : s.splashBody),

              // Halftone strip at the bottom of the splash for atmosphere.
              !isSplashBlack
                ? React.createElement(
                    View,
                    { style: s.splashHalftoneStrip },
                    React.createElement(Halftone, {
                      width: 320,
                      height: 70,
                      dotSize: 1.4,
                      spacing: 4,
                      opacity: 0.5,
                    })
                  )
                : null,

              // Splash SFX (if provided on panel 0)
              splash.sfx
                ? T(splash.sfx, {
                    position: "absolute",
                    bottom: 8,
                    right: 14,
                    fontSize: 26,
                    fontWeight: 700,
                    color: CRIMSON,
                    transform: "rotate(-8deg)",
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
          const idx = i + 2; // panel numbers 2, 3, 4
          const indexStyle = p.blackPanel
            ? [
                s.smallPanelIndex,
                { backgroundColor: WHITE, color: BLACK },
              ]
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

          return React.createElement(
            View,
            { key: idx, style: panelStyle },

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
                  T(
                    p.stat.value,
                    p.blackPanel
                      ? ({ ...s.statValue, color: ORANGE } as ReturnType<
                          typeof StyleSheet.create
                        >[string])
                      : s.statValue
                  ),
                  T(
                    p.stat.unit,
                    p.blackPanel
                      ? ({ ...s.statUnit, color: WHITE, opacity: 0.7 } as ReturnType<
                          typeof StyleSheet.create
                        >[string])
                      : s.statUnit
                  )
                )
              : null,

            p.sfx ? T(p.sfx, s.panelSfx) : null
          );
        })
      )
    ),

    // CTA bar (kuro-koma) — full width, dramatic
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
    )
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
