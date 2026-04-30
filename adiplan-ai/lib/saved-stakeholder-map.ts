/**
 * Saved Stakeholder Map — Phase 3 (DEMO PRIORITY 2).
 *
 * Ricardo's call: stakeholder maps are not throwaway sketches. They're
 * named entities tied to a country, a buyer group, or a specific
 * company. Once saved, they get *recalled* into the fan-out flow:
 * one article + N saved maps → N persona-customised variants of the
 * same deliverable.
 *
 * Two rules from the meeting that this module enforces:
 *   1. **Balance rule**  — across the saved nodes, growing influences
 *      must roughly match shrinking influences. No all-up, no all-down.
 *      A real APAC market has tension; the map should reflect it.
 *   2. **Top-3 highlighting** — the three largest current-influence
 *      nodes are always called out, regardless of trend.
 */

import type {
  Stakeholder,
  StakeholderRegion,
  StakeholderSpecies,
  StakeholderPersona,
  Trend,
} from "@/lib/stakeholders";

/** Where the map applies. */
export type SavedMapScope = "country" | "group" | "company";

export interface SavedStakeholderMapNote {
  /** Stakeholder id from `lib/stakeholders.ts`. */
  stakeholderId: string;
  /** Optional override of trend for this saved map. */
  trend?: Trend;
  /** Optional per-map note (e.g. "buyer wants Q3 stress-test"). */
  note?: string;
}

export interface SavedStakeholderMap {
  id: string;
  name: string;
  scope: SavedMapScope;
  /** Country / group / company label — e.g. "Vietnam", "VINAMILK", "Cargill ID". */
  scopeLabel: string;
  /** Region(s) the map applies to — drives downstream filtering. */
  regions: StakeholderRegion[];
  /** Species portfolios the map covers. */
  species: StakeholderSpecies[];
  /** Free-text reasoning, used as a sub-line in the recall dropdown. */
  description?: string;
  /** Stakeholder ids in this map + per-map overrides. */
  nodes: SavedStakeholderMapNote[];
  /** ISO timestamp. */
  savedAt: string;
  /** Optional author label — for multi-tenant rollout. */
  author?: string;
}

/* -------------------------------------------------------------------------- */
/*  Balance rule                                                              */
/* -------------------------------------------------------------------------- */

export interface BalanceCheck {
  /** Is the map balanced? Soft-pass if absDelta <= 1. */
  ok: boolean;
  growing: number;
  shrinking: number;
  notChanging: number;
  /** Signed gap; positive means too many growers, negative too many shrinkers. */
  delta: number;
  /** Operator-facing summary string. */
  summary: string;
  /** Suggested corrective trend flips (1 or 2). */
  hints: string[];
}

/**
 * Apply the balance rule: across the saved nodes' effective trends
 * (per-map override winning over the canonical trend on the
 * Stakeholder), count growers vs shrinkers. Any abs(delta) > 1 fails.
 *
 * Returns a structured check the UI can render as a green / amber pill.
 */
export function checkBalance(
  map: SavedStakeholderMap,
  byId: Map<string, Stakeholder>
): BalanceCheck {
  let growing = 0;
  let shrinking = 0;
  let notChanging = 0;
  const growerLabels: string[] = [];
  const shrinkerLabels: string[] = [];

  for (const node of map.nodes) {
    const s = byId.get(node.stakeholderId);
    if (!s) continue;
    const trend: Trend = node.trend ?? s.trend;
    if (trend === "growing") {
      growing++;
      growerLabels.push(s.label);
    } else if (trend === "shrinking") {
      shrinking++;
      shrinkerLabels.push(s.label);
    } else {
      notChanging++;
    }
  }

  const delta = growing - shrinking;
  const ok = Math.abs(delta) <= 1;

  let summary: string;
  if (ok) {
    summary = `Balanced — ${growing} growing, ${shrinking} shrinking, ${notChanging} steady.`;
  } else if (delta > 1) {
    summary = `Too many growers (+${delta}). Real markets have tension — flip ${Math.abs(
      delta
    )} to 'shrinking' or 'not-changing'.`;
  } else {
    summary = `Too many shrinkers (${delta}). Add momentum — flip ${Math.abs(
      delta
    )} to 'growing'.`;
  }

  const hints: string[] = [];
  if (delta > 1) {
    // Suggest the smallest-influence growers as flip candidates.
    const flips = growerLabels.slice(-Math.abs(delta));
    if (flips.length > 0) hints.push(`Consider flipping: ${flips.join(", ")}`);
  } else if (delta < -1) {
    const flips = shrinkerLabels.slice(-Math.abs(delta));
    if (flips.length > 0) hints.push(`Consider flipping: ${flips.join(", ")}`);
  }

  return { ok, growing, shrinking, notChanging, delta, summary, hints };
}

/* -------------------------------------------------------------------------- */
/*  Top-3                                                                     */
/* -------------------------------------------------------------------------- */

const INFLUENCE_RANK: Record<Stakeholder["influence"], number> = {
  large: 3,
  medium: 2,
  small: 1,
};

/**
 * Pick the top-3 nodes by current influence. Stable order: bigger
 * influence first, then alphabetical on label.
 */
export function topInfluenceNodes(
  map: SavedStakeholderMap,
  byId: Map<string, Stakeholder>,
  n = 3
): Stakeholder[] {
  const enriched = map.nodes
    .map((node) => byId.get(node.stakeholderId))
    .filter((s): s is Stakeholder => Boolean(s));
  return [...enriched]
    .sort((a, b) => {
      const r = INFLUENCE_RANK[b.influence] - INFLUENCE_RANK[a.influence];
      return r !== 0 ? r : a.label.localeCompare(b.label);
    })
    .slice(0, n);
}

/* -------------------------------------------------------------------------- */
/*  Persona mix                                                               */
/* -------------------------------------------------------------------------- */

export interface PersonaMix {
  persona: StakeholderPersona;
  count: number;
  totalInfluence: number;
  share: number; // 0–1 of total influence
  topLabels: string[];
}

/**
 * Aggregate persona-level influence across a saved map. Drives the
 * fan-out flow — for each saved map we pick the dominant persona and
 * generate a deliverable variant tuned to that persona.
 */
export function personaMix(
  map: SavedStakeholderMap,
  byId: Map<string, Stakeholder>
): PersonaMix[] {
  const buckets = new Map<StakeholderPersona, PersonaMix>();
  for (const node of map.nodes) {
    const s = byId.get(node.stakeholderId);
    if (!s) continue;
    const w = INFLUENCE_RANK[s.influence];
    const existing =
      buckets.get(s.persona) ?? {
        persona: s.persona,
        count: 0,
        totalInfluence: 0,
        share: 0,
        topLabels: [] as string[],
      };
    existing.count += 1;
    existing.totalInfluence += w;
    existing.topLabels = [...existing.topLabels, s.label].slice(0, 3);
    buckets.set(s.persona, existing);
  }
  const total = Array.from(buckets.values()).reduce(
    (acc, b) => acc + b.totalInfluence,
    0
  ) || 1;
  const list = Array.from(buckets.values()).map((b) => ({
    ...b,
    share: b.totalInfluence / total,
  }));
  list.sort((a, b) => b.totalInfluence - a.totalInfluence);
  return list;
}

/**
 * Suggest a deliverable variant per saved map for the fan-out flow.
 * Returns one variant per map, tuned to that map's dominant persona.
 */
export interface FanoutVariant {
  mapId: string;
  mapName: string;
  scopeLabel: string;
  dominantPersona: StakeholderPersona;
  topLabels: string[];
  /** Suggested format kind to ship — falls back to "carousel" for cross-species. */
  suggestedFormat: "carousel" | "leaflet" | "manga" | "short" | "voice-memo";
  /** Region the variant should localize to. */
  regions: StakeholderRegion[];
  species: StakeholderSpecies[];
}

const PERSONA_TO_FORMAT: Record<StakeholderPersona, FanoutVariant["suggestedFormat"]> = {
  "Efficiency Optimizer": "leaflet",
  "System Simplifier": "leaflet",
  "Risk Reducer": "carousel",
  "Sustainability Advocate": "carousel",
  "Knowledge Builder": "manga",
};

export function buildFanout(
  maps: SavedStakeholderMap[],
  byId: Map<string, Stakeholder>
): FanoutVariant[] {
  return maps.map((m) => {
    const mix = personaMix(m, byId);
    const dominant = mix[0]?.persona ?? "Efficiency Optimizer";
    const labels = mix[0]?.topLabels ?? [];
    return {
      mapId: m.id,
      mapName: m.name,
      scopeLabel: m.scopeLabel,
      dominantPersona: dominant,
      topLabels: labels,
      suggestedFormat: PERSONA_TO_FORMAT[dominant] ?? "carousel",
      regions: m.regions,
      species: m.species,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Demo seed — three named maps                                              */
/* -------------------------------------------------------------------------- */

/**
 * Three named maps Ricardo or any species manager can recall on demo
 * day. These get auto-loaded when the saved-map store is empty so a
 * fresh demo always shows the recall flow working.
 */
export const SEED_SAVED_MAPS: SavedStakeholderMap[] = [
  {
    id: "map-vinamilk",
    name: "VINAMILK · Vietnam dairy push",
    scope: "company",
    scopeLabel: "VINAMILK",
    description:
      "Vietnam's largest dairy integrator. Methane-reduction feed pilot 2026-Q3.",
    regions: ["VN"],
    species: ["ruminants"],
    nodes: [
      { stakeholderId: "nutrition-mgr" },
      { stakeholderId: "sustainability", trend: "growing" },
      { stakeholderId: "regulatory" },
      { stakeholderId: "vets", trend: "shrinking" },
      { stakeholderId: "feed-mill" },
    ],
    savedAt: "2026-04-29T08:00:00.000Z",
    author: "Antoine · Ruminants",
  },
  {
    id: "map-cp-thai-poultry",
    name: "CP Thailand · AGP-free playbook",
    scope: "company",
    scopeLabel: "Charoen Pokphand TH",
    description:
      "Top-3 poultry integrator. AGP-free transition Q2-Q4. KOL vets are the gatekeeper.",
    regions: ["TH"],
    species: ["poultry"],
    nodes: [
      { stakeholderId: "corp-nutrition-dir" },
      { stakeholderId: "vets", trend: "growing" },
      { stakeholderId: "regulatory" },
      { stakeholderId: "procurement" },
      { stakeholderId: "farm-mgr", trend: "shrinking" },
    ],
    savedAt: "2026-04-29T09:00:00.000Z",
    author: "Vish · Poultry",
  },
  {
    id: "map-id-aqua",
    name: "Indonesia · pangasius KOL belt",
    scope: "country",
    scopeLabel: "Indonesia",
    description:
      "Sumatra + Java pangasius cluster. Local-language magazine + extension officer led.",
    regions: ["ID"],
    species: ["aqua"],
    nodes: [
      { stakeholderId: "nutrition-mgr" },
      { stakeholderId: "feed-mill" },
      { stakeholderId: "vets" },
      { stakeholderId: "farm-mgr", trend: "growing" },
      { stakeholderId: "regulatory", trend: "shrinking" },
    ],
    savedAt: "2026-04-29T10:00:00.000Z",
    author: "Aileen · Aqua",
  },
];
