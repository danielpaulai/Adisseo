/**
 * Plan on a Page — AdiPlan executing-stage output.
 *
 * Single A4 portrait sheet that pulls everything the user has done in this
 * session (stakeholder selections, CBI ladders, news match, composed frame,
 * shipped deliverables) into one printable summary that can be handed to
 * regional sales / KAMs.
 *
 * Sections (4-quadrant layout):
 *   1. Stakeholders we're moving
 *   2. The strategic frame (condensed)
 *   3. Next moves (deliverables in flight + planned)
 *   4. KPI targets (anchored on Malaysia-ASF benchmark)
 *
 * The page is composed entirely from store state — no LLM call needed —
 * which keeps it deterministic, fast, and demo-safe.
 */

import {
  seededStakeholders,
  type Stakeholder,
} from "@/lib/stakeholders";
import type { StrategicFrame } from "@/lib/strategic-frame";
import type {
  ActivityEntry,
  ActivityKind,
  MatchedArticle,
  StakeholderLadder,
} from "@/lib/store";
import { MALAYSIA_BENCHMARK, pct } from "@/lib/engagement";

export interface PlanOnPageInput {
  stakeholderIds: string[];
  ladders: Record<string, StakeholderLadder>;
  match: MatchedArticle | null;
  frame: StrategicFrame | null;
  activity: ActivityEntry[];
  /** Optional metadata overrides. */
  region?: string;
  campaignName?: string;
  author?: string;
}

export interface PlanStakeholderRow {
  name: string;
  influence: "small" | "medium" | "large";
  trend: "growing" | "shrinking" | "not-changing";
  persona: string;
  topRung: string;
}

export interface PlanNextMove {
  species: string;
  deliverable: string;
  status: "shipped" | "planned";
  language?: string;
  detail?: string;
}

export interface PlanKpiTarget {
  name: string;
  target: string;
  source: string;
}

export interface PlanOnPageData {
  region: string;
  campaignName: string;
  author: string;
  generatedAt: string;

  cbi: string;
  cbiRationale: string;
  persona: string;
  oneLineSummary: string;
  enterpriseInsight: string;

  topStakeholders: PlanStakeholderRow[];

  pain: string;
  promise: string;
  proof: string;
  proposition: string;
  cta: string;

  nextMoves: PlanNextMove[];
  kpiTargets: PlanKpiTarget[];

  /** Lightweight signature info for the footer. */
  matchedAt?: string;
  competitor?: string;
  articleTitle?: string;
}

/* ============================================================================
 * Builder — pure function, store-state in, plan out.
 * ========================================================================== */

const SPECIES_LABEL: Record<string, string> = {
  aqua: "Aqua",
  poultry: "Poultry",
  ruminants: "Ruminants",
  swine: "Swine",
};

const ACTIVITY_TO_DELIVERABLE: Partial<Record<ActivityKind, string>> = {
  aqua: "Aqua 1-page leaflet",
  poultry: "Poultry email + LinkedIn carousel",
  ruminants: "Ruminants manga brochure",
  swine: "Swine <60s vertical short",
  billboard: "Billboard poster",
  "voice-memo": "Voice memo → deliverable",
  frame: "Strategic frame brief",
};

export function buildPlan(input: PlanOnPageInput): PlanOnPageData {
  const region = input.region ?? input.frame?.region ?? "APAC";
  const campaignName =
    input.campaignName ??
    input.match?.cbi ??
    input.frame?.cbi ??
    "AdiPlan APAC — next cycle";

  const author = input.author ?? "Ricardo Communod · Adisseo APAC";

  // ---- 1. Stakeholders ----
  const selectedStakeholders: Stakeholder[] = (
    input.stakeholderIds.length
      ? input.stakeholderIds
          .map((id) => seededStakeholders.find((s) => s.id === id))
          .filter((s): s is Stakeholder => Boolean(s))
      : []
  ).slice(0, 5);

  const topStakeholders: PlanStakeholderRow[] = (
    selectedStakeholders.length ? selectedStakeholders : seededStakeholders.slice(0, 5)
  ).map((s) => {
    const ladder = input.ladders[s.id];
    const topRung =
      ladder?.rungs?.[0]?.outcome ??
      `Help me to ${defaultRungByPersona(s.persona)}`;
    return {
      name: s.label,
      influence: s.influence,
      trend: s.trend,
      persona: s.persona,
      topRung,
    };
  });

  // ---- 2. Strategic frame (condensed) ----
  const frame = input.frame;
  const cbi = frame?.cbi ?? input.match?.cbi ?? "Procurement-cycle compression";
  const cbiRationale =
    input.match?.cbiRationale ??
    "Selected from current session — update from News Bridge for a live anchor.";
  const persona =
    frame?.persona ?? input.match?.persona ?? "Integrator-tier procurement buyer";
  const oneLineSummary =
    frame?.oneLineSummary ??
    "Move the cycle. Be the vendor with the answer this quarter.";
  const enterpriseInsight =
    frame?.enterpriseInsight ??
    "A competitor signal moves the procurement question from \u2018next year’ to \u2018this quarter’. The first vendor with a defensible, documented answer earns the cycle.";

  const pain =
    frame?.pain.headline ??
    "A competitor signal has compressed the buyer's decision window.";
  const promise =
    frame?.promise.headline ??
    "Adisseo's documented answer, this cycle.";
  const proof =
    frame?.proof.headline ??
    "APAC trials. Reproducible. Audit-defensible.";
  const proposition =
    frame?.proposition.headline ?? "30-day on-farm protocol. Co-designed.";
  const cta = frame?.proposition.cta ?? "Co-design the 30-day protocol";

  // ---- 3. Next moves: shipped (from activity) + planned (from frame.activations) ----
  const shipped: PlanNextMove[] = input.activity
    .filter((a) => ACTIVITY_TO_DELIVERABLE[a.kind])
    .filter((a) => a.kind !== "match" && a.kind !== "frame")
    .slice(0, 4)
    .map((a) => ({
      species: speciesFromActivity(a.kind),
      deliverable: ACTIVITY_TO_DELIVERABLE[a.kind] ?? a.title,
      status: "shipped" as const,
      detail: a.detail,
    }));

  const plannedFromFrame: PlanNextMove[] = (frame?.activations ?? []).map((a) => ({
    species: SPECIES_LABEL[a.species] ?? a.species,
    deliverable: a.deliverable,
    status: "planned" as const,
    detail: a.rationale,
  }));

  // De-dupe: if a planned move already shipped (same species + similar
  // deliverable), drop the planned line. Keep at most 6 rows total.
  const merged: PlanNextMove[] = [...shipped];
  for (const p of plannedFromFrame) {
    const dupe = merged.some(
      (m) => m.species === p.species && m.status === "shipped"
    );
    if (!dupe) merged.push(p);
  }
  const nextMoves = merged.slice(0, 6);

  // ---- 4. KPI targets — anchored on Malaysia-ASF benchmark ----
  const kpiTargets: PlanKpiTarget[] = [
    {
      name: "Qualified-view-to-conversion rate",
      target: `\u2265 ${pct(MALAYSIA_BENCHMARK.conversionRate)}`,
      source: "Malaysia-ASF Q4 2025 baseline",
    },
    {
      name: "Qualified viewers per asset",
      target: "\u2265 7",
      source: "Malaysia-ASF Q4 2025 baseline (>2.5min watch / >70% scroll)",
    },
    {
      name: "Sales conversations per asset",
      target: "\u2265 3",
      source: "Q1 2026 APAC seeded median",
    },
    {
      name: "Days from news → first deliverable",
      target: "\u2264 7",
      source: "AdiPlan AI demo path: News Bridge → Frame → Studio",
    },
  ];

  return {
    region,
    campaignName,
    author,
    generatedAt: new Date().toISOString(),
    cbi,
    cbiRationale,
    persona,
    oneLineSummary,
    enterpriseInsight,
    topStakeholders,
    pain,
    promise,
    proof,
    proposition,
    cta,
    nextMoves,
    kpiTargets,
    matchedAt: input.match?.matchedAt,
    competitor: frame?.competitor,
    articleTitle: frame?.articleTitle,
  };
}

function defaultRungByPersona(p: string): string {
  switch (p) {
    case "Efficiency Optimizer":
      return "lift FCR without trading off uniformity";
    case "System Simplifier":
      return "consolidate the protocol stack to one decision per cycle";
    case "Risk Reducer":
      return "defend the regulatory file against the next audit";
    case "Sustainability Advocate":
      return "ship the methane delta with the milk to prove it";
    case "Knowledge Builder":
      return "earn the technical airwaves before the competitor does";
    default:
      return "move the cycle";
  }
}

function speciesFromActivity(kind: ActivityKind): string {
  if (kind === "aqua") return "Aqua";
  if (kind === "poultry") return "Poultry";
  if (kind === "ruminants") return "Ruminants";
  if (kind === "swine") return "Swine";
  if (kind === "billboard") return "Cross";
  if (kind === "voice-memo") return "Cross";
  return "Cross";
}
