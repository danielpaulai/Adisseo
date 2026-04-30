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
import type { StrategicFrame } from "@/lib/strategic-frame";
import type { SpeciesKey } from "@/lib/adiplan";

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
const EMERALD = "#047857";
const RED = "#B91C1C";
const INK = "#0E1216";
const MUTED = "#6B7280";
const LINE = "#E5E7EB";
const BG = "#FBF9F9";

const SPECIES_LABEL: Record<SpeciesKey, string> = {
  aqua: "Aqua (Aileen)",
  poultry: "Poultry (Vish)",
  ruminants: "Ruminants (Antoine)",
  swine: "Swine (Claire)",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Noto Sans",
    fontSize: 9,
    color: INK,
    backgroundColor: BG,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  topBar: {
    backgroundColor: CRIMSON,
    paddingHorizontal: 28,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBarLogo: { width: 64, height: 24, objectFit: "contain" },
  topBarMeta: {
    color: "#FFFFFF",
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: 700,
  },
  body: { paddingHorizontal: 28, paddingTop: 14, paddingBottom: 16 },
  sourceRibbon: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  sourceLabel: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: MUTED,
  },
  sourceValue: {
    fontSize: 8.5,
    color: INK,
    fontWeight: 700,
  },
  sourceMuted: { fontSize: 8.5, color: MUTED },
  oneLinerBlock: {
    backgroundColor: CRIMSON,
    color: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 4,
  },
  oneLinerEyebrow: {
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 4,
    fontWeight: 700,
  },
  oneLinerText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: 700,
    lineHeight: 1.3,
  },

  twoCol: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  miniCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  miniCardEyebrow: {
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 4,
  },
  miniCardBody: { fontSize: 8.5, lineHeight: 1.45, color: INK },

  tvsHeader: {
    backgroundColor: CRIMSON,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tvsHeaderText: {
    color: "#FFFFFF",
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: 700,
  },
  tvsGrid: {
    borderWidth: 1,
    borderColor: CRIMSON,
    borderTopWidth: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  tvsCard: {
    width: "50%",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: LINE,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  tvsLabel: {
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 3,
  },
  tvsHeadline: {
    fontSize: 10,
    fontWeight: 700,
    color: INK,
    lineHeight: 1.25,
    marginBottom: 4,
  },
  tvsBody: { fontSize: 8, color: INK, lineHeight: 1.45 },
  tvsEvidence: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
  },
  tvsEvidenceItem: {
    fontSize: 7.5,
    color: INK,
    lineHeight: 1.4,
    marginBottom: 1.5,
  },
  tvsCta: {
    marginTop: 6,
    fontSize: 8,
    color: ORANGE,
    fontWeight: 700,
  },

  activationsHeader: {
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: 700,
    color: CRIMSON,
    marginBottom: 6,
  },
  activations: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  activationCard: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "#FFFFFF",
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 4,
  },
  activationLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: INK,
    marginBottom: 1,
  },
  activationDeliverable: { fontSize: 8, color: INK, marginBottom: 2 },
  activationRationale: { fontSize: 7, color: MUTED, lineHeight: 1.35 },

  footer: {
    marginTop: "auto",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: LINE,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: MUTED,
  },
});

function FrameDocument({
  frame,
  logoSrc,
}: {
  frame: StrategicFrame;
  logoSrc: string;
}) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.topBar },
        React.createElement(Image, { src: logoSrc, style: styles.topBarLogo }),
        React.createElement(
          Text,
          { style: styles.topBarMeta },
          "Strategic Frame · Total Value Solution"
        )
      ),
      React.createElement(
        View,
        { style: styles.body },

        // === Source ribbon ===
        React.createElement(
          View,
          { style: styles.sourceRibbon },
          React.createElement(
            View,
            { style: { marginRight: 14 } },
            React.createElement(Text, { style: styles.sourceLabel }, "Source"),
            React.createElement(
              Text,
              { style: styles.sourceValue },
              `${frame.competitor} · ${frame.region}`
            )
          ),
          React.createElement(
            View,
            { style: { marginRight: 14, flex: 1 } },
            React.createElement(Text, { style: styles.sourceLabel }, "Article"),
            React.createElement(
              Text,
              { style: styles.sourceMuted },
              frame.articleTitle
            )
          ),
          React.createElement(
            View,
            { style: { marginRight: 14 } },
            React.createElement(Text, { style: styles.sourceLabel }, "CBI"),
            React.createElement(
              Text,
              { style: styles.sourceValue },
              frame.cbi
            )
          ),
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.sourceLabel }, "Persona"),
            React.createElement(
              Text,
              { style: styles.sourceValue },
              frame.persona
            )
          )
        ),

        // === One-liner ===
        React.createElement(
          View,
          { style: styles.oneLinerBlock },
          React.createElement(
            Text,
            { style: styles.oneLinerEyebrow },
            "One-liner"
          ),
          React.createElement(
            Text,
            { style: styles.oneLinerText },
            frame.oneLineSummary
          )
        ),

        // === Enterprise persona + insight ===
        React.createElement(
          View,
          { style: styles.twoCol },
          React.createElement(
            View,
            { style: styles.miniCard },
            React.createElement(
              Text,
              { style: [styles.miniCardEyebrow, { color: CYAN }] },
              "Enterprise Persona"
            ),
            React.createElement(
              Text,
              { style: styles.miniCardBody },
              frame.enterprisePersona
            )
          ),
          React.createElement(
            View,
            { style: styles.miniCard },
            React.createElement(
              Text,
              { style: [styles.miniCardEyebrow, { color: ORANGE }] },
              "Enterprise Insight"
            ),
            React.createElement(
              Text,
              { style: [styles.miniCardBody, { fontWeight: 700 }] },
              frame.enterpriseInsight
            )
          )
        ),

        // === TVS 4-card ===
        React.createElement(
          View,
          { style: styles.tvsHeader },
          React.createElement(
            Text,
            { style: styles.tvsHeaderText },
            "Total Value Solution · Pain × Promise × Proof × Proposition"
          )
        ),
        React.createElement(
          View,
          { style: styles.tvsGrid },
          // Pain
          React.createElement(
            View,
            { style: styles.tvsCard },
            React.createElement(
              Text,
              { style: [styles.tvsLabel, { color: RED }] },
              "Pain"
            ),
            React.createElement(
              Text,
              { style: styles.tvsHeadline },
              frame.pain.headline
            ),
            React.createElement(Text, { style: styles.tvsBody }, frame.pain.body)
          ),
          // Promise
          React.createElement(
            View,
            { style: styles.tvsCard },
            React.createElement(
              Text,
              { style: [styles.tvsLabel, { color: CYAN }] },
              "Promise"
            ),
            React.createElement(
              Text,
              { style: styles.tvsHeadline },
              frame.promise.headline
            ),
            React.createElement(
              Text,
              { style: styles.tvsBody },
              frame.promise.body
            )
          ),
          // Proof
          React.createElement(
            View,
            { style: styles.tvsCard },
            React.createElement(
              Text,
              { style: [styles.tvsLabel, { color: EMERALD }] },
              "Proof"
            ),
            React.createElement(
              Text,
              { style: styles.tvsHeadline },
              frame.proof.headline
            ),
            React.createElement(Text, { style: styles.tvsBody }, frame.proof.body),
            React.createElement(
              View,
              { style: styles.tvsEvidence },
              ...frame.proof.evidence.map((e, i) =>
                React.createElement(
                  Text,
                  { key: i, style: styles.tvsEvidenceItem },
                  `· ${e}`
                )
              )
            )
          ),
          // Proposition
          React.createElement(
            View,
            { style: styles.tvsCard },
            React.createElement(
              Text,
              { style: [styles.tvsLabel, { color: ORANGE }] },
              "Proposition"
            ),
            React.createElement(
              Text,
              { style: styles.tvsHeadline },
              frame.proposition.headline
            ),
            React.createElement(
              Text,
              { style: styles.tvsBody },
              frame.proposition.body
            ),
            React.createElement(
              Text,
              { style: styles.tvsCta },
              `→ ${frame.proposition.cta}`
            )
          )
        ),

        // === Activations ===
        React.createElement(
          Text,
          { style: styles.activationsHeader },
          "Activations · ship next"
        ),
        React.createElement(
          View,
          { style: styles.activations },
          ...frame.activations.map((a, i) =>
            React.createElement(
              View,
              { key: i, style: styles.activationCard },
              React.createElement(
                Text,
                { style: styles.activationLabel },
                SPECIES_LABEL[a.species]
              ),
              React.createElement(
                Text,
                { style: styles.activationDeliverable },
                a.deliverable
              ),
              React.createElement(
                Text,
                { style: styles.activationRationale },
                a.rationale
              )
            )
          )
        ),

        React.createElement(
          View,
          { style: styles.footer },
          React.createElement(
            Text,
            null,
            `APAC AI · Strategic Frame · ${new Date().toISOString().slice(0, 10)}`
          ),
          React.createElement(
            Text,
            null,
            "Internal · regional sales hand-off"
          )
        )
      )
    )
  );
}

export async function POST(req: NextRequest) {
  ensureFonts();
  const body = (await req.json()) as { frame?: StrategicFrame };
  if (!body.frame) {
    return NextResponse.json(
      { error: "Missing 'frame' in request body" },
      { status: 400 }
    );
  }
  const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
  const logoBuffer = fs.readFileSync(logoPath);
  const element = React.createElement(FrameDocument, {
    frame: body.frame,
    logoSrc: logoBuffer as unknown as string,
  });
  const pdfBuffer = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0]
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="adiplan-strategic-frame.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
