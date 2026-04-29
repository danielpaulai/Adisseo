/**
 * Voice fingerprinting
 * --------------------
 *
 * Phase 3 of the trust-layer rollout. DSPy-style: each species manager has
 * their own writing voice, distinct from the customer-level brand voice.
 * We fingerprint their voice from 2–3 writing samples and then score new
 * drafts against their profile.
 *
 * The fingerprint is intentionally interpretable — each axis is a single
 * statistic the manager can argue with. No black-box embeddings.
 *
 * Profile axes:
 *   1. avgSentenceLen      — mean words per sentence
 *   2. lenStdDev           — sentence-length variance
 *   3. typeTokenRatio      — vocabulary richness
 *   4. hedgingRate         — "may / might / could / appears" per 1000 words
 *   5. citationDensity     — (n=, %, Q[1-4], year) markers per 1000 words
 *   6. emDashRate          — em-dashes per 1000 words
 *   7. firstPersonRate     — "I/we/our" per 1000 words
 *   8. signaturePhrases    — top-N idiosyncratic 3-grams
 *   9. avoidedWords        — words the manager never uses (vs. baseline)
 *  10. punctuationRhythm   — ratio of short to long sentences
 */

const HEDGING = ["may", "might", "could", "appears", "suggests", "tends", "seems", "seemingly", "perhaps", "likely"];
const FIRST_PERSON = ["i", "i've", "i'd", "i'm", "we", "we've", "we'd", "we're", "our", "us", "ours"];

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "in", "on", "at", "to", "for", "with", "by", "from", "as",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "this",
  "that", "these", "those", "it", "its", "they", "them", "their", "you", "your", "he", "she", "his",
  "her", "if", "then", "else", "so", "than", "such",
]);

export interface VoiceProfile {
  /** Stable id, e.g. "vish" / "aileen" / "antoine" / "claire" / "ricardo". */
  managerId: string;
  /** Human label. */
  managerName: string;
  /** Number of sample words used. */
  wordCount: number;
  /** Number of sentences in the corpus. */
  sentenceCount: number;
  /* Per-1000-word rates. */
  avgSentenceLen: number;
  lenStdDev: number;
  typeTokenRatio: number;
  hedgingRate: number;
  citationDensity: number;
  emDashRate: number;
  firstPersonRate: number;
  /** Ratio of sentences ≤12 words to sentences ≥25 words. >1 = punchy, <1 = formal. */
  punctuationRhythm: number;
  /** Top idiosyncratic 3-grams. */
  signaturePhrases: string[];
  /** Words underused by this voice vs. the baseline. */
  avoidedWords: string[];
  /** Sample concat preview (first 280 chars). */
  preview: string;
  /** When the profile was last computed. */
  computedAt: string;
}

function getSentences(text: string): string[] {
  const m = text.match(/[^.!?\n]+[.!?]+|\S[^.!?\n]+$/g) ?? [];
  return m.map((s) => s.trim()).filter((s) => s.length > 0);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\-\s%]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function ngrams(words: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    out.push(words.slice(i, i + n).join(" "));
  }
  return out;
}

function rate(count: number, words: number): number {
  if (!words) return 0;
  return Math.round(((count / words) * 1000) * 10) / 10;
}

const BASELINE_VOCAB = new Set([
  "feed", "trial", "fcr", "result", "data", "team", "study", "show", "use", "make",
  "improve", "deliver", "share", "build", "support", "drive", "growth", "value", "impact",
]);

/**
 * Build a voice profile from one or more writing samples.
 */
export function buildVoiceProfile(
  managerId: string,
  managerName: string,
  samples: string[]
): VoiceProfile {
  const corpus = samples.filter(Boolean).join("\n\n");
  const sentences = getSentences(corpus);
  const words = tokenize(corpus);
  const wordCount = words.length;
  const sentenceLens = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);

  const avgSentenceLen =
    sentenceLens.length === 0
      ? 0
      : Math.round(
          (sentenceLens.reduce((a, b) => a + b, 0) / sentenceLens.length) * 10
        ) / 10;
  const variance =
    sentenceLens.length === 0
      ? 0
      : sentenceLens.reduce((acc, l) => acc + Math.pow(l - avgSentenceLen, 2), 0) /
        sentenceLens.length;
  const lenStdDev = Math.round(Math.sqrt(variance) * 10) / 10;

  const uniques = new Set(words);
  const typeTokenRatio =
    wordCount === 0 ? 0 : Math.round((uniques.size / wordCount) * 100) / 100;

  const hedgingCount = words.filter((w) => HEDGING.includes(w)).length;
  const firstPersonCount = words.filter((w) => FIRST_PERSON.includes(w)).length;

  const citationMatches =
    (corpus.match(/\bn\s*=\s*[\d,]+/gi) ?? []).length +
    (corpus.match(/\bQ[1-4]\s+(?:19|20|21)\d{2}\b/g) ?? []).length +
    (corpus.match(/\b\d+(?:\.\d+)?\s*%/g) ?? []).length +
    (corpus.match(/\[v-[a-z0-9-]+\]/gi) ?? []).length;
  const emDashCount = (corpus.match(/—/g) ?? []).length;

  const shortSent = sentenceLens.filter((l) => l <= 12).length;
  const longSent = sentenceLens.filter((l) => l >= 25).length;
  const punctuationRhythm = longSent === 0 ? shortSent : Math.round((shortSent / longSent) * 10) / 10;

  // Signature phrases — top 3-grams that don't start with stopwords
  const tri = ngrams(words, 3);
  const triCounts = new Map<string, number>();
  for (const g of tri) {
    const head = g.split(" ")[0];
    if (STOPWORDS.has(head)) continue;
    if (g.split(" ").every((t) => STOPWORDS.has(t))) continue;
    triCounts.set(g, (triCounts.get(g) ?? 0) + 1);
  }
  const signaturePhrases = Array.from(triCounts.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([g]) => g);

  // Words baseline expects but this voice underuses
  const usedSet = new Set(words);
  const avoidedWords = Array.from(BASELINE_VOCAB).filter((w) => !usedSet.has(w)).slice(0, 8);

  const preview = corpus.slice(0, 280) + (corpus.length > 280 ? "…" : "");

  return {
    managerId,
    managerName,
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceLen,
    lenStdDev,
    typeTokenRatio,
    hedgingRate: rate(hedgingCount, wordCount),
    citationDensity: rate(citationMatches, wordCount),
    emDashRate: rate(emDashCount, wordCount),
    firstPersonRate: rate(firstPersonCount, wordCount),
    punctuationRhythm,
    signaturePhrases,
    avoidedWords,
    preview,
    computedAt: new Date().toISOString(),
  };
}

/* ============================================================================
 * Score a new draft against a profile.
 * ========================================================================== */

export interface VoiceMatchAxis {
  label: string;
  /** Profile value. */
  expected: number;
  /** Draft value. */
  actual: number;
  /** Absolute distance contribution to the score (lower = better match). */
  distance: number;
  /** Tolerance band the axis is allowed to drift in. */
  tolerance: number;
  /** "in-band" | "drift" | "off". */
  status: "in-band" | "drift" | "off";
}

export interface VoiceMatchReport {
  managerId: string;
  managerName: string;
  /** 0–100 — how well the draft matches the profile. */
  score: number;
  band: "Clean" | "Light" | "Moderate" | "Heavy" | "Saturated";
  axes: VoiceMatchAxis[];
  /** Top suggestions (axis-derived). */
  notes: string[];
  /** Words in the draft. */
  draftWords: number;
}

export function scoreAgainstVoiceProfile(
  text: string,
  profile: VoiceProfile
): VoiceMatchReport {
  const draft = buildVoiceProfile("draft", "draft", [text]);
  const axes: VoiceMatchAxis[] = [];

  function add(
    label: string,
    expected: number,
    actual: number,
    tolerance: number
  ) {
    const distance = Math.abs(actual - expected);
    const status: VoiceMatchAxis["status"] =
      distance <= tolerance
        ? "in-band"
        : distance <= tolerance * 2.2
          ? "drift"
          : "off";
    axes.push({ label, expected, actual, distance, tolerance, status });
  }

  add("Avg sentence length", profile.avgSentenceLen, draft.avgSentenceLen, 4);
  add("Sentence variance", profile.lenStdDev, draft.lenStdDev, 3);
  add("Vocabulary richness", profile.typeTokenRatio, draft.typeTokenRatio, 0.08);
  add("Hedging rate", profile.hedgingRate, draft.hedgingRate, 4);
  add("Citation density", profile.citationDensity, draft.citationDensity, 5);
  add("Em-dash density", profile.emDashRate, draft.emDashRate, 2);
  add("First-person rate", profile.firstPersonRate, draft.firstPersonRate, 4);
  add("Punctuation rhythm", profile.punctuationRhythm, draft.punctuationRhythm, 0.7);

  // Score: each in-band axis = 12 points, drift = 6, off = 0. Plus 4-point
  // bonus for at least one signature phrase reuse.
  let score = 0;
  for (const ax of axes) {
    score += ax.status === "in-band" ? 12 : ax.status === "drift" ? 6 : 0;
  }
  // Signature phrase bonus
  const lowerText = text.toLowerCase();
  const phraseHits = profile.signaturePhrases.filter((p) => lowerText.includes(p)).length;
  score += Math.min(4, phraseHits * 2);

  // Cap at 100
  score = Math.max(0, Math.min(100, score));

  const band: VoiceMatchReport["band"] =
    score >= 80
      ? "Clean"
      : score >= 60
        ? "Light"
        : score >= 40
          ? "Moderate"
          : score >= 20
            ? "Heavy"
            : "Saturated";

  const notes: string[] = [];
  for (const ax of axes) {
    if (ax.status === "off") {
      const direction = ax.actual > ax.expected ? "higher" : "lower";
      notes.push(
        `${ax.label}: ${ax.actual} vs. ${profile.managerName}'s ${ax.expected} (${direction} than profile)`
      );
    }
  }
  if (phraseHits === 0 && profile.signaturePhrases.length > 0) {
    notes.push(
      `No signature-phrase reuse. Try one of: “${profile.signaturePhrases.slice(0, 2).join("” / “")}”.`
    );
  }
  if (notes.length === 0) {
    notes.push(`Match is in-band on all 8 axes.`);
  }

  return {
    managerId: profile.managerId,
    managerName: profile.managerName,
    score,
    band,
    axes,
    notes,
    draftWords: draft.wordCount,
  };
}

/* ============================================================================
 * Default profiles — seeded so the demo lights up before the user enters samples.
 * Numbers chosen to roughly match the four species managers' actual styles.
 * ========================================================================== */

export const DEFAULT_VOICE_PROFILES: Record<string, VoiceProfile> = {
  vish: {
    managerId: "vish",
    managerName: "Vish (Poultry)",
    wordCount: 220,
    sentenceCount: 18,
    avgSentenceLen: 14.2,
    lenStdDev: 6.1,
    typeTokenRatio: 0.62,
    hedgingRate: 5.4,
    citationDensity: 12.3,
    emDashRate: 2.1,
    firstPersonRate: 8.2,
    punctuationRhythm: 1.3,
    signaturePhrases: [
      "across four farms",
      "fcr delta of",
      "integrator nutrition manager",
    ],
    avoidedWords: ["impact", "growth", "value", "drive"],
    preview:
      "Across four Indonesian farms in Q1, the eubiotic protocol held FCR within 0.05 points of pre-AGP baseline. The CP nutrition manager confirmed mortality dropped 0.6pp. We're sending the trial protocol on request.",
    computedAt: new Date().toISOString(),
  },
  aileen: {
    managerId: "aileen",
    managerName: "Aileen (Aqua)",
    wordCount: 240,
    sentenceCount: 22,
    avgSentenceLen: 11.8,
    lenStdDev: 4.5,
    typeTokenRatio: 0.65,
    hedgingRate: 3.1,
    citationDensity: 14.0,
    emDashRate: 1.4,
    firstPersonRate: 6.5,
    punctuationRhythm: 1.6,
    signaturePhrases: [
      "acceptance gate at",
      "mill qc desk",
      "post-mix testing",
    ],
    avoidedWords: ["impact", "team", "share"],
    preview:
      "Acceptance-gate testing at the receiving dock catches DON contamination before it reaches the mixer. In a Q4 2025 trial, 12 batches showed a 38% reduction in aflatoxin carry-over. The mill QC desk runs the protocol in 22 minutes.",
    computedAt: new Date().toISOString(),
  },
  antoine: {
    managerId: "antoine",
    managerName: "Antoine (Ruminants)",
    wordCount: 260,
    sentenceCount: 17,
    avgSentenceLen: 15.6,
    lenStdDev: 7.3,
    typeTokenRatio: 0.59,
    hedgingRate: 4.1,
    citationDensity: 11.0,
    emDashRate: 3.4,
    firstPersonRate: 7.0,
    punctuationRhythm: 1.0,
    signaturePhrases: [
      "kg per cow",
      "co-op procurement",
      "summer-yield drop",
    ],
    avoidedWords: ["amazing", "drive", "growth"],
    preview:
      "Hokkaido summer-yield drop fell from 2.4 to 0.9 kg per cow per day under the heat-stress nutrition pack — across 240 cows, three herds, the J-credit threshold within reach. Co-op procurement called for a tighter spec next quarter.",
    computedAt: new Date().toISOString(),
  },
  claire: {
    managerId: "claire",
    managerName: "Claire (Swine)",
    wordCount: 230,
    sentenceCount: 28,
    avgSentenceLen: 8.2,
    lenStdDev: 3.4,
    typeTokenRatio: 0.66,
    hedgingRate: 2.0,
    citationDensity: 10.5,
    emDashRate: 1.0,
    firstPersonRate: 9.4,
    punctuationRhythm: 2.4,
    signaturePhrases: [
      "asf nursery recovery",
      "vet desk says",
      "fcr 1 62",
    ],
    avoidedWords: ["impact", "value", "deliver"],
    preview:
      "ASF nursery recovery. Four farms. Mortality down 0.7pp. FCR 1.62 vs. 1.71 control. The vet desk says the recovery curve is 2.8 days shorter. Cargill ran the same playbook in Q3 2025. We have the trial protocol.",
    computedAt: new Date().toISOString(),
  },
  ricardo: {
    managerId: "ricardo",
    managerName: "Ricardo (APAC)",
    wordCount: 280,
    sentenceCount: 21,
    avgSentenceLen: 13.3,
    lenStdDev: 5.5,
    typeTokenRatio: 0.61,
    hedgingRate: 3.6,
    citationDensity: 9.0,
    emDashRate: 2.0,
    firstPersonRate: 11.0,
    punctuationRhythm: 1.5,
    signaturePhrases: [
      "qualified-view-to-conversion",
      "we go further",
      "above the benchmark",
    ],
    avoidedWords: ["amazing", "synergy"],
    preview:
      "Seven serious viewers. Three customer conversions. The 43% qualified-to-conversion rate is the bar. We've held it for two quarters. Every new deliverable is graded against it.",
    computedAt: new Date().toISOString(),
  },
};

export const MANAGER_OPTIONS: Array<{ id: string; name: string; species: string; color: string }> = [
  { id: "vish", name: "Vish", species: "Poultry", color: "amber" },
  { id: "aileen", name: "Aileen", species: "Aqua", color: "sky" },
  { id: "antoine", name: "Antoine", species: "Ruminants", color: "rose" },
  { id: "claire", name: "Claire", species: "Swine", color: "emerald" },
  { id: "ricardo", name: "Ricardo", species: "APAC lead", color: "violet" },
];
