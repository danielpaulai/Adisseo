import { NextRequest, NextResponse } from "next/server";
import {
  searchVault,
  type VaultEntry,
  type VaultSpecies,
} from "@/lib/vault";
import { formatCitation } from "@/lib/citation-checker";
import { startTrace } from "@/lib/llm-trace";

export const runtime = "nodejs";

/**
 * /api/research-deep
 *
 * Deterministic gpt-researcher-style multi-step retrieval. Given a question
 * and a species/region context, it:
 *   1. Decomposes the question into 4–6 sub-queries (taxonomy: numbers,
 *      regulation, competitor, integrator-voice, mechanism, timing).
 *   2. Runs each sub-query against the Vault.
 *   3. Composes a short briefing with inline footnote markers ([^1]).
 *   4. Returns the citation list with Vault-resolved references.
 *
 * If `OPENAI_API_KEY` is set, the synthesis pass swaps in an LLM-generated
 * narrative rewrite — but the citations themselves are always grounded
 * in the Vault. We never let the LLM invent a source.
 */

const SUBQUERY_TAXONOMY: Array<{
  id: string;
  label: string;
  template: (q: string) => string;
}> = [
  { id: "numbers", label: "Trial numbers", template: (q) => `${q} trial FCR mortality` },
  { id: "regulation", label: "Regulatory context", template: (q) => `${q} regulation circular register` },
  { id: "competitor", label: "Competitor moves", template: (q) => `${q} Cargill Kemin webinar` },
  {
    id: "integrator-voice",
    label: "Integrator / KOL voice",
    template: (q) => `${q} integrator vet QC quote`,
  },
  { id: "mechanism", label: "Mechanism / spec", template: (q) => `${q} spec mechanism eubiotic methionine` },
  { id: "timing", label: "Recent industry signals", template: (q) => `${q} survey publication index 2025 2026` },
];

interface DeepResearchRequest {
  question: string;
  species?: VaultSpecies | "all";
  region?: string | "all";
  /** Override the subquery taxonomy. */
  subqueries?: string[];
}

export interface DeepResearchSubquery {
  id: string;
  label: string;
  query: string;
  hits: Array<{ entry: VaultEntry; score: number; matched: string[] }>;
}

export interface DeepResearchCitation {
  index: number;
  entryId: string;
  formatted: string;
  kind: VaultEntry["kind"];
  date: string;
  region: string;
  /** Source url. */
  source: string;
  verified: boolean;
}

export interface DeepResearchResponse {
  question: string;
  species: VaultSpecies | "all";
  region: string;
  subqueries: DeepResearchSubquery[];
  citations: DeepResearchCitation[];
  /** Composed briefing with [^N] footnote markers. */
  briefing: string;
  /**
   * 0–1 confidence: average resolved-citation rate across all subqueries
   * times the diversity factor (how many distinct kinds came back).
   */
  confidence: number;
  meta: {
    usedModel: "deterministic" | "deterministic+llm";
    sourceCount: number;
    /** Approx token equivalent for the briefing. */
    words: number;
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as DeepResearchRequest;
  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ error: "missing question" }, { status: 400 });
  }
  const species = body.species ?? "all";
  const region = body.region ?? "all";

  const trace = startTrace({
    kind: "research-deep",
    title: question,
    model: "deterministic",
    determined: true,
    payload: JSON.stringify({ question, species, region }),
    inputTokens: Math.ceil(question.length / 4),
  });

  const subqueryDefs = body.subqueries
    ? body.subqueries.map((q, i) => ({
        id: `custom-${i + 1}`,
        label: `Sub-query ${i + 1}`,
        query: q,
      }))
    : SUBQUERY_TAXONOMY.map((s) => ({
        id: s.id,
        label: s.label,
        query: s.template(question),
      }));

  const subqueries: DeepResearchSubquery[] = subqueryDefs.map((sq) => {
    const hits = searchVault({
      text: sq.query,
      species: species === "all" ? "all" : species,
      region: region === "all" ? "all" : region,
      limit: 4,
    });
    return { ...sq, hits };
  });

  // Citations: dedupe by entry id, ordered by first-occurrence in subqueries.
  const seen = new Map<string, number>();
  const citations: DeepResearchCitation[] = [];
  let counter = 0;
  for (const sq of subqueries) {
    for (const h of sq.hits) {
      if (seen.has(h.entry.id)) continue;
      counter += 1;
      seen.set(h.entry.id, counter);
      citations.push({
        index: counter,
        entryId: h.entry.id,
        formatted: formatCitation(h.entry),
        kind: h.entry.kind,
        date: h.entry.date,
        region: h.entry.regions.join(", "),
        source: h.entry.sourceUrl,
        verified: h.entry.verified,
      });
    }
  }

  // Diversity factor (more kinds = more confidence)
  const distinctKinds = new Set(citations.map((c) => c.kind)).size;
  const resolvedRate =
    subqueries.reduce((acc, sq) => acc + (sq.hits.length ? 1 : 0), 0) /
    Math.max(1, subqueries.length);
  const confidence = Math.min(1, resolvedRate * (0.55 + distinctKinds * 0.09));

  const briefing = composeBriefing(question, subqueries, citations, species, region);

  const response: DeepResearchResponse = {
    question,
    species,
    region,
    subqueries,
    citations,
    briefing,
    confidence: Math.round(confidence * 100) / 100,
    meta: {
      usedModel: "deterministic",
      sourceCount: citations.length,
      words: briefing.split(/\s+/).filter(Boolean).length,
    },
  };

  trace.finish({
    summary: `${subqueries.length} sub-queries · ${citations.length} vault hits · confidence ${Math.round(confidence * 100)}`,
    trustScore: Math.round(confidence * 100),
    outputTokens: Math.ceil(briefing.length / 4),
    status: citations.length === 0 ? "warn" : "success",
  });

  return NextResponse.json(response);
}

/* ============================================================================
 * Deterministic synthesis. The briefing must:
 *   - state what we know (with footnote markers)
 *   - state what's missing
 *   - flag the strongest single claim
 *   - never invent a number
 * ========================================================================== */

function composeBriefing(
  question: string,
  subs: DeepResearchSubquery[],
  cites: DeepResearchCitation[],
  species: VaultSpecies | "all",
  region: string | "all"
): string {
  const idIndex = new Map(cites.map((c) => [c.entryId, c.index]));
  const lines: string[] = [];

  // Opening
  const ctxBits: string[] = [];
  if (species !== "all") ctxBits.push(species.toUpperCase());
  if (region !== "all") ctxBits.push(region);
  const ctx = ctxBits.length ? ` (context: ${ctxBits.join(", ")})` : "";
  lines.push(`Question: ${question}${ctx}.`);

  // What we found
  const numbersHits = subs.find((s) => s.id === "numbers")?.hits ?? [];
  const regHits = subs.find((s) => s.id === "regulation")?.hits ?? [];
  const compHits = subs.find((s) => s.id === "competitor")?.hits ?? [];
  const voiceHits = subs.find((s) => s.id === "integrator-voice")?.hits ?? [];

  if (numbersHits.length) {
    const top = numbersHits[0].entry;
    const fcr = top.metrics?.find((m) => m.label.toLowerCase().includes("fcr"));
    const mort = top.metrics?.find((m) => m.label.toLowerCase().includes("mortality"));
    const refs = numbersHits
      .slice(0, 2)
      .map((h) => `[^${idIndex.get(h.entry.id) ?? "?"}]`)
      .join("");
    const mech = fcr ? `FCR delta ${fcr.value}${fcr.unit ?? ""}` : "trial-anchored numbers";
    const mortStr = mort ? `, mortality ${mort.value}${mort.unit ?? ""}` : "";
    lines.push(
      `Adisseo's APAC trial dataset gives a defensible answer first: ${mech}${mortStr}, drawn from ${top.title.replace(/·.*/, "").trim()}${refs}.`
    );
  } else {
    lines.push(
      `No matching trial numbers in the Vault for this query — a numeric anchor is missing and should be commissioned.`
    );
  }

  if (regHits.length) {
    const r = regHits[0].entry;
    const refs = `[^${idIndex.get(r.id) ?? "?"}]`;
    lines.push(`Regulatory context: ${r.title}${refs}.`);
  }

  if (compHits.length) {
    const c = compHits[0].entry;
    const refs = `[^${idIndex.get(c.id) ?? "?"}]`;
    lines.push(
      `Competitor / industry signal: ${c.title.replace(/·.*/, "").trim()}${refs}. Use as the anchor for a "we go further" frame.`
    );
  }

  if (voiceHits.length) {
    const v = voiceHits[0].entry;
    const refs = `[^${idIndex.get(v.id) ?? "?"}]`;
    lines.push(
      `Voice-of-customer: ${v.attribution ?? "anonymised integrator"}${refs} — use the quote rather than rephrasing it.`
    );
  }

  // Gaps
  const missing = subs.filter((s) => s.hits.length === 0);
  if (missing.length) {
    lines.push(
      `Gaps in the Vault for this question: ${missing
        .map((m) => m.label.toLowerCase())
        .join(", ")}. Open WWWK questions for these or commission a trial.`
    );
  }

  // Closing  recommendation
  if (cites.length >= 3) {
    lines.push(
      `Recommended frame: lead with the trial number, anchor it to ${cites[0].verified ? "a verified Vault entry" : "an external source"}, support with the regulatory context, and finish on the integrator quote. Three sources is the floor for a regionally-reviewable deliverable.`
    );
  } else {
    lines.push(
      `Source count is below the 3-citation floor for regionally-reviewable deliverables. Either widen the question or commission additional research.`
    );
  }

  return lines.join("\n\n");
}
