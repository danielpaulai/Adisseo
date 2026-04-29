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
const CYAN = "#00A3C4";
const ORANGE = "#D97641";
const INK = "#1F252A";
const MUTED = "#6B7280";
const BG = "#FBF9F9";

// LinkedIn carousel optimal: 1080 x 1080 px @ 72 dpi -> 1080 pt
// We'll render at 540 pt square (will scale fine).
const SLIDE = 540;

const styles = StyleSheet.create({
  page: {
    width: SLIDE,
    height: SLIDE,
    fontFamily: "Noto Sans",
    color: INK,
    backgroundColor: BG,
    padding: 36,
    position: "relative",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: CRIMSON,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: CRIMSON,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 18,
  },
  logo: { width: 84, height: 36, objectFit: "contain" },
  pageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pageBadgeText: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1,
    fontWeight: 700,
  },
  pageBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: CRIMSON,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  headline: {
    fontSize: 26,
    fontWeight: 700,
    color: INK,
    lineHeight: 1.18,
    marginBottom: 16,
  },
  body: { fontSize: 13, color: INK, lineHeight: 1.5 },
  bigStat: {
    marginVertical: 18,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderLeftWidth: 6,
    borderLeftColor: CRIMSON,
    backgroundColor: "white",
    borderRadius: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEECEC",
  },
  bigStatValue: {
    fontSize: 56,
    fontWeight: 700,
    color: CRIMSON,
    lineHeight: 1,
  },
  bigStatLabel: {
    fontSize: 11,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 6,
  },
  bullet: {
    fontSize: 13,
    color: INK,
    lineHeight: 1.6,
    marginBottom: 6,
    flexDirection: "row",
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: CYAN,
    marginTop: 6,
  },
  bulletText: { flex: 1, fontSize: 13, lineHeight: 1.5, color: INK },
  ctaCover: {
    fontSize: 36,
    fontWeight: 700,
    color: INK,
    lineHeight: 1.18,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: MUTED,
  },
  footerLeft: { fontSize: 9, color: MUTED, letterSpacing: 0.4 },
  swipeHint: {
    fontSize: 9,
    color: CRIMSON,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  ctaBox: {
    backgroundColor: CRIMSON,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 14,
  },
  ctaText: { fontSize: 14, fontWeight: 700, color: "white" },
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
    React.createElement(View, { style: styles.topBar }),

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
          `${slide.index} / ${total}`
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
      ? React.createElement(Text, { style: styles.body }, slide.body)
      : null,

    slide.bullets
      ? React.createElement(
          View,
          { style: { marginTop: 8 } },
          ...slide.bullets.map((b, i) =>
            React.createElement(
              View,
              { key: i, style: styles.bullet },
              React.createElement(View, { style: styles.bulletDot }),
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
            slide.attribution ?? "Adisseo APAC · Poultry"
          )
        )
      : null,

    React.createElement(
      View,
      { style: styles.footer },
      React.createElement(Text, { style: styles.footerLeft }, campaignName),
      slide.kind !== "cta" && slide.index < total
        ? React.createElement(Text, { style: styles.swipeHint }, "swipe  >")
        : React.createElement(
            Text,
            { style: styles.footerLeft },
            "adiplan.poultry@adisseo.com"
          )
    ),

    React.createElement(View, { style: styles.bottomBar })
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
    campaignName: body.campaignName ?? "Adisseo Poultry APAC · AGP-Free Asia",
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
