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
  type PoultryCarouselSlide,
  deterministicPoultryPack,
} from "@/lib/poultry-pack";
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
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

// Hérubel design tokens (lib/design-system-herubel.ts).
const P = herubel.palette;
const T = herubel.type;

// LinkedIn carousel optimal: 1080 x 1080 px @ 72 dpi -> 1080 pt.
// We render at 540 pt square (PDF scales fine).
const SLIDE = 540;
const PAD = 40;

const styles = StyleSheet.create({
  page: {
    width: SLIDE,
    height: SLIDE,
    fontFamily: "Noto Sans",
    color: P.ink,
    backgroundColor: P.surface,
    padding: PAD,
    position: "relative",
  },
  // Hérubel signature accent — single thick rule on the left edge,
  // not a top/bottom band. Reads as a tabloid column rule.
  accentRule: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 12,
    backgroundColor: P.accent,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: { width: 78, height: 32, objectFit: "contain" },
  pageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: P.blockTint,
  },
  pageBadgeText: {
    fontSize: T.eyebrow.size,
    color: P.ink,
    letterSpacing: T.eyebrow.letterSpacing,
    fontWeight: T.eyebrow.weight,
  },
  pageBadgeDot: {
    width: 6,
    height: 6,
    backgroundColor: P.accent,
  },
  eyebrow: {
    fontSize: T.eyebrow.size,
    letterSpacing: T.eyebrow.letterSpacing,
    color: P.accent,
    fontWeight: T.eyebrow.weight,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  headline: {
    fontSize: T.headline.size,
    fontWeight: T.headline.weight,
    color: P.ink,
    lineHeight: T.headline.lineHeight,
    letterSpacing: T.headline.letterSpacing,
    marginBottom: 16,
  },
  context: {
    fontSize: T.body.size,
    color: P.inkSoft,
    lineHeight: T.body.lineHeight,
    marginBottom: 14,
  },
  body: {
    fontSize: T.body.size,
    color: P.ink,
    lineHeight: T.body.lineHeight,
  },
  bigStat: {
    marginVertical: 18,
    paddingVertical: 22,
    paddingHorizontal: 22,
    backgroundColor: P.ink,
    color: P.surface,
  },
  bigStatValue: {
    fontSize: T.display.size,
    fontWeight: T.display.weight,
    color: P.surface,
    lineHeight: T.display.lineHeight,
    letterSpacing: T.display.letterSpacing,
  },
  bigStatLabel: {
    fontSize: T.microCaption.size,
    color: P.surface,
    textTransform: "uppercase",
    letterSpacing: T.microCaption.letterSpacing,
    marginTop: 8,
    opacity: 0.78,
  },
  bullet: {
    fontSize: T.body.size,
    color: P.ink,
    lineHeight: T.body.lineHeight,
    marginBottom: 8,
    flexDirection: "row",
    gap: 10,
  },
  bulletNum: {
    width: 22,
    height: 22,
    backgroundColor: P.ink,
    color: P.surface,
    fontSize: T.bodyBold.size,
    fontWeight: T.bodyBold.weight,
    textAlign: "center",
    lineHeight: 1.6,
  },
  bulletText: {
    flex: 1,
    fontSize: T.body.size,
    lineHeight: T.body.lineHeight,
    color: P.ink,
  },
  ctaCover: {
    fontSize: T.display.size,
    fontWeight: T.display.weight,
    color: P.ink,
    lineHeight: T.display.lineHeight,
    letterSpacing: T.display.letterSpacing,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: PAD,
    right: PAD,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signature: {
    fontSize: T.signature.size,
    color: P.inkSoft,
    fontWeight: T.signature.weight,
    letterSpacing: T.signature.letterSpacing,
    textTransform: "uppercase",
  },
  swipeHint: {
    fontSize: T.signature.size,
    color: P.accent,
    fontWeight: T.signature.weight,
    letterSpacing: T.signature.letterSpacing,
    textTransform: "uppercase",
  },
  ctaBox: {
    backgroundColor: P.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  ctaText: {
    fontSize: T.bodyBold.size,
    fontWeight: T.bodyBold.weight,
    color: P.accentInk,
    letterSpacing: 0.4,
  },
});

function Slide({
  slide,
  total,
  logoSrc,
  campaignName,
}: {
  slide: PoultryCarouselSlide;
  total: number;
  logoSrc: string;
  campaignName: string;
}) {
  return React.createElement(
    Page,
    { size: { width: SLIDE, height: SLIDE }, style: styles.page },

    // Hérubel: single thick rule on the left edge.
    React.createElement(View, { style: styles.accentRule }),

    React.createElement(
      View,
      { style: styles.header },
      React.createElement(Image, { src: logoSrc, style: styles.logo }),
      React.createElement(
        View,
        { style: styles.pageBadge },
        React.createElement(View, { style: styles.pageBadgeDot }),
        React.createElement(
          Text,
          { style: styles.pageBadgeText },
          `${String(slide.index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
        )
      )
    ),

    slide.eyebrow
      ? React.createElement(Text, { style: styles.eyebrow }, slide.eyebrow)
      : null,

    React.createElement(
      Text,
      { style: slide.kind === "cover" ? styles.ctaCover : styles.headline },
      slide.headline
    ),

    slide.bigStat
      ? React.createElement(
          View,
          { style: styles.bigStat },
          React.createElement(Text, { style: styles.bigStatValue }, slide.bigStat.value),
          React.createElement(Text, { style: styles.bigStatLabel }, slide.bigStat.label)
        )
      : null,

    slide.body
      ? React.createElement(
          Text,
          { style: slide.kind === "cover" ? styles.context : styles.body },
          slide.body
        )
      : null,

    slide.bullets
      ? React.createElement(
          View,
          { style: { marginTop: 12 } },
          ...slide.bullets.map((b, i) =>
            React.createElement(
              View,
              { key: i, style: styles.bullet },
              React.createElement(
                Text,
                { style: styles.bulletNum },
                String(i + 1).padStart(2, "0")
              ),
              React.createElement(Text, { style: styles.bulletText }, b)
            )
          )
        )
      : null,

    slide.kind === "cta"
      ? React.createElement(
          View,
          { style: styles.ctaBox },
          React.createElement(
            Text,
            { style: styles.ctaText },
            slide.attribution ?? "APAC · Adisseo Poultry"
          )
        )
      : null,

    React.createElement(
      View,
      { style: styles.footer },
      React.createElement(Text, { style: styles.signature }, campaignName),
      slide.kind !== "cta" && slide.index < total
        ? React.createElement(Text, { style: styles.swipeHint }, "Swipe →")
        : React.createElement(
            Text,
            { style: styles.signature },
            herubel.brand.signature
          )
    )
  );
}

function CarouselDoc({
  slides,
  logoSrc,
  campaignName,
}: {
  slides: PoultryCarouselSlide[];
  logoSrc: string;
  campaignName: string;
}) {
  return React.createElement(
    Document,
    null,
    ...slides.map((s) =>
      React.createElement(Slide, {
        key: s.index,
        slide: s,
        total: slides.length,
        logoSrc,
        campaignName,
      })
    )
  );
}

export async function POST(req: NextRequest) {
  ensureFonts();
  const body = (await req.json()) as {
    pack?: { carousel: PoultryCarouselSlide[] };
    campaignId?: string;
    audienceId?: string;
    campaignName?: string;
  };

  let slides: PoultryCarouselSlide[];
  if (body.pack?.carousel) {
    slides = body.pack.carousel;
  } else {
    slides = deterministicPoultryPack(
      body.campaignId ?? "agp-free-asia",
      body.audienceId ?? "integrator-cp"
    ).carousel;
  }

  const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
  const logoBuffer = fs.readFileSync(logoPath);

  const element = React.createElement(CarouselDoc, {
    slides,
    logoSrc: logoBuffer as unknown as string,
    campaignName: body.campaignName ?? "APAC · Poultry · AGP-Free Asia",
  });

  const pdfBuffer = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0]
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="adisseo-poultry-carousel.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
