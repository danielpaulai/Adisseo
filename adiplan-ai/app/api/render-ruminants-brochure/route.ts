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
  deterministicBrochure,
  ruminantsAudiences,
  ruminantsCampaigns,
  type RuminantsBrochureData,
  type RuminantsLanguage,
} from "@/lib/ruminants-brochure";

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
    family: "Noto Sans JP",
    fonts: [
      { src: path.join(fontDir, "NotoSansJP-Regular.otf"), fontWeight: 400 },
      { src: path.join(fontDir, "NotoSansJP-Bold.otf"), fontWeight: 700 },
    ],
  });
  // Disable hyphenation — bad for JP and our Latin layouts.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const CRIMSON = "#A70A2D";
const CYAN = "#00A3C4";
const ORANGE = "#D97641";
const INK = "#0E1216";
const PAPER = "#FBF6EE"; // slightly cream — manga-page feel
const HALFTONE = "#E5DED1";
const BLACK = "#000000";

/**
 * For JP pages, the JP OTF supplies Japanese glyphs. Latin substrings
 * (e.g. "Adisseo", "RP-Met", "+0.7") render fine via the JP font
 * (it includes Latin proportional glyphs), but the JP font's Latin
 * is heavier and reads worse than Noto Sans for English-only lines —
 * so we segment the text by script and route Latin spans to Noto Sans.
 */
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
  // Heuristic: only ASCII basic-Latin characters are safe to route to Noto Sans
  // Latin. Anything else (kana, kanji, fullwidth forms, JP punctuation,
  // arrows like "→", em-dashes, "・", etc.) goes through the CJK JP font.
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    const isLatin = code <= 0x024f;
    const useJP = !isLatin;
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
      fontSize: isJa ? 10 : 10,
    },
    // ===== Cover (page 1) =====
    coverHeaderBar: {
      backgroundColor: BLACK,
      paddingTop: 14,
      paddingBottom: 14,
      paddingHorizontal: 24,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    coverHeaderEyebrow: {
      color: "#FFFFFF",
      fontSize: 8,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontWeight: 700,
    },
    issueBadge: {
      backgroundColor: CRIMSON,
      color: "#FFFFFF",
      fontSize: 8,
      fontWeight: 700,
      paddingVertical: 3,
      paddingHorizontal: 8,
      letterSpacing: 0.8,
    },
    coverTitleStrip: {
      backgroundColor: BLACK,
      paddingHorizontal: 24,
      paddingTop: 4,
      paddingBottom: 36,
      borderBottomWidth: 6,
      borderBottomColor: CRIMSON,
    },
    coverTitleJa: {
      color: "#FFFFFF",
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
    heroPanel: {
      marginHorizontal: 24,
      marginTop: 20,
      borderWidth: 3,
      borderColor: BLACK,
      backgroundColor: "#FFFFFF",
      padding: 22,
      position: "relative",
    },
    heroPanelHalftone: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 130,
      height: 130,
      backgroundColor: HALFTONE,
      borderLeftWidth: 3,
      borderBottomWidth: 3,
      borderColor: BLACK,
    },
    bubble: {
      borderWidth: 2.2,
      borderColor: BLACK,
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      paddingVertical: 8,
      paddingHorizontal: 14,
      alignSelf: "flex-start",
      marginBottom: 14,
      maxWidth: "80%",
    },
    bubbleText: {
      fontSize: 11,
      fontWeight: 700,
      color: INK,
    },
    // small triangular "tail" under the speech bubble
    bubbleTail: {
      width: 10,
      height: 10,
      backgroundColor: "#FFFFFF",
      borderRightWidth: 2.2,
      borderBottomWidth: 2.2,
      borderColor: BLACK,
      transform: "rotate(45deg)",
      marginTop: -10,
      marginLeft: 28,
      marginBottom: 8,
    },
    heroClaim: {
      fontSize: isJa ? 22 : 24,
      fontWeight: 700,
      color: INK,
      lineHeight: 1.2,
      marginBottom: 10,
      maxWidth: "82%",
    },
    heroEvidence: {
      fontSize: 10,
      color: INK,
      lineHeight: 1.55,
      maxWidth: "82%",
    },
    emphasisStamp: {
      position: "absolute",
      top: 14,
      right: 18,
      backgroundColor: CRIMSON,
      borderWidth: 2.5,
      borderColor: BLACK,
      paddingVertical: 8,
      paddingHorizontal: 14,
      transform: "rotate(-9deg)",
    },
    emphasisStampText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: 1,
    },
    speedLines: {
      position: "absolute",
      bottom: 14,
      right: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    speedLine: { height: 2, backgroundColor: BLACK },
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
      color: "#FFFFFF",
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

    // ===== Content (page 2) =====
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
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    contentTopMeta: {
      color: "#FFFFFF",
      fontSize: 8,
      letterSpacing: 0.4,
      opacity: 0.7,
    },
    panelsGrid: {
      paddingHorizontal: 24,
      paddingTop: 14,
      paddingBottom: 8,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    panel: {
      width: "48.6%",
      borderWidth: 2.5,
      borderColor: BLACK,
      backgroundColor: "#FFFFFF",
      padding: 12,
      minHeight: 160,
    },
    panelHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 6,
    },
    panelIndex: {
      width: 22,
      height: 22,
      backgroundColor: CRIMSON,
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: 700,
      textAlign: "center",
      paddingTop: 4,
    },
    panelLabel: {
      fontSize: 8,
      fontWeight: 700,
      color: CYAN,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    panelHeading: {
      fontSize: 12,
      fontWeight: 700,
      color: INK,
      lineHeight: 1.3,
      marginBottom: 6,
    },
    panelBody: {
      fontSize: 9,
      color: INK,
      lineHeight: 1.55,
    },
    statBox: {
      marginTop: 8,
      borderTopWidth: 2,
      borderColor: BLACK,
      paddingTop: 6,
    },
    statValue: {
      fontSize: 28,
      fontWeight: 700,
      color: CRIMSON,
      letterSpacing: -0.5,
    },
    statUnit: {
      fontSize: 8,
      color: "#3A3A3A",
      marginTop: 2,
      lineHeight: 1.3,
    },
    ctaPanel: {
      width: "48.6%",
      borderWidth: 2.5,
      borderColor: BLACK,
      backgroundColor: CRIMSON,
      padding: 12,
      minHeight: 160,
      justifyContent: "space-between",
    },
    ctaLabel: {
      fontSize: 8,
      fontWeight: 700,
      color: "#FFFFFF",
      letterSpacing: 1,
      textTransform: "uppercase",
      opacity: 0.85,
    },
    ctaHeading: {
      fontSize: 14,
      fontWeight: 700,
      color: "#FFFFFF",
      lineHeight: 1.25,
      marginVertical: 8,
    },
    ctaBody: {
      fontSize: 9,
      color: "#FFFFFF",
      lineHeight: 1.55,
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
      color: "#FFFFFF",
      fontSize: 7,
      lineHeight: 1.5,
      maxWidth: "70%",
      textAlign: "right",
    },
  });
}

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
  return React.createElement(
    Page,
    { size: "A4", style: s.page },
    React.createElement(
      View,
      { style: s.coverHeaderBar },
      T(data.coverEyebrow, s.coverHeaderEyebrow),
      T(data.issueBadge, s.issueBadge)
    ),
    React.createElement(
      View,
      { style: s.coverTitleStrip },
      T(data.coverTitle, s.coverTitleJa),
      T(data.bubbleLine, s.coverHook)
    ),
    React.createElement(
      View,
      { style: s.heroPanel },
      React.createElement(View, { style: s.heroPanelHalftone }),
      React.createElement(
        View,
        { style: s.emphasisStamp },
        T(data.emphasisStamp, s.emphasisStampText)
      ),
      React.createElement(
        View,
        { style: s.bubble },
        T(data.bubbleLine, s.bubbleText)
      ),
      React.createElement(View, { style: s.bubbleTail }),
      T(data.heroClaim, s.heroClaim),
      T(data.heroEvidence, s.heroEvidence),
      React.createElement(
        View,
        { style: s.speedLines },
        ...[26, 20, 16, 12, 8].map((w, i) =>
          React.createElement(View, {
            key: i,
            style: [s.speedLine, { width: w }] as unknown as ReturnType<typeof StyleSheet.create>[string],
          })
        )
      )
    ),
    React.createElement(
      View,
      { style: s.coverTeaseBlock },
      T(data.coverTease, s.coverTeaseText),
      T("ADIPLAN AI", { color: ORANGE, fontSize: 9, fontWeight: 700, letterSpacing: 1 })
    ),
    React.createElement(
      View,
      { style: s.coverFooter },
      React.createElement(Image, { src: logoSrc, style: s.coverFooterLogo }),
      T(
        data.contactLine,
        s.coverFooterCaption
      )
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
  // Render: 3 narrative panels + stat panel (panel index 2) + CTA in panel index 3
  const panels = data.panels.slice(0, 4);
  return React.createElement(
    Page,
    { size: "A4", style: s.page },
    React.createElement(
      View,
      { style: s.contentTopBar },
      T(
        data.language === "ja" ? "本編 / 4 パネル構成" : "MAIN STORY · 4-PANEL LAYOUT",
        s.contentTopTitle
      ),
      T(data.issueBadge, s.contentTopMeta)
    ),
    React.createElement(
      View,
      { style: s.panelsGrid },
      ...panels.map((p, i) => {
        const isCta = i === panels.length - 1;
        if (isCta) {
          return React.createElement(
            View,
            { style: s.ctaPanel, key: i },
            React.createElement(
              View,
              null,
              T(p.label, s.ctaLabel),
              T(data.ctaHeading, s.ctaHeading),
              T(data.ctaBody, s.ctaBody)
            ),
            T(`#${i + 1} / ${panels.length}`, {
              fontSize: 9,
              color: "#FFFFFF",
              opacity: 0.7,
              letterSpacing: 1,
              alignSelf: "flex-end",
              fontWeight: 700,
            })
          );
        }
        return React.createElement(
          View,
          { style: s.panel, key: i },
          React.createElement(
            View,
            { style: s.panelHeader },
            T(`${i + 1}`, s.panelIndex),
            T(p.label, s.panelLabel)
          ),
          T(p.heading, s.panelHeading),
          T(p.body, s.panelBody),
          p.stat
            ? React.createElement(
                View,
                { style: s.statBox },
                T(p.stat.value, s.statValue),
                T(p.stat.unit, s.statUnit)
              )
            : null
        );
      })
    ),
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
