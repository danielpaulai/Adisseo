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
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";
import {
  aquaMagazines,
  deterministicLeaflet,
  type AquaLanguage,
  type AquaLeafletData,
} from "@/lib/aqua-leaflet";
import { herubel } from "@/lib/design-system-herubel";

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
  Font.register({
    family: "Noto Sans Thai",
    fonts: [
      { src: path.join(fontDir, "NotoSansThai-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontDir, "NotoSansThai-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

// Hérubel design tokens (lib/design-system-herubel.ts).
const P = herubel.palette;
const T = herubel.type;
const CRIMSON = P.accent;
const INK = P.ink;
const MUTED = P.inkSoft;
const LINE = P.line;
const BG = P.surface;
const BLOCK = P.blockTint;
const ACCENT2 = P.accent2;

/**
 * For Thai pages, the standalone NotoSansThai TTF only contains Thai glyphs.
 * Latin substrings (e.g. "Adisseo", "WSSV", "FCR") need to be re-routed to the
 * Noto Sans Latin font, segment by segment.
 */
function MultiScriptText({
  text,
  language,
  style,
}: {
  text: string;
  language: AquaLanguage;
  style?: ReturnType<typeof StyleSheet.create>[string];
}) {
  if (language !== "th" || !text) {
    return React.createElement(Text, { style }, text);
  }
  const segments: { text: string; thai: boolean }[] = [];
  let buf = "";
  let cur: boolean | null = null;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    const isThai = code >= 0x0e00 && code <= 0x0e7f;
    if (cur === null) cur = isThai;
    if (isThai !== cur) {
      segments.push({ text: buf, thai: cur });
      buf = "";
      cur = isThai;
    }
    buf += ch;
  }
  if (buf) segments.push({ text: buf, thai: cur ?? false });
  return React.createElement(
    Text,
    { style },
    ...segments.map((s, i) =>
      React.createElement(
        Text,
        {
          key: i,
          style: { fontFamily: s.thai ? "Noto Sans Thai" : "Noto Sans" },
        },
        s.text
      )
    )
  );
}

function styles(language: AquaLanguage) {
  const fontFamily = language === "th" ? "Noto Sans Thai" : "Noto Sans";
  const isThai = language === "th";
  return StyleSheet.create({
    page: {
      fontFamily,
      fontSize: isThai ? 8 : 9,
      color: INK,
      backgroundColor: BG,
      paddingTop: 28,
      paddingBottom: 36,
      paddingLeft: 44,
      paddingRight: 32,
    },
    // Hérubel: thick left rule replaces the top/bottom band.
    accentRule: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 12,
      backgroundColor: CRIMSON,
    },
    crimsonBar: { display: "none" },
    crimsonBarBottom: { display: "none" },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: 18,
      marginBottom: 14,
    },
    logo: { width: 78, height: 32, objectFit: "contain" },
    headerRight: { textAlign: "right" },
    eyebrow: {
      fontSize: T.eyebrow.size,
      letterSpacing: T.eyebrow.letterSpacing,
      color: CRIMSON,
      fontWeight: T.eyebrow.weight,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    magazineLine: {
      fontSize: T.signature.size,
      color: MUTED,
      letterSpacing: T.signature.letterSpacing,
      fontWeight: T.signature.weight,
      textTransform: "uppercase",
    },
    title: {
      fontSize: 30,
      fontWeight: 900,
      color: INK,
      marginTop: 6,
      marginBottom: 6,
      lineHeight: 1.06,
      letterSpacing: -0.6,
    },
    subtitle: {
      fontSize: T.body.size,
      color: MUTED,
      marginBottom: 16,
      lineHeight: T.body.lineHeight,
    },
    heroBox: {
      flexDirection: "row",
      backgroundColor: INK,
      paddingVertical: 16,
      paddingHorizontal: 18,
      marginBottom: 16,
    },
    heroLeft: { display: "none" },
    heroBody: { flex: 1 },
    heroClaim: {
      fontSize: 16,
      fontWeight: 800,
      color: BG,
      marginBottom: 6,
      lineHeight: 1.18,
      letterSpacing: -0.2,
    },
    heroEvidence: {
      fontSize: T.body.size,
      color: BG,
      lineHeight: T.body.lineHeight,
      opacity: 0.86,
    },
    columns: {
      flexDirection: "row",
      gap: isThai ? 16 : 12,
      marginBottom: 16,
    },
    column: {
      flex: 1,
      minWidth: 0,
      flexShrink: 1,
      flexGrow: 1,
      flexBasis: 0,
      backgroundColor: BLOCK,
      paddingVertical: 10,
      paddingHorizontal: 11,
    },
    columnLabel: {
      fontSize: T.eyebrow.size,
      letterSpacing: T.eyebrow.letterSpacing,
      color: ACCENT2,
      fontWeight: T.eyebrow.weight,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    columnHeading: {
      fontSize: 11,
      fontWeight: 800,
      color: INK,
      marginBottom: 4,
      lineHeight: 1.25,
      letterSpacing: -0.1,
    },
    columnBody: {
      fontSize: isThai ? 8 : 9,
      color: INK,
      lineHeight: isThai ? 1.65 : 1.5,
    },
    specs: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 14,
    },
    specBox: {
      flex: 1,
      backgroundColor: INK,
      paddingVertical: 10,
      paddingHorizontal: 11,
    },
    specLabel: {
      fontSize: T.signature.size,
      letterSpacing: T.signature.letterSpacing,
      color: BG,
      fontWeight: T.signature.weight,
      textTransform: "uppercase",
      marginBottom: 4,
      opacity: 0.7,
    },
    specValue: {
      fontSize: 13,
      fontWeight: 800,
      color: BG,
      letterSpacing: -0.1,
    },
    cta: {
      backgroundColor: CRIMSON,
      color: "white",
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: T.bodyBold.size,
      fontWeight: T.bodyBold.weight,
      marginBottom: 14,
      letterSpacing: 0.2,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderColor: LINE,
      paddingTop: 8,
      fontSize: T.signature.size,
      color: MUTED,
    },
    footerLeft: { maxWidth: "62%", lineHeight: 1.4 },
    footerRight: {
      textAlign: "right",
      maxWidth: "35%",
      lineHeight: 1.4,
      fontSize: T.signature.size,
      fontWeight: T.signature.weight,
      letterSpacing: T.signature.letterSpacing,
      textTransform: "uppercase",
    },
    accentDot: {
      width: 6,
      height: 6,
      backgroundColor: ACCENT2,
      marginHorizontal: 6,
    },
  });
}

function LeafletDocument({
  data,
  magazineName,
  logoSrc,
}: {
  data: AquaLeafletData;
  magazineName: string;
  logoSrc: string;
}) {
  const s = styles(data.language);
  const lang = data.language;
  const T = (text: string, style?: ReturnType<typeof StyleSheet.create>[string]) =>
    React.createElement(MultiScriptText, { text, language: lang, style });

  return React.createElement(
    Document,
    null,
      React.createElement(
      Page,
      { size: "A4", style: s.page },
      React.createElement(View, { style: s.accentRule }),

      React.createElement(
        View,
        { style: s.header },
        React.createElement(Image, { src: logoSrc, style: s.logo }),
        React.createElement(
          View,
          { style: s.headerRight },
          T(data.eyebrow, s.eyebrow),
          T(magazineName, s.magazineLine)
        )
      ),

      T(data.title, s.title),
      T(data.subtitle, s.subtitle),

      React.createElement(
        View,
        { style: s.heroBox },
        React.createElement(View, { style: s.heroLeft }),
        React.createElement(
          View,
          { style: s.heroBody },
          T(data.heroClaim, s.heroClaim),
          T(data.heroEvidence, s.heroEvidence)
        )
      ),

      React.createElement(
        View,
        { style: s.columns },
        ...data.sections.slice(0, 3).map((sec, i) =>
          React.createElement(
            View,
            { style: s.column, key: i },
            T(sec.label, s.columnLabel),
            T(sec.heading, s.columnHeading),
            T(sec.body, s.columnBody)
          )
        )
      ),

      React.createElement(
        View,
        { style: s.specs },
        ...data.specs.slice(0, 4).map((spec, i) =>
          React.createElement(
            View,
            { style: s.specBox, key: i },
            T(spec.label, s.specLabel),
            T(spec.value, s.specValue)
          )
        )
      ),

      T(data.cta, s.cta),

      React.createElement(
        View,
        { style: s.footer },
        T(data.contactLine, s.footerLeft),
        T(herubel.brand.signature, s.footerRight)
      )
    )
  );
}

export async function POST(req: NextRequest) {
  ensureFonts();
  const body = (await req.json()) as {
    leaflet?: AquaLeafletData;
    topic?: string;
    language?: AquaLanguage;
    magazineId?: string;
  };

  let data: AquaLeafletData;
  let magazineId = body.magazineId ?? body.leaflet?.magazineId ?? "mag-en-asia";
  if (body.leaflet) {
    data = body.leaflet;
    magazineId = body.leaflet.magazineId ?? magazineId;
  } else {
    data = deterministicLeaflet(
      body.topic ?? "Pangasius hepatopancreas resilience",
      (body.language as AquaLanguage) ?? "en",
      magazineId
    );
  }

  const magazine = aquaMagazines.find((m) => m.id === magazineId) ?? aquaMagazines[3];
  const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
  const logoBuffer = fs.readFileSync(logoPath);
  // react-pdf accepts a Node Buffer in src
  const element = React.createElement(LeafletDocument, {
    data,
    magazineName: `${magazine.name} · ${magazine.country}`,
    logoSrc: logoBuffer as unknown as string,
  });
  // react-pdf's element typing for renderToBuffer is narrow; cast at the boundary.
  const pdfBuffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="adisseo-aqua-leaflet-${data.language}.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
