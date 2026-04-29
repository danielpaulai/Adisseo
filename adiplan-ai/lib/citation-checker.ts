/**
 * Citation checker
 * ----------------
 *
 * Phase 2 of the trust layer. Scores how well a piece of prose anchors its
 * claims to the Vault.
 *
 * Detects four citation patterns:
 *   1. Vault-id refs        — [v-poultry-agp-id-2026] / {v-aqua-asfu-2025}
 *   2. Anchored attributions — (Adisseo APAC, Q1 2026) / (Mintec, 2026)
 *   3. URLs / DOIs           — https://... / doi.org/10.1234/...
 *   4. Trial-context phrases — "in our APAC trial", "n=4 farms", "Q4 2025"
 *
 * Each citation is then resolved against the Vault. The output:
 *   - cited:        total detected
 *   - resolved:     verified against Vault (highest tier)
 *   - external:     URL / DOI / publication that's plausibly real
 *   - unverified:   detected but not resolvable
 *   - claimDensity: word count between two citations — too low = padded;
 *                   too high = dangerous (long stretches of unsupported claims)
 *
 * Composite citation score (0–100):
 *   base = 0
 *   + per-resolved-vault: 18 pts (capped at 60)
 *   + per-external-cite:  8 pts (capped at 24)
 *   + claim-density bonus:up to 16 pts when citations are well-spaced
 *   - unverified penalty: 4 pts each (capped at 24)
 *
 * The score floors at 0 and caps at 100. Bands match the rest of the
 * trust layer for UI consistency.
 */

import { seededVault, type VaultEntry } from "@/lib/vault";

export interface CitationDetected {
  /** Raw match string. */
  match: string;
  /** Detection bucket. */
  kind: "vault-id" | "attribution" | "url" | "doi" | "trial-context";
  /** Index in the source text. */
  index: number;
  /** Resolved Vault entry, if any. */
  resolved?: VaultEntry;
  /** True if the citation is structurally plausible even when unresolved. */
  external: boolean;
}

export interface CitationReport {
  cited: number;
  resolved: number;
  external: number;
  unverified: number;
  /** Words between citations (mean). 0 if 0 or 1 citation. */
  meanWordsPerCite: number;
  citations: CitationDetected[];
  /** 0–100 composite citation-depth score. */
  score: number;
  /** Same banding scheme as the rest of the trust layer. */
  band: "Clean" | "Light" | "Moderate" | "Heavy" | "Saturated";
  summary: string;
}

const VAULT_ID_RE = /[\[\{(]?\b(v-[a-z0-9-]{4,40})\b[\]\}\)]?/gi;

const URL_RE = /\bhttps?:\/\/[^\s)\]]+/gi;
const DOI_RE = /\b(10\.\d{4,9}\/[^\s)\]]+|doi\.org\/[^\s)\]]+)/gi;

/** "(Source name, year)" with year 19xx-21xx. */
const ATTRIBUTION_RE = /\(([A-Z][A-Za-z][A-Za-z0-9 .,&–\-]{2,60}?,\s*(?:Q[1-4]\s+)?(?:19|20|21)\d{2})\)/g;

/** "n=4 farms" or "(n=12)" or "n = 220,000 birds" — trial-context tells. */
const N_RE = /\bn\s*=\s*[\d,]+/gi;

/** Q1-Q4 yyyy / Q4 yyyy / yyyy-Q1. */
const QUARTER_RE = /\b(?:Q[1-4]\s+(?:19|20|21)\d{2}|(?:19|20|21)\d{2}\s*Q[1-4])\b/g;

const TRIAL_PHRASES_RE =
  /\b(in (?:our|the|a) (?:APAC |MY |VN |ID |TH |JP |CN )?(?:nursery |broiler |dairy |grow-out |commercial )?trial|trial protocol|on-farm result|recovery curve|control group)\b/gi;

function uniqByMatch(items: CitationDetected[]): CitationDetected[] {
  const seen = new Set<string>();
  const out: CitationDetected[] = [];
  for (const it of items) {
    const key = `${it.kind}|${it.match.toLowerCase()}|${it.index}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export function detectCitations(
  text: string,
  vault: VaultEntry[] = seededVault
): CitationDetected[] {
  if (!text || text.trim().length === 0) return [];
  const findings: CitationDetected[] = [];

  let m: RegExpExecArray | null;

  while ((m = VAULT_ID_RE.exec(text)) !== null) {
    const id = m[1];
    const resolved = vault.find((v) => v.id === id);
    findings.push({
      match: m[0],
      kind: "vault-id",
      index: m.index,
      resolved,
      external: false,
    });
  }

  while ((m = URL_RE.exec(text)) !== null) {
    findings.push({
      match: m[0],
      kind: "url",
      index: m.index,
      external: !m[0].startsWith("internal://"),
    });
  }

  while ((m = DOI_RE.exec(text)) !== null) {
    findings.push({ match: m[0], kind: "doi", index: m.index, external: true });
  }

  while ((m = ATTRIBUTION_RE.exec(text)) !== null) {
    const inner = m[1];
    // Try to resolve against Vault attribution / source name
    const resolved = vault.find(
      (v) =>
        v.title.toLowerCase().includes(inner.split(",")[0].toLowerCase().trim()) ||
        (v.attribution && v.attribution.toLowerCase().includes(inner.split(",")[0].toLowerCase().trim()))
    );
    findings.push({
      match: m[0],
      kind: "attribution",
      index: m.index,
      resolved,
      external: !resolved,
    });
  }

  // Trial-context counts at half-weight: only flag if multiple appear.
  const contextHits: CitationDetected[] = [];
  while ((m = N_RE.exec(text)) !== null) {
    contextHits.push({
      match: m[0],
      kind: "trial-context",
      index: m.index,
      external: false,
    });
  }
  while ((m = QUARTER_RE.exec(text)) !== null) {
    contextHits.push({
      match: m[0],
      kind: "trial-context",
      index: m.index,
      external: false,
    });
  }
  while ((m = TRIAL_PHRASES_RE.exec(text)) !== null) {
    contextHits.push({
      match: m[0],
      kind: "trial-context",
      index: m.index,
      external: false,
    });
  }
  // Only count trial-context as a half-citation when there are 2+ in the text.
  if (contextHits.length >= 2) findings.push(...contextHits);

  return uniqByMatch(findings).sort((a, b) => a.index - b.index);
}

export function scoreCitations(
  text: string,
  vault: VaultEntry[] = seededVault
): CitationReport {
  const cleanText = (text ?? "").trim();
  const citations = detectCitations(cleanText, vault);
  const resolved = citations.filter(
    (c) => c.resolved || (c.kind === "url" && !c.external)
  ).length;
  const externalReal = citations.filter((c) => c.external).length;
  const unverified = citations.filter(
    (c) => !c.resolved && !c.external && c.kind !== "trial-context"
  ).length;
  const trialContext = citations.filter((c) => c.kind === "trial-context").length;

  const words = cleanText.split(/\s+/).filter(Boolean).length;
  const allCites = citations.length;
  const meanWordsPerCite = allCites < 2 ? 0 : Math.round(words / allCites);

  // Score buckets
  let score = 0;
  score += Math.min(60, resolved * 18);
  score += Math.min(24, externalReal * 8);
  score += Math.min(8, trialContext * 2); // trial context partial credit

  // Density bonus — ideal 35–80 words per citation.
  let densityBonus = 0;
  if (allCites >= 2) {
    if (meanWordsPerCite >= 35 && meanWordsPerCite <= 80) densityBonus = 16;
    else if (meanWordsPerCite >= 25 && meanWordsPerCite <= 110) densityBonus = 10;
    else if (meanWordsPerCite >= 18) densityBonus = 4;
  }
  score += densityBonus;

  // Unverified penalty
  score -= Math.min(24, unverified * 4);

  // For very long text with zero citations, drive score very low.
  if (allCites === 0 && words >= 60) score = 0;
  if (words < 20) score = Math.max(score, 60); // tiny inputs aren't penalised

  score = Math.max(0, Math.min(100, score));

  const band: CitationReport["band"] =
    score >= 80
      ? "Clean"
      : score >= 60
        ? "Light"
        : score >= 40
          ? "Moderate"
          : score >= 20
            ? "Heavy"
            : "Saturated";

  let summary: string;
  if (allCites === 0 && words >= 60) {
    summary =
      "No citations detected — every claim is unanchored. Pull at least one Vault entry.";
  } else if (resolved === 0 && externalReal === 0) {
    summary = `${allCites} citation(s), but none resolve to the Vault. Add a [v-...] anchor.`;
  } else if (unverified > 0) {
    summary = `${resolved} resolved · ${externalReal} external · ${unverified} unverified. Resolve or remove the unverified claims.`;
  } else if (resolved >= 2 && meanWordsPerCite >= 35 && meanWordsPerCite <= 80) {
    summary = `${resolved} Vault-resolved citations, well-spaced. This deliverable is anchored.`;
  } else if (resolved >= 1) {
    summary = `${resolved} Vault-resolved · ${externalReal} external. Spacing: ~${meanWordsPerCite} words / cite.`;
  } else {
    summary = `${allCites} citation(s) detected.`;
  }

  return {
    cited: allCites,
    resolved,
    external: externalReal,
    unverified,
    meanWordsPerCite,
    citations,
    score,
    band,
    summary,
  };
}

/** Format a Vault entry's canonical citation string for "anchor in Vault" actions. */
export function formatCitation(entry: VaultEntry): string {
  const yr = entry.date.slice(0, 4);
  if (entry.kind === "trial" || entry.kind === "field") {
    const fcr = entry.metrics?.find((m) => m.label.toLowerCase().includes("fcr"));
    const lead = fcr ? `${fcr.value}${fcr.unit ?? ""} FCR delta` : entry.title;
    return `${lead} (Adisseo ${entry.regions[0] ?? "APAC"} trial, ${yr}) [${entry.id}]`;
  }
  if (entry.kind === "regulatory") {
    return `${entry.title} (${yr}) [${entry.id}]`;
  }
  if (entry.kind === "quote") {
    return `“${entry.summary.split(".")[0]}.” — ${entry.attribution ?? "anonymised"}, ${yr} [${entry.id}]`;
  }
  if (entry.kind === "publication") {
    return `${entry.title} [${entry.id}]`;
  }
  return `${entry.title} [${entry.id}]`;
}
