/**
 * News 3-axis analyzer — Phase 2 (DEMO PRIORITY 1).
 *
 * Every scraped competitor article gets a deterministic score on three
 * APAC-defined axes:
 *
 *   1. CSF (Customer Success Factor) — what the buyer measures themselves on
 *   2. CBI (Critical Business Issue) — what threatens that success factor
 *   3. Corporate Persona — who at the buyer cares the most
 *
 * Why deterministic: Ricardo wants to score 125+ articles per refresh
 * without burning tokens, and the score has to be auditable. We do
 * keyword + tag matching against the APAC vocabularies (lib/adiplan.ts
 * + lib/personas-matrix.ts) and surface a per-axis score 0–100.
 *
 * The scorer is also LLM-augmentable: pass `llmHints` (e.g. an existing
 * MatchResponse from /api/match-article) to bias the deterministic score
 * toward what the LLM picked, while keeping the deterministic floor.
 */

import type { ScrapedArticle } from "@/lib/scraper-api";
import { adiplanCBIs, type CBI } from "@/lib/adiplan";
import {
  matrixCSFs,
  matrixPersonas,
  type CSFId,
  type PersonaId,
  type MatrixCSF,
  type MatrixPersona,
} from "@/lib/personas-matrix";

/* -------------------------------------------------------------------------- */
/*  Vocabularies                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Per-CBI keyword vocabulary. Keep the lists deliberately tight so a real
 * scraped article scores high on at most 2-3 CBIs.
 */
const CBI_KEYWORDS: Record<string, string[]> = {
  "cbi-feed-cost": [
    "feed cost", "raw material", "raw-material", "methionine price",
    "least-cost", "soy", "soybean", "fishmeal", "lcm", "least cost",
    "amino acid price", "commodity", "input cost",
  ],
  "cbi-disease-pressure": [
    "asf", "african swine fever", "prrs", "ai", "avian influenza",
    "wssv", "outbreak", "biosecurity", "disease", "mortality",
    "pathogen", "ehp", "white spot", "emerging disease",
  ],
  "cbi-regulatory-shift": [
    "agp", "antibiotic-free", "antibiotic free", "antibiotic stewardship",
    "low-cp", "low protein", "regulatory", "audit", "scope-3",
    "carbon report", "csr", "compliance", "ban", "directive",
  ],
  "cbi-sustainability": [
    "carbon", "scope-3", "sustainability", "esg", "csr", "methane",
    "co2", "emission", "decarboniz", "carbon-footprint",
    "carbon footprint", "footprint",
  ],
  "cbi-mycotoxin": [
    "mycotoxin", "aflatoxin", "fumonisin", "don", "zearalenone",
    "mold", "feed safety", "raw-material quality",
  ],
  "cbi-talent-knowledge": [
    "training", "education", "literacy", "extension", "kol",
    "distributor training", "farmer training", "next-gen",
  ],
  "cbi-channel-fragmentation": [
    "distributor", "channel", "top-10", "integrator", "account-based",
    "key-account", "fragmentation", "wholesaler",
  ],
  "cbi-aqua-localization": [
    "thai", "vietnamese", "indonesian", "bahasa", "local language",
    "magazine", "trade journal", "panga", "shrimp magazine",
  ],
};

/**
 * Per-CSF keyword vocabulary. CSFs are the buyer-side outcome metrics
 * — what THEY get measured on.
 */
const CSF_KEYWORDS: Record<CSFId, string[]> = {
  "csf-margin": [
    "margin", "profit", "cost per kg", "cost per ton", "kg of gain per dollar",
    "fcr cost", "cost saving", "least-cost", "feed cost",
  ],
  "csf-fcr": [
    "fcr", "feed conversion", "uniformity", "yield", "weight gain",
    "adg", "average daily gain", "growth rate", "performance lift",
  ],
  "csf-disease": [
    "asf", "prrs", "ai", "wssv", "biosecurity", "mortality",
    "outbreak", "disease pressure", "pathogen", "vaccine",
  ],
  "csf-regulatory": [
    "agp", "antibiotic-free", "low-cp", "low protein", "regulatory",
    "ban", "directive", "compliance", "audit",
  ],
  "csf-carbon": [
    "carbon", "scope-3", "methane", "co2", "footprint", "esg",
    "sustainability", "decarboniz", "emission",
  ],
  "csf-knowledge": [
    "training", "education", "literacy", "kol", "extension",
    "manga", "tutorial", "playbook", "magazine",
  ],
};

/**
 * Per-persona keyword vocabulary. Persona scoring biases on
 * vocabulary the persona literally cares about.
 */
const PERSONA_KEYWORDS_GENERIC: Record<PersonaId, string[]> = {
  "persona-efficiency": [
    "fcr", "feed conversion", "margin", "yield", "kg of gain",
    "least-cost", "cost per kg", "performance lift", "adg",
  ],
  "persona-system-simplifier": [
    "single solution", "single product", "drop-in", "one shot",
    "all-in-one", "consolidate", "rationaliz", "simplify", "fewer skus",
  ],
  "persona-risk-reducer": [
    "asf", "prrs", "ai", "wssv", "biosecurity", "outbreak",
    "mortality", "audit", "compliance", "resilience", "disease",
    "mycotoxin", "vaccine",
  ],
  "persona-sustainability-advocate": [
    "carbon", "scope-3", "esg", "csr", "methane", "co2",
    "footprint", "sustainability", "retailer", "audit",
  ],
  "persona-knowledge-builder": [
    "training", "education", "literacy", "kol", "manga",
    "tutorial", "playbook", "extension", "magazine",
  ],
};

/**
 * Poultry-specific persona vocabulary — TFIP plan Phase C.
 *
 * Comes from the Apr-30 workshop posters and the TFIP commercial deck.
 * When the news scorer is called with `species: "poultry"`, this overlay
 * augments the generic vocabulary so the persona axis picks the workshop
 * persona that maps best to the article (Efficiency Guy, Performance
 * Result Guy, Ethical Guy, etc.).
 */
const PERSONA_KEYWORDS_POULTRY_OVERLAY: Record<PersonaId, string[]> = {
  "persona-efficiency": [
    "rhodimet", "rovabio", "matrix value", "amino acid", "methionine",
    "feedase", "adict", "pne", "fdc", "least-cost broiler", "lecimax",
  ],
  "persona-system-simplifier": [
    "broiler", "layer", "uniformity", "cv%", "harvest window",
    "performance result", "adg broiler", "bodyweight",
  ],
  "persona-risk-reducer": [
    "agp", "agp-free", "antibiotic-free poultry", "clostridium", "e. coli",
    "newcastle", "h5n1", "heat stress", "gut health", "necrotic enteritis",
  ],
  "persona-sustainability-advocate": [
    "sustainway", "scope-3 poultry", "lci poultry", "broiler carbon",
    "rovabio sustainability", "lcimax", "adict sustainability",
  ],
  "persona-knowledge-builder": [
    "vet kol", "poultry magazine", "asia poultry", "wpc", "world poultry",
    "broiler training", "vet training",
  ],
};

/** Selector — generic by default, poultry overlay when species === "poultry". */
function personaKeywordsFor(species?: string): Record<PersonaId, string[]> {
  if (species !== "poultry") return PERSONA_KEYWORDS_GENERIC;
  const merged: Record<PersonaId, string[]> = { ...PERSONA_KEYWORDS_GENERIC };
  for (const k of Object.keys(merged) as PersonaId[]) {
    merged[k] = [...PERSONA_KEYWORDS_GENERIC[k], ...PERSONA_KEYWORDS_POULTRY_OVERLAY[k]];
  }
  return merged;
}

/** Backwards-compatible alias — most callers want the generic vocab. */
const PERSONA_KEYWORDS = PERSONA_KEYWORDS_GENERIC;

/* -------------------------------------------------------------------------- */
/*  Score type                                                                */
/* -------------------------------------------------------------------------- */

export interface AxisHit<TId extends string> {
  id: TId;
  /** 0-100 deterministic score. */
  score: number;
  /** Token / phrase that drove the score. */
  evidence: string[];
}

export interface ThreeAxisScore {
  articleId: string;
  /** Top-1 CBI + ranked list. */
  cbi: AxisHit<string>;
  cbiRanked: AxisHit<string>[];
  /** Top-1 CSF + ranked list. */
  csf: AxisHit<CSFId>;
  csfRanked: AxisHit<CSFId>[];
  /** Top-1 persona + ranked list. */
  persona: AxisHit<PersonaId>;
  personaRanked: AxisHit<PersonaId>[];
  /** Composite 0-100 — average of the three top scores. */
  composite: number;
  /** "Adisseo strength" derived from the persona × csf cell — how good our flagship is. */
  adisseoStrength: number;
  /** Trace of why this article scored where it did. */
  rationale: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function normalize(s: string): string {
  return s.toLowerCase();
}

/**
 * Score a corpus of keywords against an article. We weight: title hits 3x,
 * tag hits 2x, summary hits 1x. We cap the score at 100.
 */
function scoreKeywords(article: ScrapedArticle, kws: string[]): { score: number; hits: string[] } {
  const title = normalize(article.title);
  const summary = normalize(article.summary);
  const tags = article.tags.map(normalize);
  let raw = 0;
  const hits = new Set<string>();
  for (const kw of kws) {
    const k = normalize(kw);
    if (title.includes(k)) {
      raw += 30;
      hits.add(kw);
    } else if (tags.some((t) => t.includes(k) || k.includes(t))) {
      raw += 18;
      hits.add(kw);
    } else if (summary.includes(k)) {
      raw += 10;
      hits.add(kw);
    }
  }
  // Soft cap. Multiple hits on the same axis stack but plateau quickly.
  const score = Math.min(100, Math.round(raw));
  return { score, hits: Array.from(hits).slice(0, 4) };
}

/**
 * Optional LLM bias — if `articleId → { cbiId, personaId }` is known
 * from the existing /api/match-article result, blend it in: the LLM
 * pick gets +20 to its deterministic score, so a tie deterministically
 * goes to what the LLM said.
 */
export interface LlmHints {
  cbiId?: string;
  personaId?: PersonaId;
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Score one article against all three axes. Pure / deterministic /
 * cache-friendly. Pass `hints` when an LLM has already matched the
 * article — the deterministic scores get a +20 nudge on the LLM picks.
 */
export function scoreArticle(
  article: ScrapedArticle,
  hints?: LlmHints,
  options?: { species?: string }
): ThreeAxisScore {
  const personaKeywords = personaKeywordsFor(options?.species);
  // CBI axis — score against every CBI keyword vocabulary.
  const cbiHits: AxisHit<string>[] = adiplanCBIs.map((cbi: CBI) => {
    const { score, hits } = scoreKeywords(article, CBI_KEYWORDS[cbi.id] ?? []);
    const nudged = hints?.cbiId === cbi.id ? Math.min(100, score + 20) : score;
    return { id: cbi.id, score: nudged, evidence: hits };
  });
  cbiHits.sort((a, b) => b.score - a.score);

  // CSF axis.
  const csfHits: AxisHit<CSFId>[] = matrixCSFs.map((c: MatrixCSF) => {
    const { score, hits } = scoreKeywords(article, CSF_KEYWORDS[c.id]);
    return { id: c.id, score, evidence: hits };
  });
  csfHits.sort((a, b) => b.score - a.score);

  // Persona axis.
  const personaHits: AxisHit<PersonaId>[] = matrixPersonas.map((p: MatrixPersona) => {
    const { score, hits } = scoreKeywords(article, personaKeywords[p.id]);
    const nudged =
      hints?.personaId === p.id ? Math.min(100, score + 20) : score;
    return { id: p.id, score: nudged, evidence: hits };
  });
  personaHits.sort((a, b) => b.score - a.score);

  const cbi = cbiHits[0];
  const csf = csfHits[0];
  const persona = personaHits[0];

  const composite = Math.round((cbi.score + csf.score + persona.score) / 3);

  const cbiLabel = adiplanCBIs.find((c) => c.id === cbi.id)?.label ?? cbi.id;
  const csfLabel = matrixCSFs.find((c) => c.id === csf.id)?.shortLabel ?? csf.id;
  const personaLabel =
    matrixPersonas.find((p) => p.id === persona.id)?.label ?? persona.id;

  // Adisseo strength is loaded from the personas-matrix cell — proxy via
  // a fixed lookup. Higher strength means we have a flagship answer.
  const strengthByCsf: Record<CSFId, number> = {
    "csf-margin": 78,
    "csf-fcr": 88,
    "csf-disease": 64,
    "csf-regulatory": 72,
    "csf-carbon": 58,
    "csf-knowledge": 70,
  };
  const adisseoStrength = strengthByCsf[csf.id] ?? 60;

  const rationale = [
    `Top CBI: ${cbiLabel} (score ${cbi.score}, evidence: ${cbi.evidence.join(", ") || "n/a"})`,
    `Top CSF: ${csfLabel} (score ${csf.score}, evidence: ${csf.evidence.join(", ") || "n/a"})`,
    `Top persona: ${personaLabel} (score ${persona.score}, evidence: ${persona.evidence.join(", ") || "n/a"})`,
  ].join(" · ");

  return {
    articleId: article.id,
    cbi,
    cbiRanked: cbiHits,
    csf,
    csfRanked: csfHits,
    persona,
    personaRanked: personaHits,
    composite,
    adisseoStrength,
    rationale,
  };
}

/**
 * Score many articles in one call. Returns scores in the same order as input.
 */
export function scoreArticles(
  articles: ScrapedArticle[],
  hintsById: Record<string, LlmHints> = {},
  options?: { species?: string }
): ThreeAxisScore[] {
  return articles.map((a) => scoreArticle(a, hintsById[a.id], options));
}

/**
 * Comparison aggregation — when 3+ articles are loaded, build a heat
 * grid of axis-by-axis scores. Each axis row sums the article scores
 * so the operator can spot where competitor coverage is dense.
 */
export interface ComparisonGrid {
  cbiCols: { id: string; label: string }[];
  csfCols: { id: CSFId; label: string }[];
  personaCols: { id: PersonaId; label: string }[];
  rows: {
    article: ScrapedArticle;
    score: ThreeAxisScore;
  }[];
  /** Column totals — one number per axis col across all articles. */
  totals: {
    cbi: Record<string, number>;
    csf: Record<CSFId, number>;
    persona: Record<PersonaId, number>;
  };
}

export function buildComparisonGrid(
  articles: ScrapedArticle[],
  hintsById: Record<string, LlmHints> = {}
): ComparisonGrid {
  const scored = articles.map((a) => ({
    article: a,
    score: scoreArticle(a, hintsById[a.id]),
  }));

  const cbiCols = adiplanCBIs.map((c) => ({ id: c.id, label: c.label }));
  const csfCols = matrixCSFs.map((c) => ({ id: c.id, label: c.shortLabel }));
  const personaCols = matrixPersonas.map((p) => ({ id: p.id, label: p.label }));

  const totals = {
    cbi: Object.fromEntries(cbiCols.map((c) => [c.id, 0])) as Record<string, number>,
    csf: Object.fromEntries(csfCols.map((c) => [c.id, 0])) as Record<CSFId, number>,
    persona: Object.fromEntries(personaCols.map((p) => [p.id, 0])) as Record<
      PersonaId,
      number
    >,
  };

  for (const { score } of scored) {
    for (const h of score.cbiRanked) totals.cbi[h.id] = (totals.cbi[h.id] ?? 0) + h.score;
    for (const h of score.csfRanked) totals.csf[h.id] = (totals.csf[h.id] ?? 0) + h.score;
    for (const h of score.personaRanked)
      totals.persona[h.id] = (totals.persona[h.id] ?? 0) + h.score;
  }

  return { cbiCols, csfCols, personaCols, rows: scored, totals };
}

/**
 * Tiny tint helper for the heat-grid cells. Returns a Tailwind-style
 * background class given a score 0-100.
 */
export function heatTint(score: number): string {
  if (score >= 70) return "bg-rose-700 text-white";
  if (score >= 50) return "bg-rose-500 text-white";
  if (score >= 30) return "bg-rose-200 text-rose-900";
  if (score >= 15) return "bg-rose-50 text-rose-700";
  if (score >= 5) return "bg-stone-100 text-stone-600";
  return "bg-white text-stone-400";
}
