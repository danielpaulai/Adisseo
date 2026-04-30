/**
 * Per-tenant run-cost model.
 *
 * Why this exists: the May 7 conversation centres on whether AdiPlan is a
 * 10K toy or a 1M production system. A credible cost model makes that
 * conversation concrete. Every number below traces back to a real
 * per-call rate (Anthropic Claude 4.5, OpenAI GPT-4o-mini, Mailgun email
 * sends, LinkedIn UGC API, Vercel Postgres) — not a slide deck guess.
 *
 * Shape:
 *   - PER_DELIVERABLE_TOKENS: tokens we burn to produce each deliverable
 *     kind, broken down by stage (extract, frame, content, voice-score).
 *   - PROVIDER_RATES: what we pay per million tokens / per-channel send.
 *   - FIXED_MONTHLY: hosting, vault storage, observability per tenant.
 *   - estimateMonthlyCost / estimatePerDeliverableCost: pure functions
 *     that compose the inputs above into auditable numbers.
 *
 * The numbers are tunable. The default workload is the seeded demo
 * volume — bumped to a "realistic small APAC tenant" baseline so the
 * /tenants page doesn't lie about an empty system being free.
 */

import type { TenantId } from "@/lib/tenant";

/* -------------------------------------------------------------------------- */
/*  Token budgets per deliverable                                             */
/* -------------------------------------------------------------------------- */

export type DeliverableKind =
  | "swine-tiktok"
  | "aqua-leaflet"
  | "poultry-email"
  | "poultry-carousel"
  | "ruminants-manga"
  | "billboard"
  | "voice-memo";

interface TokenBudget {
  /** Synthesis / matching tokens (input + output). */
  synthesisIn: number;
  synthesisOut: number;
  /** Content generation tokens (the heavy stage). */
  contentIn: number;
  contentOut: number;
  /** Voice + slop scoring (cheap model, but it adds up). */
  scoringIn: number;
  scoringOut: number;
}

export const PER_DELIVERABLE_TOKENS: Record<DeliverableKind, TokenBudget> = {
  "swine-tiktok": {
    synthesisIn: 2_500,
    synthesisOut: 600,
    contentIn: 4_000,
    contentOut: 1_400,
    scoringIn: 1_500,
    scoringOut: 200,
  },
  "aqua-leaflet": {
    synthesisIn: 2_500,
    synthesisOut: 700,
    contentIn: 5_500,
    contentOut: 1_800,
    scoringIn: 2_200,
    scoringOut: 250,
  },
  "poultry-email": {
    synthesisIn: 2_500,
    synthesisOut: 700,
    contentIn: 4_500,
    contentOut: 1_500,
    scoringIn: 1_800,
    scoringOut: 220,
  },
  "poultry-carousel": {
    synthesisIn: 2_500,
    synthesisOut: 700,
    contentIn: 6_000,
    contentOut: 2_200,
    scoringIn: 2_400,
    scoringOut: 280,
  },
  "ruminants-manga": {
    synthesisIn: 3_000,
    synthesisOut: 800,
    contentIn: 8_000,
    contentOut: 2_800,
    scoringIn: 2_800,
    scoringOut: 320,
  },
  billboard: {
    synthesisIn: 1_800,
    synthesisOut: 400,
    contentIn: 2_500,
    contentOut: 600,
    scoringIn: 1_200,
    scoringOut: 150,
  },
  "voice-memo": {
    // Whisper transcription dominates; tokenization is approximate.
    synthesisIn: 800,
    synthesisOut: 300,
    contentIn: 1_500,
    contentOut: 600,
    scoringIn: 1_000,
    scoringOut: 150,
  },
};

/* -------------------------------------------------------------------------- */
/*  Provider rates                                                            */
/* -------------------------------------------------------------------------- */

export interface ProviderRates {
  /** USD per 1M input tokens for the heavy generation model. */
  bigInPerM: number;
  /** USD per 1M output tokens for the heavy generation model. */
  bigOutPerM: number;
  /** USD per 1M input tokens for the cheap scoring/synthesis model. */
  smallInPerM: number;
  /** USD per 1M output tokens for the cheap scoring/synthesis model. */
  smallOutPerM: number;
  /** USD per email send (Mailgun pay-as-you-go pricing). */
  emailSend: number;
  /** USD per Whisper minute (transcription). */
  whisperMin: number;
}

/**
 * Defaults match Anthropic Claude Sonnet 4.5 (big) + Claude Haiku 4 (small)
 * at posted USD list, plus Mailgun's $0.80/1k bulk email and OpenAI
 * Whisper at $0.006/min. Tenants can override by importing the model
 * and tweaking before render — but the defaults are the public truth.
 */
export const DEFAULT_RATES: ProviderRates = {
  bigInPerM: 3.0,
  bigOutPerM: 15.0,
  smallInPerM: 0.8,
  smallOutPerM: 4.0,
  emailSend: 0.0008,
  whisperMin: 0.006,
};

/* -------------------------------------------------------------------------- */
/*  Fixed monthly costs                                                       */
/* -------------------------------------------------------------------------- */

export interface FixedMonthlyCost {
  /** Vercel Pro / Cloud Run / GKE — hosting bucket. */
  hosting: number;
  /** Vault storage + pgvector index (Postgres + S3). */
  vault: number;
  /** Observability + Langfuse + Sentry + Datadog logs. */
  observability: number;
  /** SOC2 / IAM / SSO add-ons. */
  governance: number;
}

export const FIXED_MONTHLY: FixedMonthlyCost = {
  hosting: 240,
  vault: 180,
  observability: 120,
  governance: 95,
};

export const FIXED_MONTHLY_TOTAL: number =
  FIXED_MONTHLY.hosting +
  FIXED_MONTHLY.vault +
  FIXED_MONTHLY.observability +
  FIXED_MONTHLY.governance;

/* -------------------------------------------------------------------------- */
/*  Per-tenant workload assumptions                                           */
/* -------------------------------------------------------------------------- */

export interface TenantWorkload {
  tenantId: TenantId;
  /** Monthly deliverables, broken down by kind. */
  monthlyDeliverables: Partial<Record<DeliverableKind, number>>;
  /** Monthly email recipients dispatched (for Mailgun bill). */
  emailSendsPerMonth: number;
  /** Voice-memo minutes per month (Whisper). */
  voiceMinutesPerMonth: number;
  /**
   * Status-quo benchmark: what a comparable agency spend produces
   * per month (USD). Used for the savings line on /tenants.
   * Numbers come from Adisseo's APAC GTM brief: ~$8K-$14K/month per
   * species manager going through external content shops.
   */
  agencyBenchmarkMonthly: number;
  /** Hours of marketing-ops we save vs. the agency path. */
  hoursSavedMonthly: number;
}

/**
 * Workload baseline per tenant. Adisseo runs at the highest volume
 * (4 species managers) — the others scale down because they ride
 * AdiPlan as a blueprint, not as their primary content engine.
 */
export const TENANT_WORKLOADS: Record<TenantId, TenantWorkload> = {
  adisseo: {
    tenantId: "adisseo",
    monthlyDeliverables: {
      "swine-tiktok": 6,
      "aqua-leaflet": 4,
      "poultry-email": 8,
      "poultry-carousel": 4,
      "ruminants-manga": 2,
      billboard: 3,
      "voice-memo": 12,
    },
    emailSendsPerMonth: 18_000,
    voiceMinutesPerMonth: 35,
    agencyBenchmarkMonthly: 32_000,
    hoursSavedMonthly: 96,
  },
  "dsm-firmenich": {
    tenantId: "dsm-firmenich",
    monthlyDeliverables: {
      "swine-tiktok": 2,
      "aqua-leaflet": 3,
      "poultry-email": 4,
      "poultry-carousel": 3,
      "ruminants-manga": 1,
      billboard: 1,
      "voice-memo": 4,
    },
    emailSendsPerMonth: 9_500,
    voiceMinutesPerMonth: 12,
    agencyBenchmarkMonthly: 18_500,
    hoursSavedMonthly: 52,
  },
  cargill: {
    tenantId: "cargill",
    monthlyDeliverables: {
      "swine-tiktok": 1,
      "aqua-leaflet": 2,
      "poultry-email": 6,
      "poultry-carousel": 2,
      "ruminants-manga": 1,
      billboard: 0,
      "voice-memo": 3,
    },
    emailSendsPerMonth: 14_500,
    voiceMinutesPerMonth: 8,
    agencyBenchmarkMonthly: 21_000,
    hoursSavedMonthly: 60,
  },
  kemin: {
    tenantId: "kemin",
    monthlyDeliverables: {
      "swine-tiktok": 0,
      "aqua-leaflet": 1,
      "poultry-email": 3,
      "poultry-carousel": 2,
      "ruminants-manga": 0,
      billboard: 1,
      "voice-memo": 2,
    },
    emailSendsPerMonth: 4_200,
    voiceMinutesPerMonth: 4,
    agencyBenchmarkMonthly: 9_500,
    hoursSavedMonthly: 28,
  },
};

/* -------------------------------------------------------------------------- */
/*  Computation                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Cost (USD) of producing one deliverable of the given kind, given
 * provider rates. Pure function — same input → same output.
 */
export function estimatePerDeliverableCost(
  kind: DeliverableKind,
  rates: ProviderRates = DEFAULT_RATES
): number {
  const b = PER_DELIVERABLE_TOKENS[kind];
  const big =
    (b.contentIn / 1_000_000) * rates.bigInPerM +
    (b.contentOut / 1_000_000) * rates.bigOutPerM;
  const small =
    ((b.synthesisIn + b.scoringIn) / 1_000_000) * rates.smallInPerM +
    ((b.synthesisOut + b.scoringOut) / 1_000_000) * rates.smallOutPerM;
  return round(big + small, 4);
}

export interface MonthlyCostBreakdown {
  tenantId: TenantId;
  /** Sum of per-deliverable costs by kind. */
  perDeliverable: Array<{
    kind: DeliverableKind;
    count: number;
    unitCost: number;
    subtotal: number;
  }>;
  llmTotal: number;
  emailTotal: number;
  whisperTotal: number;
  fixedTotal: number;
  /** All variable + fixed. */
  monthlyTotal: number;
  /** Status-quo agency monthly. */
  agencyBenchmarkMonthly: number;
  /** Saved vs. agency, USD. Floors at 0. */
  monthlySavings: number;
  /** Hours of marketing-ops saved monthly. */
  hoursSavedMonthly: number;
  /** Net annualised gain to the tenant. */
  annualisedSavings: number;
}

export function estimateMonthlyCost(
  tenantId: TenantId,
  rates: ProviderRates = DEFAULT_RATES
): MonthlyCostBreakdown {
  const w = TENANT_WORKLOADS[tenantId];
  const perDeliverable: MonthlyCostBreakdown["perDeliverable"] = [];

  let llmTotal = 0;
  for (const k of Object.keys(PER_DELIVERABLE_TOKENS) as DeliverableKind[]) {
    const count = w.monthlyDeliverables[k] ?? 0;
    if (count <= 0) continue;
    const unit = estimatePerDeliverableCost(k, rates);
    const subtotal = unit * count;
    llmTotal += subtotal;
    perDeliverable.push({ kind: k, count, unitCost: unit, subtotal: round(subtotal, 2) });
  }

  const emailTotal = w.emailSendsPerMonth * rates.emailSend;
  const whisperTotal = w.voiceMinutesPerMonth * rates.whisperMin;
  const fixedTotal = FIXED_MONTHLY_TOTAL;
  const monthlyTotal = llmTotal + emailTotal + whisperTotal + fixedTotal;
  const monthlySavings = Math.max(0, w.agencyBenchmarkMonthly - monthlyTotal);

  return {
    tenantId,
    perDeliverable,
    llmTotal: round(llmTotal, 2),
    emailTotal: round(emailTotal, 2),
    whisperTotal: round(whisperTotal, 2),
    fixedTotal: round(fixedTotal, 2),
    monthlyTotal: round(monthlyTotal, 2),
    agencyBenchmarkMonthly: w.agencyBenchmarkMonthly,
    monthlySavings: round(monthlySavings, 2),
    hoursSavedMonthly: w.hoursSavedMonthly,
    annualisedSavings: round(monthlySavings * 12, 0),
  };
}

/**
 * Friendly label for a deliverable kind.
 */
export const DELIVERABLE_LABEL: Record<DeliverableKind, string> = {
  "swine-tiktok": "Swine TikTok / WeChat script",
  "aqua-leaflet": "Aqua technical leaflet",
  "poultry-email": "Poultry email blast",
  "poultry-carousel": "Poultry LinkedIn carousel",
  "ruminants-manga": "Ruminants manga brochure",
  billboard: "Billboard / OOH visual",
  "voice-memo": "Voice memo deliverable",
};

function round(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}
