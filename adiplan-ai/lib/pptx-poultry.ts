/**
 * Tier 2 — PPTX generator for the Poultry carousel.
 *
 * Why
 * ---
 * Vish, Aileen, Antoine, Claire all live in PowerPoint. If our deliverables
 * are PDF-only, every artifact dies on the desktop — the species manager
 * can't tweak a number, swap a quote, or drop a logo. Adding a sibling
 * `.pptx` per pack means edits roundtrip in their existing tool. PowerPoint
 * also opens cleanly in Apple Keynote and Google Slides, so the regional
 * teams can reuse this on Mac and ChromeOS.
 *
 * Strategy
 * --------
 * - One slide per `PoultryCarouselSlide`, plus a metrics-table slide pulled
 *   from the email body, plus an "Adisseo APAC" cover slide.
 * - Inline brand assets (logo PNG) so the deck travels self-contained.
 * - Hérubel palette throughout — same tokens our PDFs use, so the deck
 *   reads as the same brand family.
 *
 * Public API
 * ----------
 *   const buf = await renderPoultryPackPptx({ pack, brandSubtitle });
 *
 * Returns a Node Buffer ready to write to a Response with
 * Content-Type "application/vnd.openxmlformats-officedocument.presentationml.presentation".
 */

import fs from "node:fs";
import path from "node:path";
import { herubel } from "@/lib/design-system-herubel";
import type { PoultryDeliverablePack, PoultryCarouselSlide } from "@/lib/poultry-pack";

const P = herubel.palette;

interface PptxRenderOptions {
  pack: PoultryDeliverablePack;
  /** Sub-line used on the cover slide ("APAC poultry · ID · Vish desk", etc.) */
  brandSubtitle?: string;
}

interface PptxgenLib {
  default: {
    new (): PptxgenInstance;
    LAYOUT_TYPES?: { LAYOUT_WIDE: string };
  };
}

interface PptxgenSlideText {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  fontFace?: string;
  color?: string;
  fill?: { color: string };
  align?: "left" | "center" | "right";
  valign?: "top" | "middle" | "bottom";
  charSpacing?: number;
  paraSpaceBefore?: number;
  paraSpaceAfter?: number;
  bullet?: boolean | { type: "bullet" | "number" };
  margin?: number | number[];
  line?: { color: string; width: number };
}

interface PptxgenSlide {
  background?: { color: string };
  addText(text: string | { text: string }[], opts?: PptxgenSlideText): PptxgenSlide;
  addImage(opts: { path?: string; data?: string; x: number; y: number; w: number; h: number }): PptxgenSlide;
  addShape(type: string, opts: { x: number; y: number; w: number; h: number; fill: { color: string }; line?: { color: string; width: number } }): PptxgenSlide;
  addTable(rows: { text: string; options?: { bold?: boolean; color?: string; fill?: { color: string }; fontSize?: number; align?: string; valign?: string } }[][], opts: { x: number; y: number; w: number; h?: number; colW?: number[]; fontFace?: string; fontSize?: number; border?: { type: "solid"; pt: number; color: string } }): PptxgenSlide;
}

interface PptxgenInstance {
  layout: string;
  defineLayout?(opts: { name: string; width: number; height: number }): void;
  addSlide(): PptxgenSlide;
  write(opts: { outputType: "nodebuffer" }): Promise<Buffer>;
  writeFile?(opts: { fileName: string }): Promise<string>;
}

function readBrandLogoB64(): string | null {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public/brand/adisseo-logo.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

const FONT = "Inter";

export async function renderPoultryPackPptx(opts: PptxRenderOptions): Promise<Buffer> {
  const { pack, brandSubtitle } = opts;

  // Lazy-import; pptxgenjs is ~700 kB.
  const mod = (await import("pptxgenjs")) as unknown as PptxgenLib;
  const Pptxgen = mod.default;
  const pres = new Pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in (16:9)

  const logoB64 = readBrandLogoB64();

  // ---- Cover slide ----------------------------------------------------------
  const cover = pres.addSlide();
  cover.background = { color: P.surface.replace("#", "") };
  if (logoB64) {
    cover.addImage({ data: logoB64, x: 0.5, y: 0.4, w: 1.6, h: 0.55 });
  }
  cover.addShape("rect", {
    x: 0.5,
    y: 1.4,
    w: 0.18,
    h: 4.5,
    fill: { color: P.accent.replace("#", "") },
  });
  cover.addText(pack.email.subject, {
    x: 0.95,
    y: 1.4,
    w: 11.5,
    h: 2.4,
    fontSize: 36,
    bold: true,
    fontFace: FONT,
    color: P.ink.replace("#", ""),
    align: "left",
    valign: "top",
    charSpacing: -10,
  });
  cover.addText(pack.email.preheader, {
    x: 0.95,
    y: 4.0,
    w: 11.5,
    h: 1.6,
    fontSize: 18,
    fontFace: FONT,
    color: P.inkSoft.replace("#", ""),
    align: "left",
    valign: "top",
  });
  cover.addText(
    [
      { text: "TURNING FEED INTO PROFIT" },
      ...(brandSubtitle ? [{ text: ` · ${brandSubtitle}` }] : []),
    ],
    {
      x: 0.95,
      y: 6.6,
      w: 11.5,
      h: 0.4,
      fontSize: 11,
      bold: true,
      fontFace: FONT,
      color: P.accent.replace("#", ""),
      charSpacing: 24,
    }
  );

  // ---- Carousel slides ------------------------------------------------------
  for (const slide of pack.carousel) {
    addCarouselSlide(pres, slide, logoB64);
  }

  // ---- Metrics table slide --------------------------------------------------
  if (pack.email.metricsTable && pack.email.metricsTable.length > 0) {
    addMetricsSlide(pres, pack);
  }

  // ---- Sign-off slide -------------------------------------------------------
  const closing = pres.addSlide();
  closing.background = { color: P.ink.replace("#", "") };
  if (logoB64) {
    closing.addImage({ data: logoB64, x: 0.5, y: 0.4, w: 1.6, h: 0.55 });
  }
  closing.addText(pack.email.ctaLabel || "Talk to your Adisseo APAC contact.", {
    x: 0.5,
    y: 2.2,
    w: 12.3,
    h: 1.6,
    fontSize: 32,
    bold: true,
    fontFace: FONT,
    color: P.surface.replace("#", ""),
    align: "left",
    charSpacing: -6,
  });
  closing.addText(pack.email.signature, {
    x: 0.5,
    y: 4.0,
    w: 12.3,
    h: 1.0,
    fontSize: 14,
    fontFace: FONT,
    color: P.accent.replace("#", ""),
    bold: true,
    charSpacing: 18,
  });
  closing.addText(pack.email.footnote, {
    x: 0.5,
    y: 6.4,
    w: 12.3,
    h: 0.6,
    fontSize: 9,
    italic: true,
    fontFace: FONT,
    color: P.line.replace("#", ""),
  });

  const buf = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
  return buf;
}

function addCarouselSlide(
  pres: PptxgenInstance,
  slide: PoultryCarouselSlide,
  logoB64: string | null
): void {
  const s = pres.addSlide();
  s.background = { color: P.surface.replace("#", "") };

  // Slide-number stamp top-right
  s.addText(String(slide.index).padStart(2, "0"), {
    x: 12.0,
    y: 0.3,
    w: 1.0,
    h: 0.6,
    fontSize: 14,
    bold: true,
    fontFace: FONT,
    color: P.accent.replace("#", ""),
    align: "right",
    charSpacing: 18,
  });
  if (logoB64) {
    s.addImage({ data: logoB64, x: 0.5, y: 0.32, w: 1.0, h: 0.34 });
  }

  // Eyebrow
  if (slide.eyebrow) {
    s.addText(slide.eyebrow.toUpperCase(), {
      x: 0.5,
      y: 1.1,
      w: 12.0,
      h: 0.4,
      fontSize: 11,
      bold: true,
      fontFace: FONT,
      color: P.accent.replace("#", ""),
      charSpacing: 24,
    });
  }

  // Headline
  s.addText(slide.headline, {
    x: 0.5,
    y: 1.55,
    w: 12.0,
    h: 1.6,
    fontSize: slide.kind === "cover" ? 38 : 30,
    bold: true,
    fontFace: FONT,
    color: P.ink.replace("#", ""),
    charSpacing: -8,
    valign: "top",
  });

  // Body or stat or bullets — kind-driven layout
  if (slide.kind === "stat" && slide.bigStat) {
    s.addText(slide.bigStat.value, {
      x: 0.5,
      y: 3.3,
      w: 12.0,
      h: 2.5,
      fontSize: 96,
      bold: true,
      fontFace: FONT,
      color: P.accent.replace("#", ""),
      charSpacing: -30,
    });
    s.addText(slide.bigStat.label, {
      x: 0.5,
      y: 5.7,
      w: 12.0,
      h: 0.8,
      fontSize: 16,
      fontFace: FONT,
      color: P.inkSoft.replace("#", ""),
    });
  } else if (slide.kind === "list" && slide.bullets && slide.bullets.length > 0) {
    s.addText(
      slide.bullets.map((b) => ({ text: b })),
      {
        x: 0.5,
        y: 3.4,
        w: 12.0,
        h: 3.0,
        fontSize: 16,
        fontFace: FONT,
        color: P.ink.replace("#", ""),
        bullet: { type: "bullet" },
        paraSpaceAfter: 8,
      }
    );
  } else if (slide.body) {
    s.addText(slide.body, {
      x: 0.5,
      y: 3.4,
      w: 12.0,
      h: 3.0,
      fontSize: 18,
      fontFace: FONT,
      color: P.ink.replace("#", ""),
    });
  }

  // Attribution
  if (slide.attribution) {
    s.addText(slide.attribution, {
      x: 0.5,
      y: 6.7,
      w: 12.0,
      h: 0.4,
      fontSize: 9,
      italic: true,
      fontFace: FONT,
      color: P.inkSoft.replace("#", ""),
    });
  }
}

function addMetricsSlide(pres: PptxgenInstance, pack: PoultryDeliverablePack): void {
  const s = pres.addSlide();
  s.background = { color: P.surface.replace("#", "") };

  s.addText("Trial summary", {
    x: 0.5,
    y: 0.4,
    w: 12.0,
    h: 0.5,
    fontSize: 12,
    bold: true,
    fontFace: FONT,
    color: P.accent.replace("#", ""),
    charSpacing: 28,
  });
  s.addText(pack.email.subject, {
    x: 0.5,
    y: 1.0,
    w: 12.0,
    h: 1.1,
    fontSize: 26,
    bold: true,
    fontFace: FONT,
    color: P.ink.replace("#", ""),
    charSpacing: -6,
  });

  const rows: { text: string; options?: { bold?: boolean; color?: string; fill?: { color: string }; fontSize?: number; align?: string; valign?: string } }[][] = [
    [
      { text: "Metric", options: { bold: true, color: P.surface.replace("#", ""), fill: { color: P.ink.replace("#", "") }, fontSize: 12 } },
      { text: "Control", options: { bold: true, color: P.surface.replace("#", ""), fill: { color: P.ink.replace("#", "") }, fontSize: 12 } },
      { text: "Treatment", options: { bold: true, color: P.surface.replace("#", ""), fill: { color: P.ink.replace("#", "") }, fontSize: 12 } },
      { text: "Δ", options: { bold: true, color: P.surface.replace("#", ""), fill: { color: P.ink.replace("#", "") }, fontSize: 12 } },
    ],
    ...pack.email.metricsTable.map((row) => [
      { text: row.metric, options: { color: P.ink.replace("#", "") } },
      { text: row.control, options: { color: P.ink.replace("#", "") } },
      { text: row.treatment, options: { color: P.ink.replace("#", ""), bold: true } },
      { text: row.delta, options: { color: P.accent.replace("#", ""), bold: true } },
    ]),
  ];

  s.addTable(rows, {
    x: 0.5,
    y: 2.6,
    w: 12.3,
    fontSize: 14,
    fontFace: FONT,
    border: { type: "solid", pt: 0.5, color: P.line.replace("#", "") },
  });
}
