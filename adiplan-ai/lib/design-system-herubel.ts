/**
 * Pierre Hérubel design system — APAC Phase 1.
 *
 * Source: ~30 infographics scraped from pierreherubel.substack.com
 * (see scripts/scrape-herubel.ts) plus his published rules:
 *
 *   • 3-layer carousel structure: Hook → Context → Body
 *   • Visual rules: clear hierarchy (headline → subpoints → takeaway),
 *     one specific problem per infographic, subtle name+branding,
 *     a recognisable signature format
 *   • Content rules: cut fluff, skimmable, no zigzag, ultra-actionable,
 *     comparison-posts and high-level frameworks dominate the format
 *   • Format mix: ~40% educational infographic / ~40% carousel / ~20% personal
 *
 * The tokens below are tuned for our existing Adisseo brand pairing —
 * crimson + ink — so we keep brand discipline while inheriting Hérubel's
 * hierarchy + composition rules. Think of this as "Hérubel grammar,
 * Adisseo accent".
 *
 * Consumers:
 *   • app/api/render-poultry-carousel/route.ts (Vish carousel)
 *   • app/api/render-aqua-leaflet/route.ts (Aileen leaflet)
 *   • app/api/render-ruminants-brochure/route.ts (Antoine manga)
 *   • app/design-system/page.tsx (visible documentation)
 */

export const herubelPalette = {
  /** Page surface — off-white, never pure #fff (kills glare). */
  surface: "#FBFAF6",
  /** Body text + bold accents. Hérubel's 90% color. */
  ink: "#0E1014",
  /** Secondary text. */
  inkSoft: "#3A3D45",
  /** Hairline / 1px frames. */
  line: "#E2DFD7",
  /** Highlight blocks (numbered steps, framework labels). */
  blockTint: "#F2EEE3",
  /** Accent — Adisseo crimson stand-in for Hérubel's signature yellow. */
  accent: "#C4262E",
  accentInk: "#FFFFFF",
  /** Secondary accent — for "before / after" or PAS / BAB columns. */
  accent2: "#0F4C81",
  /** Success tint (rare, used for "do this" check rows). */
  good: "#1B7D52",
  /** Warning tint (rare, used for "stop this" cross rows). */
  warn: "#9C2A2A",
};

/**
 * Typography — Hérubel reads as "tabloid newsroom meets keynote slide".
 * Massive Display headline, mid Subhead, microcaps Eyebrow, condensed body.
 *
 * For react-pdf we register Inter (Black, Bold, SemiBold, Regular).
 * For HTML/SVG previews we use the same family + system fallbacks.
 */
export const herubelType = {
  display: { size: 64, weight: 900, lineHeight: 1.02, letterSpacing: -1.4 },
  headline: { size: 36, weight: 800, lineHeight: 1.08, letterSpacing: -0.6 },
  subhead: { size: 22, weight: 700, lineHeight: 1.18, letterSpacing: -0.2 },
  body: { size: 13.5, weight: 400, lineHeight: 1.42, letterSpacing: 0 },
  bodyBold: { size: 13.5, weight: 700, lineHeight: 1.42, letterSpacing: 0 },
  eyebrow: { size: 9.5, weight: 800, lineHeight: 1.1, letterSpacing: 1.6 },
  microCaption: { size: 8.5, weight: 600, lineHeight: 1.2, letterSpacing: 0.6 },
  signature: { size: 8, weight: 700, lineHeight: 1.2, letterSpacing: 1.2 },
} as const;

export type HerubelTypeRole = keyof typeof herubelType;

/**
 * Layout grid — every Hérubel single-frame divides into three rows:
 *   1. Eyebrow + Headline (the "what" — drives the open)
 *   2. Body (the framework / list / comparison — does the work)
 *   3. Signature + source (subtle attribution)
 *
 * Carousels add a "Number" cap and a per-slide "Hook caption". The grid
 * percentages are tuned so the body always gets ≥ 55% of the canvas —
 * the entire reason Hérubel content reads as ultra-actionable.
 */
export const herubelGrid = {
  page: { paddingX: 56, paddingY: 56 },
  row: { eyebrow: 48, headline: 144, body: 0 /* fills rest */, signature: 36 },
  gutter: 18,
  /** Default block grid for "comparison" / "PAS" / "BAB" frameworks. */
  twoCol: { gap: 28 },
  /** Default block grid for "5-step framework" / numbered list. */
  fiveStep: { gap: 14, height: 64 },
};

/**
 * Slot definitions — every Hérubel-style deliverable maps to one of
 * these slot blueprints. The renderer's job is to hand the right
 * content to the right slot; the slot owns the visual treatment.
 */
export type HerubelSlot =
  | "hook"
  | "context"
  | "body"
  | "stat-callout"
  | "framework-row"
  | "two-col"
  | "before-after"
  | "signature";

export interface HerubelSlotSpec {
  /** Mins / max chars — keeps copy from collapsing the layout. */
  charBudget: { min: number; max: number };
  /** Type role used by the renderer. */
  type: HerubelTypeRole;
  /** Why this slot exists, for the design-system page docs. */
  rationale: string;
}

export const herubelSlots: Record<HerubelSlot, HerubelSlotSpec> = {
  hook: {
    charBudget: { min: 28, max: 88 },
    type: "headline",
    rationale:
      "Curiosity + frame. Tells the reader what they're about to learn and " +
      "why it's worth their next 15 seconds. Drives the click-into-carousel.",
  },
  context: {
    charBudget: { min: 60, max: 220 },
    type: "body",
    rationale:
      "Problem statement + named source. Anchors credibility before any " +
      "framework lands.",
  },
  body: {
    charBudget: { min: 80, max: 360 },
    type: "body",
    rationale:
      "The real estate. Either a structured list (numbered steps) or a " +
      "PAS / BAB frame. No paragraphs, no hedging.",
  },
  "stat-callout": {
    charBudget: { min: 8, max: 28 },
    type: "display",
    rationale:
      "Single weaponised number. Hérubel's most-shared format — a single " +
      "stat that earns the rest of the post.",
  },
  "framework-row": {
    charBudget: { min: 14, max: 60 },
    type: "subhead",
    rationale:
      "A 3-7 step framework, one row per step with eyebrow + body. The " +
      "screen-grab format that drives DM-saves.",
  },
  "two-col": {
    charBudget: { min: 24, max: 140 },
    type: "body",
    rationale:
      "Comparison columns — typically 'old way' vs 'new way' or 'wrong' vs " +
      "'right'. Maps to the BAB content frame.",
  },
  "before-after": {
    charBudget: { min: 20, max: 90 },
    type: "subhead",
    rationale:
      "Before / after deltas — paired claim → result. Visual anchor for " +
      "Adisseo trial data.",
  },
  signature: {
    charBudget: { min: 4, max: 60 },
    type: "signature",
    rationale:
      "Subtle name + brand strip. Always bottom-right, always microcaps, " +
      "never dominant.",
  },
};

/**
 * Content frames — Hérubel's two named copywriting frames, plus the
 * 5-step framework that dominates his archive.
 */
export type HerubelFrame = "hook-context-body" | "PAS" | "BAB" | "five-step";

export const herubelFrames: Record<
  HerubelFrame,
  { name: string; slots: HerubelSlot[]; description: string }
> = {
  "hook-context-body": {
    name: "Hook → Context → Body",
    slots: ["hook", "context", "body", "signature"],
    description:
      "Default carousel slide structure. Used for one-shot infographics and " +
      "the first slide of every multi-slide carousel.",
  },
  PAS: {
    name: "Problem · Agitate · Solve",
    slots: ["hook", "two-col", "body", "signature"],
    description:
      "Sales-leaning frame. State the problem, sharpen it, hand the " +
      "audience the answer.",
  },
  BAB: {
    name: "Before · After · Bridge",
    slots: ["hook", "before-after", "body", "signature"],
    description:
      "Trial-data frame — perfect for Adisseo proof points (before / after " +
      "Rovabio, e.g.).",
  },
  "five-step": {
    name: "5-step framework",
    slots: ["hook", "framework-row", "framework-row", "framework-row", "framework-row", "framework-row", "signature"],
    description:
      "The DM-save format. One numbered step per row, ultra-skimmable, " +
      "framework-bias.",
  },
};

/**
 * Helper: trim + soft-pad copy to the slot's char budget. Returns
 * { ok, value, hint } where hint surfaces in the design-system page when
 * a copy block is out of budget so the renderer can self-correct.
 */
export function fitToSlot(
  slot: HerubelSlot,
  raw: string
): { ok: boolean; value: string; hint?: string } {
  const spec = herubelSlots[slot];
  const v = (raw ?? "").trim().replace(/\s+/g, " ");
  if (v.length < spec.charBudget.min) {
    return {
      ok: false,
      value: v,
      hint: `Slot "${slot}" wants ≥ ${spec.charBudget.min} chars; got ${v.length}.`,
    };
  }
  if (v.length > spec.charBudget.max) {
    return {
      ok: false,
      value: v.slice(0, spec.charBudget.max - 1) + "…",
      hint: `Slot "${slot}" caps at ${spec.charBudget.max} chars; trimmed.`,
    };
  }
  return { ok: true, value: v };
}

/**
 * Brand pairing — combine Hérubel grammar with a tenant brand. We ship
 * Adisseo by default; multi-tenant override is a Phase 8 concern.
 */
export const herubelBrand = {
  wordmark: "APAC",
  byline: "Powered by Adisseo · Built on the Hérubel design system",
  /** Used as the bottom-right signature on every render. */
  signature: "APAC · adisseo.com",
} as const;

/**
 * Convenience: a single object for renderers and the /design-system page
 * to import without picking pieces.
 */
export const herubel = {
  palette: herubelPalette,
  type: herubelType,
  grid: herubelGrid,
  slots: herubelSlots,
  frames: herubelFrames,
  brand: herubelBrand,
};
