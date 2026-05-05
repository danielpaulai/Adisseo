/**
 * Brand-voice configurations — vale-style declarative rule sets per customer.
 *
 * Each tenant gets a `BrandVoice` object that lists banned terms, required
 * tone markers, claim-language guardrails, and a target slop-score floor.
 * The /api/score-prose route runs each new deliverable against the active
 * tenant's voice config, so the same platform serves Adisseo / DSM / Cargill
 * with their own brand-compliance rules.
 *
 * Voice rules complement (don't replace) slop-detector. Slop detector
 * catches universal LLM tics. Brand-voice catches customer-specific drift.
 */

export type BrandVoiceId = "adisseo" | "dsm-firmenich" | "cargill" | "kemin" | "default";

export interface BrandVoiceRule {
  id: string;
  /** Human label for the violation card. */
  name: string;
  severity: "low" | "medium" | "high";
  /** Optional regex flag overrides; default \"gi\". */
  flags?: string;
  /** Pattern — either a string (case-insensitive contains) or a RegExp. */
  pattern: string | RegExp;
  /** Concrete swap recommendation. */
  fix: string;
}

export interface BrandVoice {
  id: BrandVoiceId;
  name: string;
  /** Score (0–100) below which the deliverable cannot be sent for regional review. */
  slopFloor: number;
  /** Score below which only a senior reviewer can approve. */
  warningFloor: number;
  /** What the voice sounds like in one paragraph. */
  description: string;
  /** Banned words / phrases per the customer's brand book. */
  banned: BrandVoiceRule[];
  /** Required tone markers (must appear at least once). */
  required: Array<{
    id: string;
    name: string;
    pattern: string | RegExp;
    advice: string;
  }>;
  /** Claim-language guardrails (regulatory, medical). */
  claimGuards: BrandVoiceRule[];
}

/* ============================================================================
 * Adisseo — the anchor customer.
 * Distilled from the brief and the Apr 28 Ricardo / Vish / Antoine call.
 * ========================================================================== */

const ADISSEO: BrandVoice = {
  id: "adisseo",
  name: "Adisseo APAC",
  slopFloor: 60,
  warningFloor: 75,
  description:
    "Conservative, technically-anchored, deferential to the buyer's expertise. Never claims, always demonstrates. Quotes APAC trial data. Cites integrators by name. No marketing voice — reads like a senior nutritionist talking to another senior nutritionist.",
  banned: [
    { id: "adi-bestinclass", name: 'Banned: "best-in-class"', severity: "high", pattern: /\bbest[-\s]?in[-\s]?class\b/gi, fix: 'Replace with the trial-specific number ("FCR 1.62 vs. 1.71 in 4 APAC trials").' },
    { id: "adi-worldclass", name: 'Banned: "world-class"', severity: "high", pattern: /\bworld[-\s]?class\b/gi, fix: "Same — cite the regional benchmark instead." },
    { id: "adi-industryleading", name: 'Banned: "industry-leading"', severity: "high", pattern: /\bindustry[-\s]?leading\b/gi, fix: "Cite the trial number and the comparator." },
    { id: "adi-cuttingedge", name: 'Banned: "cutting-edge"', severity: "high", pattern: /\bcutting[-\s]?edge\b/gi, fix: "Drop. The mechanism is the headline." },
    { id: "adi-revolutionary", name: 'Banned: "revolutionary"', severity: "high", pattern: /\brevolutionar(y|ily)\b/gi, fix: "Drop. Asian R\u0026D buyers read this as American marketing voice." },
    { id: "adi-gamechanger", name: 'Banned: "game-changer"', severity: "high", pattern: /\bgame[-\s]?chang(er|ing)\b/gi, fix: "Replace with the specific change in the cycle." },
    { id: "adi-passionate", name: 'Banned: "passionate"', severity: "medium", pattern: /\bpassionate(ly)?\b/gi, fix: "Adisseo's voice is competent, not passionate. Drop." },
    { id: "adi-proud", name: 'Banned: "proud to announce"', severity: "medium", pattern: /\bproud to (announce|introduce|present)\b/gi, fix: "Lead with the news, not the announcement." },
    { id: "adi-empower", name: 'Banned: "empower / empowering"', severity: "medium", pattern: /\bempower(ing|ed|s)?\b/gi, fix: "Replace with the specific capability gained." },
    /* Poultry-specific (Phase 6 — Vish desk). */
    { id: "adi-broiler-best", name: 'Poultry: "broiler-best"', severity: "high", pattern: /\bbroiler[-\s]?best\b/gi, fix: "Cite the FCR / CV% / mortality vs control." },
    { id: "adi-miracle-additive", name: 'Poultry: "miracle additive"', severity: "high", pattern: /\bmiracle[-\s]?(additive|ingredient|premix)\b/gi, fix: "Drop. Adisseo voice never uses miracle." },
    { id: "adi-zero-failure", name: 'Poultry: "zero failure / zero loss"', severity: "high", pattern: /\bzero[-\s]?(failure|loss(es)?)\b/gi, fix: "Cite the cycle-level mortality figure with confidence band." },
    { id: "adi-replace-antibiotics", name: 'Poultry: "replace antibiotics"', severity: "high", pattern: /\breplaces?\s+antibiotics?\b/gi, fix: 'Reframe as "supports performance under AGP-free protocols". Adisseo never positions as a drug substitute.' },
    { id: "adi-poultry-hyperbole", name: 'Poultry: "unprecedented results"', severity: "medium", pattern: /\bunprecedented\s+(results|gains|performance)\b/gi, fix: "Cite the trial cycles and the comparator." },
  ],
  required: [],
  claimGuards: [
    { id: "claim-cure", name: 'Medical-claim breach: "cure"', severity: "high", pattern: /\bcures?\b/gi, fix: 'Use "reduces incidence by N% in trial X". Never "cure".' },
    { id: "claim-prevent", name: 'Medical-claim breach: "prevent"', severity: "high", pattern: /\bprevents?\b/gi, fix: 'Use "lowers risk of" with citation.' },
    { id: "claim-guarantee", name: 'Medical-claim breach: "guarantee"', severity: "high", pattern: /\bguarantees?d?\b/gi, fix: "Replace with the trial's confidence interval." },
    { id: "claim-treats", name: 'Medical-claim breach: "treats"', severity: "high", pattern: /\btreats?\b/gi, fix: 'Use "supports recovery from" / "supports gut function".' },
    { id: "claim-100", name: 'Hyperbole: "100% effective"', severity: "high", pattern: /\b100%?\s*(effective|guaranteed|safe)\b/gi, fix: "Drop. The trial number is enough." },
  ],
};

const DSM: BrandVoice = {
  id: "dsm-firmenich",
  name: "DSM-Firmenich (illustrative)",
  slopFloor: 60,
  warningFloor: 75,
  description:
    "Sustainability-led, science-led, slightly more open to bold framing than Adisseo. Tracks methane / ESG numbers obsessively.",
  banned: [
    { id: "dsm-amazing", name: 'Banned: "amazing"', severity: "medium", pattern: /\bamazing(ly)?\b/gi, fix: "Replace with the methane / footprint delta." },
    { id: "dsm-bestinclass", name: 'Banned: "best-in-class"', severity: "high", pattern: /\bbest[-\s]?in[-\s]?class\b/gi, fix: "Cite the scope-3 figure." },
  ],
  required: [],
  claimGuards: ADISSEO.claimGuards,
};

const CARGILL: BrandVoice = {
  id: "cargill",
  name: "Cargill (illustrative)",
  slopFloor: 60,
  warningFloor: 75,
  description: "Operational, pragmatic, distributor-friendly. No marketing puffery; integrator FCR / cost-of-feed numbers up front.",
  banned: [
    { id: "carg-revolutionary", name: 'Banned: "revolutionary"', severity: "high", pattern: /\brevolutionar(y|ily)\b/gi, fix: "Drop." },
    { id: "carg-gamechanger", name: 'Banned: "game-changer"', severity: "high", pattern: /\bgame[-\s]?chang(er|ing)\b/gi, fix: "Drop." },
  ],
  required: [],
  claimGuards: ADISSEO.claimGuards,
};

const KEMIN: BrandVoice = {
  id: "kemin",
  name: "Kemin (illustrative)",
  slopFloor: 60,
  warningFloor: 75,
  description: "Application-engineering voice. Heavy on protocol detail, light on adjectives.",
  banned: [
    { id: "kem-cuttingedge", name: 'Banned: "cutting-edge"', severity: "high", pattern: /\bcutting[-\s]?edge\b/gi, fix: "Drop." },
  ],
  required: [],
  claimGuards: ADISSEO.claimGuards,
};

const DEFAULT_VOICE: BrandVoice = {
  id: "default",
  name: "Generic professional",
  slopFloor: 60,
  warningFloor: 75,
  description: "Universal anti-slop floor with no customer-specific banned list.",
  banned: [],
  required: [],
  claimGuards: ADISSEO.claimGuards,
};

export const BRAND_VOICES: Record<BrandVoiceId, BrandVoice> = {
  adisseo: ADISSEO,
  "dsm-firmenich": DSM,
  cargill: CARGILL,
  kemin: KEMIN,
  default: DEFAULT_VOICE,
};

export function getBrandVoice(id: BrandVoiceId): BrandVoice {
  return BRAND_VOICES[id] ?? DEFAULT_VOICE;
}

/* ============================================================================
 * Brand-voice scorer — returns violations + a 0–1 compliance ratio.
 * ========================================================================== */

export interface BrandVoiceViolation {
  ruleId: string;
  ruleName: string;
  severity: "low" | "medium" | "high";
  match: string;
  context: string;
  fix: string;
  index: number;
  /** "banned" | "required-missing" | "claim" */
  category: "banned" | "required" | "claim";
}

export interface BrandVoiceReport {
  voiceId: BrandVoiceId;
  voiceName: string;
  /** 0–1; 1.0 = perfect compliance. */
  compliance: number;
  /** True if any high-severity claim breach. */
  hasClaimBreach: boolean;
  violations: BrandVoiceViolation[];
}

export function scoreBrandVoice(text: string, voiceId: BrandVoiceId = "adisseo"): BrandVoiceReport {
  const voice = getBrandVoice(voiceId);
  const violations: BrandVoiceViolation[] = [];

  function runPattern(p: string | RegExp): RegExp {
    if (typeof p === "string") {
      const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(escaped, "gi");
    }
    return new RegExp(p.source, p.flags.includes("g") ? p.flags : p.flags + "g");
  }

  // Banned terms
  for (const rule of voice.banned) {
    const re = runPattern(rule.pattern);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const start = Math.max(0, m.index - 30);
      const end = Math.min(text.length, m.index + m[0].length + 30);
      violations.push({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        match: m[0],
        context: text.slice(start, end),
        fix: rule.fix,
        index: m.index,
        category: "banned",
      });
    }
  }

  // Claim-language guards
  let hasClaimBreach = false;
  for (const rule of voice.claimGuards) {
    const re = runPattern(rule.pattern);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      hasClaimBreach = true;
      const start = Math.max(0, m.index - 30);
      const end = Math.min(text.length, m.index + m[0].length + 30);
      violations.push({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        match: m[0],
        context: text.slice(start, end),
        fix: rule.fix,
        index: m.index,
        category: "claim",
      });
    }
  }

  // Required markers
  for (const req of voice.required) {
    const re = runPattern(req.pattern);
    if (!re.test(text)) {
      violations.push({
        ruleId: req.id,
        ruleName: `Missing required: ${req.name}`,
        severity: "medium",
        match: "(missing)",
        context: "(not found in text)",
        fix: req.advice,
        index: 0,
        category: "required",
      });
    }
  }

  // Compliance ratio: each high-severity violation costs 0.15, medium 0.05, low 0.02.
  let penalty = 0;
  for (const v of violations) {
    penalty += v.severity === "high" ? 0.15 : v.severity === "medium" ? 0.05 : 0.02;
  }
  const compliance = Math.max(0, Math.min(1, 1 - penalty));

  return {
    voiceId: voice.id,
    voiceName: voice.name,
    compliance,
    hasClaimBreach,
    violations,
  };
}
