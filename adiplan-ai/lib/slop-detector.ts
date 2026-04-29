/**
 * AdiPlan Slop Detector
 * ---------------------
 *
 * TypeScript port of the slop-guard rule taxonomy (eric-tramel/slop-guard,
 * MIT-licensed). Adapted for in-browser + server-side scoring with no Python
 * dependency. Returns a 0–100 score, a band label, weighted violations
 * with surrounding context, and concrete fix advice.
 *
 * 16 rule families covering:
 *   - stock hype words
 *   - boilerplate phrases / throat-clearing openers
 *   - assistant-tone markers
 *   - weasel phrasing
 *   - AI self-disclosure
 *   - placeholder text
 *   - markdown structural overuse (bullets, blockquotes, hrules)
 *   - sentence rhythm / monotony
 *   - em-dash / colon overuse
 *   - contrast tells ("not just X, but Y")
 *   - pithy fragments / aphoristic closers
 *   - repeated 4–8 word phrases
 *   - copula chains
 *   - extreme-long sentences
 *
 * Scoring: score = 100 * exp(-lambda * weightedDensity)
 *   weightedDensity = sum(rule.weight * hits) / words * 1000
 *   lambda is calibrated so 5 stock hype words per 1000 words → ~70 (Light).
 *
 * Bands:  80–100 Clean | 60–79 Light | 40–59 Moderate | 20–39 Heavy | 0–19 Saturated
 */

export type SlopBand = "Clean" | "Light" | "Moderate" | "Heavy" | "Saturated";

export interface SlopViolation {
  ruleId: string;
  ruleName: string;
  severity: "low" | "medium" | "high";
  weight: number;
  match: string;
  context: string;
  advice: string;
  index: number;
}

export interface SlopReport {
  score: number;
  band: SlopBand;
  words: number;
  weightedDensity: number;
  violations: SlopViolation[];
  /** Per-rule hit counts (for the UI summary). */
  counts: Record<string, number>;
}

/* ============================================================================
 * Rule library
 * ========================================================================== */

interface SlopRule {
  id: string;
  name: string;
  weight: number;
  severity: "low" | "medium" | "high";
  /** Concrete fix suggestion shown to the writer. */
  advice: string;
  /** Patterns are matched globally, case-insensitive. Use word boundaries. */
  patterns: RegExp[];
}

const HYPE_WORDS = [
  "innovative",
  "leverage",
  "leveraging",
  "robust",
  "seamless",
  "seamlessly",
  "cutting-edge",
  "state-of-the-art",
  "best-in-class",
  "world-class",
  "next-generation",
  "next-gen",
  "game-changer",
  "game-changing",
  "revolutionary",
  "groundbreaking",
  "transformative",
  "paradigm-shift",
  "paradigm shift",
  "synergy",
  "synergies",
  "synergistic",
  "industry-leading",
  "industry leading",
  "thought leadership",
  "low-hanging fruit",
  "move the needle",
  "circle back",
  "deep dive",
  "holistic",
  "scalable solution",
  "end-to-end solution",
  "mission-critical",
];

const BOILERPLATE_OPENERS = [
  "in today's fast-paced world",
  "in today's rapidly changing",
  "in the ever-evolving landscape",
  "in the ever-changing landscape",
  "in the modern world",
  "more than ever before",
  "now more than ever",
  "it's no secret that",
  "it goes without saying",
  "in this day and age",
  "let's dive in",
  "let's dive into",
  "let me start by saying",
  "without further ado",
];

const ASSISTANT_MARKERS = [
  "i hope this helps",
  "i'd be happy to",
  "let me know if you have",
  "feel free to ask",
  "feel free to reach out",
  "i'm glad you asked",
  "great question",
  "that's a great question",
  "as an ai",
  "as a language model",
  "i'm an ai",
  "i don't have personal",
  "i don't have access to real-time",
  "as of my last update",
  "certainly!",
  "absolutely!",
];

const WEASEL_PHRASES = [
  "many believe",
  "experts say",
  "studies show",
  "research shows",
  "it could be argued",
  "some would argue",
  "it is widely accepted",
  "it is generally believed",
  "scientists agree",
  "according to some",
  "many people think",
  "it's important to note",
  "it should be noted",
  "it's worth noting",
];

const APHORISTIC_CLOSERS = [
  "and that's how",
  "and that's the magic of",
  "and that, in a nutshell, is",
  "in conclusion",
  "to wrap things up",
  "to sum it all up",
  "at the end of the day",
  "the bottom line is",
  "the takeaway is",
];

const PLACEHOLDER_PATTERNS = [
  "lorem ipsum",
  "todo:",
  "tbd",
  "tba",
  "[insert ",
  "[your ",
  "<insert ",
  "<your ",
  "{{",
  "}}",
  "xxx",
  "fixme",
];

/** Escape any regex-meta character so a literal phrase can be used as a pattern. */
function escapeForRegex(s: string): string {
  return s.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

function literalRe(words: string[]): RegExp[] {
  return words.map((w) => new RegExp(`\\b${escapeForRegex(w)}\\b`, "gi"));
}

function literalContainsRe(phrases: string[]): RegExp[] {
  return phrases.map((p) => new RegExp(escapeForRegex(p), "gi"));
}

const RULES: SlopRule[] = [
  {
    id: "hype-words",
    name: "Stock hype words",
    weight: 4,
    severity: "high",
    advice:
      "Replace with the concrete claim. \"Innovative\" → the actual mechanism. \"Leverage\" → \"use\".",
    patterns: literalRe(HYPE_WORDS),
  },
  {
    id: "boilerplate-opener",
    name: "Boilerplate / throat-clearing opener",
    weight: 5,
    severity: "high",
    advice:
      "Cut the warm-up sentence. Start with the claim. \"In today's fast-paced world\" never adds information.",
    patterns: literalContainsRe(BOILERPLATE_OPENERS),
  },
  {
    id: "assistant-marker",
    name: "Assistant tone marker",
    weight: 6,
    severity: "high",
    advice:
      "Drop the AI-assistant register — \"I hope this helps\", \"As an AI\". Brand voice has no chatbot tics.",
    patterns: literalContainsRe(ASSISTANT_MARKERS),
  },
  {
    id: "weasel",
    name: "Unattributed weasel phrasing",
    weight: 3,
    severity: "medium",
    advice:
      "Either name the source (\"Adisseo APAC trial, 2025\") or remove the claim.",
    patterns: literalContainsRe(WEASEL_PHRASES),
  },
  {
    id: "aphoristic-closer",
    name: "Aphoristic closer / wrap-up sentence",
    weight: 3,
    severity: "medium",
    advice:
      "End on the proof point or the CTA. \"And that's how\" / \"in conclusion\" pads without closing.",
    patterns: literalContainsRe(APHORISTIC_CLOSERS),
  },
  {
    id: "placeholder",
    name: "Placeholder / scaffolded text",
    weight: 8,
    severity: "high",
    advice:
      "Resolve every TODO / [insert] / lorem-ipsum before the deliverable can ship.",
    patterns: literalContainsRe(PLACEHOLDER_PATTERNS),
  },
  {
    id: "em-dash",
    name: "Em-dash overuse",
    weight: 1,
    severity: "low",
    advice:
      "Cap em-dashes at ~1 per 250 words. Replace with periods or commas to vary cadence.",
    patterns: [/—/g],
  },
  {
    id: "contrast-tell",
    name: "\"Not just X, but Y\" contrast tell",
    weight: 4,
    severity: "high",
    advice:
      "This is the most-loved LLM rhetorical trope. Pick one side and commit.",
    patterns: [
      /\bnot just [a-z\s]{2,30}, but [a-z]/gi,
      /\bisn't just [a-z\s]{2,30}, it's [a-z]/gi,
      /\bit's not [a-z\s]{2,30}, it's [a-z]/gi,
    ],
  },
  {
    id: "fluff-intensifier",
    name: "Fluff intensifier",
    weight: 2,
    severity: "medium",
    advice:
      "Cut \"truly\", \"deeply\", \"absolutely\", \"literally\" — they soften the claim.",
    patterns: literalRe([
      "truly",
      "deeply",
      "absolutely",
      "literally",
      "really really",
      "very very",
      "extremely important",
    ]),
  },
  {
    id: "triple-construction",
    name: "Triple construction (parallel three-part list)",
    weight: 2,
    severity: "medium",
    advice:
      "LLMs default to threes. If two of the three are filler, drop them.",
    patterns: [
      // catches "X, Y, and Z" patterns where each item is multi-word and adjective-heavy
      /\b\w+ly,\s\w+ly,?\s(?:and\s)?\w+ly\b/gi,
    ],
  },
  {
    id: "claim-language",
    name: "Defensible-claim breach (medical / regulatory)",
    weight: 8,
    severity: "high",
    advice:
      "Adisseo / B2B-agro deliverables cannot use \"cure\", \"prevent\", \"guarantee\", \"treats\". Replace with the trial-anchored claim (\"reduces by N% in trial Y\").",
    patterns: literalRe([
      "cures",
      "cure",
      "prevents",
      "prevent",
      "guaranteed",
      "guarantee",
      "treats",
      "miracle",
      "100% effective",
    ]),
  },
];

/* ============================================================================
 * Structural rules — sentence rhythm, markdown overuse, copula chains.
 * These aren't regex-pattern based; they look at structure of the whole text.
 * ========================================================================== */

interface StructuralRule {
  id: string;
  name: string;
  weight: number;
  severity: "low" | "medium" | "high";
  advice: string;
  evaluate: (text: string) => Array<{ match: string; context: string; index: number }>;
}

function getSentences(text: string): Array<{ s: string; index: number }> {
  // Naive sentence splitter — fine for prose linting.
  const out: Array<{ s: string; index: number }> = [];
  const re = /[^.!?\n]+[.!?]+|\S[^.!?\n]+$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({ s: m[0].trim(), index: m.index });
  }
  return out;
}

const STRUCTURAL_RULES: StructuralRule[] = [
  {
    id: "extreme-long-sentence",
    name: "Extreme-long sentence",
    weight: 3,
    severity: "medium",
    advice:
      "Sentences over 45 words lose every reader past word 30. Split.",
    evaluate: (text) =>
      getSentences(text)
        .filter((s) => s.s.split(/\s+/).length > 45)
        .map((s) => ({
          match: s.s.slice(0, 80) + (s.s.length > 80 ? "…" : ""),
          context: s.s,
          index: s.index,
        })),
  },
  {
    id: "monotonous-rhythm",
    name: "Monotonous sentence rhythm",
    weight: 2,
    severity: "medium",
    advice:
      "Vary sentence length. Three or more consecutive sentences within ±15% of each other reads like a pulse.",
    evaluate: (text) => {
      const sents = getSentences(text);
      if (sents.length < 5) return [];
      const lens = sents.map((s) => s.s.split(/\s+/).length);
      const hits: Array<{ match: string; context: string; index: number }> = [];
      for (let i = 0; i < lens.length - 4; i++) {
        const window = lens.slice(i, i + 5);
        const avg = window.reduce((a, b) => a + b, 0) / 5;
        const flat = window.every((l) => Math.abs(l - avg) / avg <= 0.15);
        if (flat) {
          hits.push({
            match: `5 consecutive sentences ~${Math.round(avg)} words each`,
            context: sents
              .slice(i, i + 5)
              .map((s) => s.s)
              .join(" "),
            index: sents[i].index,
          });
          break; // one finding is enough
        }
      }
      return hits;
    },
  },
  {
    id: "copula-chain",
    name: "Copula chain (\"X is Y. Y is Z.\")",
    weight: 2,
    severity: "medium",
    advice:
      "Three or more \"is\"-led sentences in a row reads like an LLM definition cascade. Mix in a concrete verb.",
    evaluate: (text) => {
      const sents = getSentences(text);
      const flags: number[] = [];
      sents.forEach((s, i) => {
        if (/^\s*\w+\s+(is|are|was|were)\s/i.test(s.s)) flags.push(i);
      });
      const hits: Array<{ match: string; context: string; index: number }> = [];
      for (let i = 0; i < flags.length - 2; i++) {
        if (flags[i + 1] === flags[i] + 1 && flags[i + 2] === flags[i] + 2) {
          hits.push({
            match: "3+ consecutive copula-led sentences",
            context: sents
              .slice(flags[i], flags[i] + 3)
              .map((s) => s.s)
              .join(" "),
            index: sents[flags[i]].index,
          });
          break;
        }
      }
      return hits;
    },
  },
  {
    id: "bullet-overuse",
    name: "Bullet-list overuse",
    weight: 2,
    severity: "medium",
    advice:
      "If more than 60% of the text is bulleted, the reader has no narrative. Convert at least one list to prose.",
    evaluate: (text) => {
      const lines = text.split(/\r?\n/);
      const total = lines.length || 1;
      const bullets = lines.filter((l) => /^\s*[-*•]\s/.test(l)).length;
      if (bullets / total > 0.6 && bullets > 6) {
        return [
          {
            match: `${bullets} of ${total} lines are bullets (${Math.round(
              (bullets / total) * 100
            )}%)`,
            context: lines.slice(0, 6).join(" · "),
            index: 0,
          },
        ];
      }
      return [];
    },
  },
  {
    id: "repeated-phrase",
    name: "Repeated 4–8 word phrase",
    weight: 4,
    severity: "high",
    advice:
      "An LLM tic. If the same 4–8 word phrase appears twice, the second use is rewriting the first.",
    evaluate: (text) => {
      const tokens = text.toLowerCase().split(/\s+/);
      const seen = new Map<string, number>();
      const hits: Array<{ match: string; context: string; index: number }> = [];
      for (let n = 4; n <= 8; n++) {
        for (let i = 0; i <= tokens.length - n; i++) {
          const phrase = tokens.slice(i, i + n).join(" ");
          if (phrase.length < 16) continue;
          if (/[.!?,;:]/.test(phrase)) continue;
          seen.set(phrase, (seen.get(phrase) ?? 0) + 1);
        }
      }
      for (const [phrase, count] of seen.entries()) {
        if (count >= 2 && hits.length < 3) {
          const ix = text.toLowerCase().indexOf(phrase);
          hits.push({
            match: `"${phrase}" × ${count}`,
            context: text.slice(Math.max(0, ix - 30), ix + phrase.length + 30),
            index: ix,
          });
        }
      }
      return hits;
    },
  },
];

/* ============================================================================
 * Public API
 * ========================================================================== */

const LAMBDA = 0.025; // calibrated so weightedDensity ~30 → score ~47 (Moderate)

export function scoreSlop(rawText: string): SlopReport {
  const text = (rawText ?? "").trim();
  if (!text) {
    return {
      score: 100,
      band: "Clean",
      words: 0,
      weightedDensity: 0,
      violations: [],
      counts: {},
    };
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 10) {
    // Per slop-guard: tiny inputs are always "Clean".
    return {
      score: 100,
      band: "Clean",
      words,
      weightedDensity: 0,
      violations: [],
      counts: {},
    };
  }

  const violations: SlopViolation[] = [];
  const counts: Record<string, number> = {};

  // Pattern-based rules
  for (const rule of RULES) {
    let hits = 0;
    for (const re of rule.patterns) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        hits++;
        const start = Math.max(0, m.index - 30);
        const end = Math.min(text.length, m.index + m[0].length + 30);
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          weight: rule.weight,
          match: m[0],
          context: text.slice(start, end),
          advice: rule.advice,
          index: m.index,
        });
      }
    }
    if (hits) counts[rule.id] = hits;
  }

  // Structural rules
  for (const rule of STRUCTURAL_RULES) {
    const findings = rule.evaluate(text);
    if (findings.length) counts[rule.id] = findings.length;
    for (const f of findings) {
      violations.push({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        weight: rule.weight,
        match: f.match,
        context: f.context,
        advice: rule.advice,
        index: f.index,
      });
    }
  }

  // Weighted density per 1000 words. Repeated use of the same rule costs more.
  let totalPenalty = 0;
  for (const [ruleId, hitCount] of Object.entries(counts)) {
    const rule =
      RULES.find((r) => r.id === ruleId) ??
      STRUCTURAL_RULES.find((r) => r.id === ruleId);
    if (!rule) continue;
    // concentration multiplier — same rule firing repeatedly is worse than
    // diverse violations
    const concentration = 1 + Math.log2(Math.max(1, hitCount));
    totalPenalty += rule.weight * hitCount * concentration;
  }
  const weightedDensity = (totalPenalty / words) * 1000;
  const score = Math.max(
    0,
    Math.min(100, Math.round(100 * Math.exp(-LAMBDA * weightedDensity)))
  );

  return {
    score,
    band: scoreBand(score),
    words,
    weightedDensity: Math.round(weightedDensity * 10) / 10,
    violations: violations.sort((a, b) => b.weight - a.weight).slice(0, 20),
    counts,
  };
}

export function scoreBand(score: number): SlopBand {
  if (score >= 80) return "Clean";
  if (score >= 60) return "Light";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Heavy";
  return "Saturated";
}

/** Tailwind-friendly color triple for any band, used by the UI. */
export const SLOP_BAND_TONE: Record<
  SlopBand,
  { bg: string; text: string; border: string; emoji: string }
> = {
  Clean: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
    emoji: "✓",
  },
  Light: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-300",
    emoji: "·",
  },
  Moderate: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    emoji: "!",
  },
  Heavy: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
    emoji: "!!",
  },
  Saturated: {
    bg: "bg-rose-100",
    text: "text-rose-800",
    border: "border-rose-300",
    emoji: "!!!",
  },
};

/** Tightest summary text — used in the toast and in compact UI strips. */
export function slopSummary(report: SlopReport): string {
  if (report.words < 10) return "too short to score";
  const top = report.violations[0];
  if (!top) return `${report.score}/100 · ${report.band}`;
  return `${report.score}/100 · ${report.band} · ${top.ruleName} (×${
    report.counts[top.ruleId] ?? 1
  })`;
}
