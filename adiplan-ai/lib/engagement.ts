/**
 * Engagement tracker — institutionalises Ricardo's Malaysia-ASF model.
 *
 * From the Apr 28 call:
 *   "7 serious viewers (>2.5 min watch time) -> 3 customer conversions.
 *    Institutionalize this metric."
 *
 * Every shipped deliverable gets four numbers:
 *   1. views          (total opens / plays / downloads)
 *   2. qualifiedViews (watch-time >2.5 min OR scroll-depth >70% OR PDF read >80%)
 *   3. conversations  (sales-recorded customer conversations attributed to the asset)
 *   4. conversions    (signed contract or trial protocol kicked off)
 *
 * The Malaysia-ASF baseline (Q4 2025) is the benchmark every new
 * deliverable is graded against — qualified-view-to-conversion stayed at
 * 43% (3 / 7), which is what we want every species manager to chase.
 */

export type DeliverableKind =
  | "leaflet"
  | "email"
  | "carousel"
  | "manga"
  | "short"
  | "voice-memo"
  | "frame";

export type SpeciesKey = "aqua" | "poultry" | "ruminants" | "swine" | "cross";

export interface DeliverableInstance {
  id: string;
  kind: DeliverableKind;
  title: string;
  /** EN | JA | ZH | TH | VI | ID | mixed */
  language: string;
  region: string;
  species: SpeciesKey;
  audience: string;
  /** Which species manager owns it. */
  owner: string;
  sentAt: string; // ISO date
  /** Engagement metrics. */
  views: number;
  qualifiedViews: number;
  conversations: number;
  conversions: number;
  /** Optional anchor signal (matched competitor article). */
  anchorSignal?: string;
  /**
   * Trust-layer composite (0–100) at the moment the deliverable was sent
   * for regional review. New deliverables carry this; legacy seed entries default to 90 so
   * the historical benchmark math doesn't break.
   */
  trustScore?: number;
}

/* ============================================================================
 * Seed dataset — historical deliverables from the APAC pilot.
 * Names + numbers are illustrative but anchor on the Malaysia-ASF baseline
 * Ricardo cited (7 qualified viewers / 3 conversions on the swine asset).
 * ========================================================================== */

export const seededDeliverables: DeliverableInstance[] = [
  {
    id: "del-malaysia-asf-2025q4",
    kind: "short",
    title: "ASF nursery-recovery short · EN-MY",
    language: "EN",
    region: "Malaysia",
    species: "swine",
    audience: "Integrator vet desk",
    owner: "Claire (Swine)",
    sentAt: "2025-11-12",
    views: 38,
    qualifiedViews: 7,
    conversations: 5,
    conversions: 3,
    anchorSignal: "Cargill SE-Asia ASF webinar Q3 2025",
    trustScore: 88,
  },
  {
    id: "del-poultry-agp-q1",
    kind: "email",
    title: "AGP-Free integrator emailer · EN-ID",
    language: "EN/ID",
    region: "Indonesia",
    species: "poultry",
    audience: "Integrator nutrition manager",
    owner: "Vish (Poultry)",
    sentAt: "2026-01-22",
    views: 142,
    qualifiedViews: 31,
    conversations: 12,
    conversions: 4,
    anchorSignal: "Kemin AGP-Free webinar Jan 2026",
  },
  {
    id: "del-poultry-carousel-q1",
    kind: "carousel",
    title: "AGP-Free LinkedIn carousel · EN",
    language: "EN",
    region: "APAC",
    species: "poultry",
    audience: "Premixer formulator",
    owner: "Vish (Poultry)",
    sentAt: "2026-01-25",
    views: 1840,
    qualifiedViews: 86,
    conversations: 6,
    conversions: 1,
    anchorSignal: "Kemin AGP-Free webinar Jan 2026",
    trustScore: 65,
  },
  {
    id: "del-aqua-leaflet-id-q4",
    kind: "leaflet",
    title: "Mycotoxin acceptance-gate leaflet · ID",
    language: "ID",
    region: "Indonesia",
    species: "aqua",
    audience: "Mill QC desk",
    owner: "Aileen (Aqua)",
    sentAt: "2025-10-14",
    views: 86,
    qualifiedViews: 24,
    conversations: 7,
    conversions: 2,
    anchorSignal: "Trobos Aqua Sept-2025 mycotoxin issue",
  },
  {
    id: "del-aqua-leaflet-vi-q1",
    kind: "leaflet",
    title: "Pangasius lecithin leaflet · VI",
    language: "VI",
    region: "Vietnam",
    species: "aqua",
    audience: "Pangasius integrator",
    owner: "Aileen (Aqua)",
    sentAt: "2026-02-08",
    views: 64,
    qualifiedViews: 19,
    conversations: 5,
    conversions: 2,
    anchorSignal: "Tap Chi Thuy San Q1 2026",
  },
  {
    id: "del-ruminants-manga-jp-q1",
    kind: "manga",
    title: "Heat-stress manga brochure · JP",
    language: "JA",
    region: "Hokkaido",
    species: "ruminants",
    audience: "Hokkaido dairy R&D buyer",
    owner: "Antoine (Ruminants)",
    sentAt: "2026-02-22",
    views: 91,
    qualifiedViews: 28,
    conversations: 9,
    conversions: 3,
    anchorSignal: "Hokkaido Dairy Times · summer-yield issue",
    trustScore: 92,
  },
  {
    id: "del-ruminants-manga-jp-q1b",
    kind: "manga",
    title: "Methane / J-credit manga brochure · JP",
    language: "JA",
    region: "Kanto",
    species: "ruminants",
    audience: "Co-op procurement",
    owner: "Antoine (Ruminants)",
    sentAt: "2026-03-04",
    views: 47,
    qualifiedViews: 14,
    conversations: 4,
    conversions: 1,
    anchorSignal: "METI J-credit framework draft",
  },
  {
    id: "del-swine-wechat-zh-q1",
    kind: "short",
    title: "PRRS recovery vertical · ZH (WeChat)",
    language: "ZH",
    region: "China",
    species: "swine",
    audience: "Integrator vet KOL",
    owner: "Claire (Swine)",
    sentAt: "2026-03-18",
    views: 612,
    qualifiedViews: 41,
    conversations: 11,
    conversions: 3,
    anchorSignal: "Cargill WeChat playbook Q1 2026",
  },
];

/* ============================================================================
 * Aggregations
 * ========================================================================== */

export interface Funnel {
  views: number;
  qualifiedViews: number;
  conversations: number;
  conversions: number;
  qualifiedRate: number; // qualified / views
  conversationRate: number; // conversations / qualified
  conversionRate: number; // conversions / qualified
  ovrConversionRate: number; // conversions / views
}

export function aggregateFunnel(items: DeliverableInstance[]): Funnel {
  const totals = items.reduce(
    (acc, d) => {
      acc.views += d.views;
      acc.qualifiedViews += d.qualifiedViews;
      acc.conversations += d.conversations;
      acc.conversions += d.conversions;
      return acc;
    },
    { views: 0, qualifiedViews: 0, conversations: 0, conversions: 0 }
  );
  return {
    ...totals,
    qualifiedRate: totals.views ? totals.qualifiedViews / totals.views : 0,
    conversationRate: totals.qualifiedViews
      ? totals.conversations / totals.qualifiedViews
      : 0,
    conversionRate: totals.qualifiedViews
      ? totals.conversions / totals.qualifiedViews
      : 0,
    ovrConversionRate: totals.views ? totals.conversions / totals.views : 0,
  };
}

export function groupBySpecies(
  items: DeliverableInstance[]
): { species: SpeciesKey; funnel: Funnel; count: number }[] {
  const groups = new Map<SpeciesKey, DeliverableInstance[]>();
  for (const d of items) {
    const arr = groups.get(d.species) ?? [];
    arr.push(d);
    groups.set(d.species, arr);
  }
  return Array.from(groups.entries()).map(([species, arr]) => ({
    species,
    funnel: aggregateFunnel(arr),
    count: arr.length,
  }));
}

export function groupByKind(
  items: DeliverableInstance[]
): { kind: DeliverableKind; funnel: Funnel; count: number }[] {
  const groups = new Map<DeliverableKind, DeliverableInstance[]>();
  for (const d of items) {
    const arr = groups.get(d.kind) ?? [];
    arr.push(d);
    groups.set(d.kind, arr);
  }
  return Array.from(groups.entries()).map(([kind, arr]) => ({
    kind,
    funnel: aggregateFunnel(arr),
    count: arr.length,
  }));
}

/** The Malaysia-ASF baseline — Ricardo's measurement template. */
export const MALAYSIA_BENCHMARK = {
  qualifiedRate: 7 / 38, // 18.4%
  conversionRate: 3 / 7, // 42.9% — this is the bar
  description:
    "Malaysia-ASF Q4 2025: 38 views → 7 qualified → 5 conversations → 3 conversions. The 43% qualified-to-conversion rate is the bar every new deliverable is graded against.",
};

/**
 * Grade a funnel against Ricardo's Malaysia-ASF baseline.
 *
 * From Phase 1 of the trust-layer rollout: a deliverable can only be graded
 * "above benchmark" if its trust-layer composite is ≥ 80 (Adisseo brand-clean).
 * High-conversion volume from a 50/100 deliverable is *not* a win — it bakes
 * in slop and burns brand equity. We surface those as "at" so the team
 * still gets credit, but the asset doesn't become a template.
 */
export function gradeAgainstBenchmark(
  f: Funnel,
  meanTrustScore?: number
): "above" | "at" | "below" {
  const r = f.conversionRate;
  if (r >= MALAYSIA_BENCHMARK.conversionRate * 1.05) {
    if (meanTrustScore !== undefined && meanTrustScore < 80) return "at";
    return "above";
  }
  if (r >= MALAYSIA_BENCHMARK.conversionRate * 0.85) return "at";
  return "below";
}

/** Mean trust score of a deliverable cohort (legacy entries default to 90). */
export function meanTrustScore(items: DeliverableInstance[]): number {
  if (!items.length) return 0;
  const sum = items.reduce((acc, d) => acc + (d.trustScore ?? 90), 0);
  return Math.round(sum / items.length);
}

export function pct(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "0%";
  return `${(n * 100).toFixed(1)}%`;
}

/* ============================================================================
 * Phase 5 — channel → DeliverableKind mapping
 *
 * When a dispatch ships, the distribution rail auto-creates a
 * DeliverableInstance so the engagement tracker can grade it. The mapping
 * picks the most representative kind for each channel: LinkedIn carousels,
 * email blasts, WhatsApp carousels, WeChat shorts, trade-mag specs.
 * ========================================================================== */
export function deliverableKindForChannel(
  channel:
    | "linkedin"
    | "wechat"
    | "whatsapp"
    | "email"
    | "trade-mag",
  hint?: string
): DeliverableKind {
  if (hint) {
    const h = hint.toLowerCase();
    if (/manga/.test(h)) return "manga";
    if (/leaflet|brief/.test(h)) return "leaflet";
    if (/short|video|tiktok|reels/.test(h)) return "short";
    if (/voice/.test(h)) return "voice-memo";
    if (/frame|tvs/.test(h)) return "frame";
  }
  switch (channel) {
    case "linkedin":
      return "carousel";
    case "wechat":
      return "short";
    case "whatsapp":
      return "carousel";
    case "email":
      return "email";
    case "trade-mag":
      return "leaflet";
  }
}
