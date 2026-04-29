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

const CRIMSON = "#A70A2D";
const CYAN = "#00A3C4";
const ORANGE = "#D97641";
const INK = "#1F252A";
const MUTED = "#6B7280";
const LINE = "#DEDEDE";
const BG = "#FBF9F9";

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
      paddingTop: 18,
      paddingBottom: 36,
      paddingHorizontal: 32,
    },
    crimsonBar: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: 8,
      backgroundColor: CRIMSON,
    },
    crimsonBarBottom: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 6,
      backgroundColor: CRIMSON,
    },
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
      fontSize: 8,
      letterSpacing: 1.2,
      color: CRIMSON,
      fontWeight: 700,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    magazineLine: { fontSize: 8, color: MUTED, letterSpacing: 0.6 },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: INK,
      marginTop: 4,
      marginBottom: 4,
      lineHeight: 1.15,
    },
    subtitle: { fontSize: 10, color: MUTED, marginBottom: 14, lineHeight: 1.35 },
    heroBox: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: LINE,
      paddingVertical: 12,
      marginBottom: 14,
    },
    heroLeft: {
      width: 6,
      backgroundColor: CRIMSON,
      marginRight: 12,
    },
    heroBody: { flex: 1 },
    heroClaim: {
      fontSize: 13,
      fontWeight: 700,
      color: INK,
      marginBottom: 6,
      lineHeight: 1.25,
    },
    heroEvidence: { fontSize: 9, color: MUTED, lineHeight: 1.45 },
    columns: {
      flexDirection: "row",
      gap: isThai ? 16 : 12,
      marginBottom: 14,
    },
    column: { flex: 1, minWidth: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0 },
    columnLabel: {
      fontSize: 8,
      letterSpacing: 1,
      color: CYAN,
      fontWeight: 700,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    columnHeading: {
      fontSize: 10,
      fontWeight: 700,
      color: INK,
      marginBottom: 4,
      lineHeight: 1.3,
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
      borderWidth: 1,
      borderColor: LINE,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    specLabel: {
      fontSize: 7,
      letterSpacing: 0.8,
      color: MUTED,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    specValue: { fontSize: 10, fontWeight: 700, color: INK },
    cta: {
      backgroundColor: CRIMSON,
      color: "white",
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 10,
      fontWeight: 700,
      marginBottom: 12,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderColor: LINE,
      paddingTop: 8,
      fontSize: 7,
      color: MUTED,
    },
    footerLeft: { maxWidth: "62%", lineHeight: 1.4 },
    footerRight: { textAlign: "right", maxWidth: "35%", lineHeight: 1.4 },
    accentDot: {
      width: 6,
      height: 6,
      backgroundColor: ORANGE,
      borderRadius: 3,
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
      React.createElement(View, { style: s.crimsonBar }),

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
        T(data.citationLine, s.footerRight)
      ),

      React.createElement(View, { style: s.crimsonBarBottom })
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
