/**
 * Master demo-seed — A.1 of the May 7 demo prep.
 *
 * Cold-opens are death for product demos. The first-ever demo of APAC
 * starts with empty stakeholder selections, an empty match, an empty
 * frame, an empty distribution log, an empty engagement tracker, and so
 * on. By the time the room sees /dashboard or /engagement-tracker, the
 * audience has spent two minutes looking at "nothing here yet" UIs.
 *
 * `seedFullDemo()` solves that. One click pre-loads:
 *   - Stakeholder selections + ladders (so /stakeholder-map is already
 *     interesting on hover)
 *   - A selected article + composed match (so /news-bridge has state)
 *   - A composed strategic frame (so /strategic-frame has the "this is
 *     the tension now" panel filled in)
 *   - 12 activity entries (so /dashboard isn't empty)
 *   - 4 approval requests (so /approval-queue has a queue)
 *   - 6 distribution log rows with engagement metrics (so /distribution
 *     looks lived-in)
 *   - 3 scheduled-send queue entries
 *   - 5 live deliverables (so /engagement-tracker shows live + seeded)
 *
 * Everything is deterministic — same content every time. The activity
 * timestamps are spaced realistically (the most recent is 30s ago, the
 * oldest is 24h ago) so the war-room timeline looks alive without
 * looking faked.
 *
 * This module is server-agnostic: it accepts the store's actions as a
 * parameter so it can be wired from any client component (the /demo
 * page, the dashboard, the landing) without each one duplicating the
 * seed payload.
 */

import type { ActivityEntry, ApprovalRequest, DistributionLog, ScheduledSend } from "@/lib/store";
import type { StrategicFrame } from "@/lib/strategic-frame";
import type { MatchedArticle } from "@/lib/store";
import type { DeliverableInstance } from "@/lib/engagement";
import type { StakeholderLadder } from "@/lib/store";

/** Minimal shape of the store actions seedFullDemo needs. */
export interface SeedActions {
  setSelectedStakeholders: (ids: string[]) => void;
  setLadder: (l: StakeholderLadder) => void;
  setSelectedArticle: (id: string | null) => void;
  setMatch: (m: MatchedArticle | null) => void;
  setComposedFrame: (f: StrategicFrame | null) => void;
  pushActivity: (entry: Omit<ActivityEntry, "id" | "at"> & {
    id?: string;
    at?: string;
  }) => void;
  requestApproval: (
    req: Omit<ApprovalRequest, "id" | "sentAt" | "status">
  ) => string;
  decideApproval: (
    id: string,
    decision: "approved" | "rejected",
    reviewerComment: string,
    reviewer?: string
  ) => void;
  pushDistribution: (
    entry: Omit<DistributionLog, "id" | "shippedAt"> & {
      id?: string;
      shippedAt?: string;
    }
  ) => string;
  schedule: (
    entry: Omit<ScheduledSend, "id" | "queuedAt" | "status"> & {
      id?: string;
    }
  ) => string;
  pushLiveDeliverable: (d: DeliverableInstance) => void;
}

/* ----------------------------------------------------------------------------
 * Helper for spacing timestamps: returns ISO `n` minutes ago.
 * -------------------------------------------------------------------------- */
const minsAgo = (n: number) =>
  new Date(Date.now() - n * 60_000).toISOString();
const hoursAgo = (n: number) =>
  new Date(Date.now() - n * 3_600_000).toISOString();

/* ----------------------------------------------------------------------------
 * Stakeholder selections + ladders.
 *
 * Picks 4 high-influence APAC stakeholders that map to the seeded matches
 * we'll compose below. Ladder content is tight + specific so the map
 * sidebar feels real.
 * -------------------------------------------------------------------------- */
const SEEDED_STAKEHOLDER_IDS = [
  "corp-nutrition-dir",
  "regulatory",
  "vets",
  "feed-mill",
];

const SEEDED_LADDERS: StakeholderLadder[] = [
  {
    stakeholderId: "corp-nutrition-dir",
    topValue: "Hold FCR within 3pts of AGP baseline",
    rungs: [
      {
        id: "r1",
        outcome: "Approve AGP-removal plan with FCR safety net",
        witi: "Board commits to BPOM compliance without margin shock",
      },
      {
        id: "r2",
        outcome: "Lock methionine + organic-acid stack as house standard",
        witi: "Risk to nursery mortality + Q3 broiler yield is contained",
      },
      {
        id: "r3",
        outcome: "Sign multi-mill protocol with Adisseo APAC",
        witi: "Reportable trial outcomes the integrator board can defend",
      },
    ],
  },
  {
    stakeholderId: "regulatory",
    topValue: "Defensible BPOM-aligned AGP transition timeline",
    rungs: [
      {
        id: "r1",
        outcome: "Audit-ready evidence pack for regulators",
        witi: "Avoids the BPOM pause + reputational damage",
      },
      {
        id: "r2",
        outcome: "Citation-anchored claims in customer comms",
        witi: "Survives compliance review at the integrator level",
      },
    ],
  },
  {
    stakeholderId: "vets",
    topValue: "Day-7 mortality < 1.2% post-AGP removal",
    rungs: [
      {
        id: "r1",
        outcome: "Trial protocol the vet KOL can publicly endorse",
        witi: "Vet reputational risk during AGP transition",
      },
    ],
  },
  {
    stakeholderId: "feed-mill",
    topValue: "Hold mill margins through the transition",
    rungs: [
      {
        id: "r1",
        outcome: "Premix line that doesn't widen mill spread vs. legacy AGP",
        witi: "Mill bid competitiveness vs. Charoen Pokphand",
      },
    ],
  },
];

/* ----------------------------------------------------------------------------
 * Composed match + strategic frame.
 *
 * Anchored on `art-006` (Kemin Indonesia AGP move) — the most demo-rich
 * scraped article. Match + frame map to the AGP narrative running
 * through all the seeded studio prefills.
 * -------------------------------------------------------------------------- */
const SEEDED_MATCH: MatchedArticle = {
  articleId: "art-006",
  cbi: "Regulatory shift: AGP phase-out forcing protocol redesign",
  cbiId: "cbi-regulatory-shift",
  cbiRationale:
    "Kemin's premix tie-up signals the BPOM AGP transition is now competitively contested. Adisseo's APAC poultry team needs a defensible position before integrators commit.",
  persona: "Regional Nutrition Director — APAC poultry integrator",
  personaId: "p-corp-nutrition-dir",
  personaRationale:
    "The regional nutrition director is the only role that can sign multi-mill protocols and absorb FCR risk during the transition.",
  recommendedFormats: [
    "5-slide LinkedIn carousel (Indonesian)",
    "1-page distributor leaflet (Bahasa Indonesia)",
    "Trade-mag editorial submission (Asian Poultry Magazine)",
  ],
  recommendedFormatIds: ["poultry-carousel", "aqua-leaflet", "trade-mag"],
  speciesFit: ["poultry"],
  matchedAt: minsAgo(7),
};

const SEEDED_FRAME: StrategicFrame = {
  cbi: SEEDED_MATCH.cbi,
  cbiId: SEEDED_MATCH.cbiId,
  persona: SEEDED_MATCH.persona,
  personaId: SEEDED_MATCH.personaId,
  competitor: "Kemin",
  articleTitle:
    "Kemin partners with 3 premixers in Indonesia for AGP-free poultry",
  region: "Indonesia",
  enterprisePersona:
    "Mid-large Indonesian poultry integrator. Vertically integrated through breeders, hatcheries, broiler farms, and processing. Holds 6–18% national market share. The regional nutrition director sits 1 reporting line below the COO and owns FCR, mortality, and feed-cost-of-gain across all sites. Reports formally to BPOM and informally to investor relations on environmental and welfare KPIs.",
  enterpriseInsight:
    "BPOM's AGP phase-out moved from advisory to enforcement track in Q1 2026. Every mid-large Indonesian integrator now has 18 months to hold FCR and mortality without antibiotic growth promoters — a problem Kemin is loudly trying to own.",
  pain: {
    headline: "FCR risk + mortality risk + reputational risk, all at once.",
    body:
      "Removing AGPs widens day-7 mortality by 0.4–0.7pts and FCR by 4–8 points if the replacement stack is wrong. The window to lock in the right protocol is now — and the integrator board is watching.",
  },
  promise: {
    headline: "FCR within 3 points of the AGP baseline. Day-7 mortality below 1.2%.",
    body:
      "A methionine + organic-acid stack anchored on Rhodimet AT88 — backed by 6 Indonesian commercial-broiler trials (n=144,000 birds) — holds the integrator's KPIs through the AGP transition.",
  },
  proof: {
    headline: "Three published trials. One regional protocol. Full citation chain.",
    body:
      "Adisseo's APAC poultry technical team has published the trial protocol, the FCR delta math, and the mortality curves — all citation-anchored to peer-reviewed sources.",
    evidence: [
      "Indonesia 2025 broiler trial: FCR 1.62 → 1.65 vs. AGP baseline 1.60 (n=144,000)",
      "Day-7 mortality: 1.8% (AGP) → 1.1% (methionine + organic-acid stack)",
      "BPOM compliance pre-audit cleared for protocol-following sites",
    ],
  },
  proposition: {
    headline: "Sign the regional protocol. Run the gap analysis on your top 2 mills.",
    body:
      "Adisseo APAC publishes the full protocol + a 2-mill gap analysis sized to the integrator's flock turnover. Outcome shows up in the next quarterly board pack.",
    cta: "Book the regional-protocol gap analysis",
  },
  activations: [
    {
      species: "poultry",
      deliverable:
        "5-slide LinkedIn carousel · Indonesian broiler integrators",
      rationale:
        "Hits the corporate nutrition director where they actually scroll — LinkedIn at the daily standup.",
    },
    {
      species: "poultry",
      deliverable: "1-page distributor leaflet · Bahasa Indonesia",
      rationale:
        "Mill-floor handout for the technical sales rep in Java + Sumatra.",
    },
    {
      species: "cross",
      deliverable: "Editorial submission · Asian Poultry Magazine",
      rationale:
        "Long-form proof piece the regulatory affairs lead can cite back to BPOM.",
    },
  ],
};

/* ----------------------------------------------------------------------------
 * Activity log seed (12 entries, spaced over the last 24h).
 *
 * Tone variety so the dashboard timeline doesn't feel monotone.
 * Most-recent-first ordering is enforced by the caller; we set explicit
 * `at` ISO strings so we don't rely on ordering luck.
 * -------------------------------------------------------------------------- */
const SEEDED_ACTIVITY: Array<Omit<ActivityEntry, "id">> = [
  {
    kind: "match",
    title: "Matched · Kemin AGP-free move (Indonesia)",
    detail: "→ CBI regulatory-shift × poultry × Indonesia",
    href: "/news-bridge",
    tone: "crimson",
    at: hoursAgo(20),
  },
  {
    kind: "frame",
    title: "Composed frame: Hold FCR through the AGP phase-out",
    detail: "Indonesian poultry integrator · Indonesia",
    href: "/strategic-frame",
    tone: "crimson",
    at: hoursAgo(19),
  },
  {
    kind: "poultry",
    title: "Indonesia AGP carousel · 5 slides shipped",
    detail: "ID · poultry · ricca-poultry-id",
    href: "/studio/poultry",
    tone: "ink",
    at: hoursAgo(18),
  },
  {
    kind: "poultry",
    title: "Vish coordinated email blast · 12 distributors",
    detail: "ID · poultry-distributor · email + carousel",
    href: "/studio/poultry",
    tone: "orange",
    at: hoursAgo(17),
  },
  {
    kind: "match",
    title: "Matched · DSM PRRS resilience paper",
    detail: "→ CBI animal-disease × swine × CN+TH",
    href: "/news-bridge",
    tone: "cyan",
    at: hoursAgo(8),
  },
  {
    kind: "frame",
    title: "Composed frame: PRRS recovery without protocol overhaul",
    detail: "Vet KOL channel · CN+TH",
    href: "/strategic-frame",
    tone: "crimson",
    at: hoursAgo(7),
  },
  {
    kind: "swine",
    title: "Swine vertical short · WeChat-ready",
    detail: "ZH · swine · prrs-recovery",
    href: "/studio/swine",
    tone: "orange",
    at: hoursAgo(6),
  },
  {
    kind: "match",
    title: "Matched · BASF NZ Lutavit Vita-mix",
    detail: "→ CBI heat-stress × ruminants × Oceania",
    href: "/news-bridge",
    tone: "cyan",
    at: hoursAgo(4),
  },
  {
    kind: "frame",
    title: "Composed frame: Hold the milk through summer",
    detail: "Hokkaido dairy R&D buyer · Hokkaido",
    href: "/strategic-frame",
    tone: "crimson",
    at: hoursAgo(3.5),
  },
  {
    kind: "ruminants",
    title: "Ruminants brochure · Heat-stress manga (JA)",
    detail: "JA · heat-stress · hokkaido-dairy",
    href: "/studio/ruminants",
    tone: "ink",
    at: hoursAgo(3),
  },
  {
    kind: "voice-memo",
    title: "Antoine voice memo · Hokkaido follow-up",
    detail: "JA · 38s · transcribed → ruminants",
    href: "/studio/voice-memo",
    tone: "cyan",
    at: minsAgo(8),
  },
];

/* ----------------------------------------------------------------------------
 * Approval queue seed.
 *
 * Mix of pending + already-decided so the queue UI shows both states.
 * The caller decides 1 of the 4 to "approved" and 1 to "rejected" so
 * the audit log on /approval-queue isn't all-pending.
 * -------------------------------------------------------------------------- */
interface SeedApproval {
  payload: Omit<ApprovalRequest, "id" | "sentAt" | "status">;
  decision?: {
    decision: "approved" | "rejected";
    reviewerComment: string;
    reviewer?: string;
  };
}

const SEEDED_APPROVALS: SeedApproval[] = [
  {
    payload: {
      kind: "poultry-pack",
      title: "Indonesia AGP-removal · 5-slide LinkedIn carousel",
      summary:
        "Carousel + caption + hashtags. Trust 87, citations 4. Body anchored on Indonesia 2025 broiler trial. Vish requesting HQ greenlight.",
      sender: "Vish (APAC poultry)",
      href: "/studio/poultry",
      payload: { language: "id", trustScore: 87, citationCount: 4 },
    },
    decision: {
      decision: "approved",
      reviewerComment:
        "Citations clean, voice-match strong, body within brand-guardrails. Cleared for LinkedIn + email.",
      reviewer: "Ricardo Communod",
    },
  },
  {
    payload: {
      kind: "ruminants-brochure",
      title: "Hokkaido dairy heat-stress · 2-page manga (JA)",
      summary:
        "Manga-style brochure. Trust 84, citations 3. Antoine flagged the proof-page graph caption — wants HQ to bless before May 7.",
      sender: "Antoine (APAC ruminants)",
      href: "/studio/ruminants",
      payload: { language: "ja", trustScore: 84, citationCount: 3 },
    },
    decision: undefined, // pending
  },
  {
    payload: {
      kind: "swine-short",
      title: "Vietnam ASF biosecurity · 45s WeChat short",
      summary:
        "Vertical short, voiceover script + storyboard. Trust 79, citations 2. Claire flagging that the proof line is light — HQ to confirm.",
      sender: "Claire (APAC swine)",
      href: "/studio/swine",
      payload: { language: "vi", trustScore: 79, citationCount: 2 },
    },
    decision: {
      decision: "rejected",
      reviewerComment:
        "Proof line too light — only 2 citations, neither is peer-reviewed. Re-anchor on the 2025 PRRS paper before resubmit.",
      reviewer: "Ricardo Communod",
    },
  },
  {
    payload: {
      kind: "aqua-leaflet",
      title: "Vietnam mycotoxin gate · 1-page leaflet",
      summary:
        "Aqua leaflet, EN. Trust 84, citations 4. Aileen routing through HQ for trade-mag co-submission.",
      sender: "Aileen (APAC aqua)",
      href: "/studio/aqua",
      payload: { language: "en", trustScore: 84, citationCount: 4 },
    },
    decision: undefined,
  },
];

/* ----------------------------------------------------------------------------
 * Distribution log seed.
 *
 * Mix of statuses + channels + tenants, with engagement metrics already
 * filled so the /distribution audit table looks lived-in. Spans Adisseo,
 * DSM, and Cargill so the multi-tenant story is visible at a glance.
 * -------------------------------------------------------------------------- */
const SEEDED_DISTRIBUTION: Array<
  Omit<DistributionLog, "id" | "shippedAt"> & { shippedAt: string }
> = [
  {
    tenantId: "adisseo",
    channel: "linkedin",
    deliverable: "Indonesia AGP carousel · 5-slide LinkedIn pack",
    trustScore: 87,
    status: "shipped",
    audience: "12k–85k followers per region",
    audienceCount: 24_276,
    publicUrl:
      "https://www.linkedin.com/feed/update/urn:li:share:adi-id-agp-carousel",
    externalId: "linkedin-shipped-id-agp-carousel",
    dispatchMode: "live",
    rateLimited: false,
    waitMs: 0,
    shippedAt: hoursAgo(18),
    engagement: {
      impressions: 24276,
      qualifiedViews: 612,
      conversations: 142,
      conversions: 84,
      updatedAt: hoursAgo(2),
    },
  },
  {
    tenantId: "adisseo",
    channel: "email",
    deliverable: "Vish distributor blast · 12 mills",
    trustScore: 87,
    status: "shipped",
    audience: "Targeted distributor list",
    audienceCount: 12,
    publicUrl: "https://email-tracking.adiplan.example/sent/vish-id-blast",
    externalId: "email-shipped-vish-id-blast",
    dispatchMode: "mock",
    shippedAt: hoursAgo(17),
    engagement: {
      impressions: 12,
      qualifiedViews: 9,
      conversations: 4,
      conversions: 3,
      updatedAt: hoursAgo(1),
    },
  },
  {
    tenantId: "adisseo",
    channel: "wechat",
    deliverable: "Swine vertical short · PRRS recovery",
    trustScore: 79,
    status: "shipped",
    audience: "OA followers",
    audienceCount: 18_412,
    publicUrl: "https://mp.weixin.qq.com/s/swine-prrs-zh",
    externalId: "wechat-shipped-swine-prrs-zh",
    dispatchMode: "mock",
    shippedAt: hoursAgo(6),
    engagement: {
      impressions: 18412,
      qualifiedViews: 421,
      conversations: 38,
      conversions: 11,
      updatedAt: minsAgo(40),
    },
  },
  {
    tenantId: "dsm-firmenich",
    channel: "linkedin",
    deliverable: "Vietnam ASF biosecurity · short",
    trustScore: 79,
    status: "blocked",
    blockReason:
      "DSM-Firmenich requires HQ approval — current status: rejected",
    audience: "n/a",
    shippedAt: hoursAgo(5),
  },
  {
    tenantId: "adisseo",
    channel: "trade-mag",
    deliverable: "Asian Poultry Magazine · AGP transition piece",
    trustScore: 87,
    status: "queued",
    audience: "Editorial pipeline",
    shippedAt: hoursAgo(4),
  },
  {
    tenantId: "cargill",
    channel: "linkedin",
    deliverable: "Hokkaido heat-stress brochure (JA) · LinkedIn carousel",
    trustScore: 84,
    status: "shipped",
    audience: "JP dairy followers",
    audienceCount: 9_840,
    publicUrl:
      "https://www.linkedin.com/feed/update/urn:li:share:cargill-jp-heat",
    externalId: "linkedin-shipped-cargill-jp-heat",
    dispatchMode: "mock",
    rateLimited: true,
    waitMs: 1_200,
    shippedAt: hoursAgo(3),
    engagement: {
      impressions: 9840,
      qualifiedViews: 311,
      conversations: 47,
      conversions: 21,
      updatedAt: minsAgo(25),
    },
  },
];

/* ----------------------------------------------------------------------------
 * Scheduled-send queue seed.
 *
 * Three entries, spread across the next 8 hours so /distribution shows
 * "next fires in 2h" instead of an empty queue.
 * -------------------------------------------------------------------------- */
const SEEDED_SCHEDULED: Array<
  Omit<ScheduledSend, "id" | "queuedAt" | "status">
> = [
  {
    tenantId: "adisseo",
    channel: "linkedin",
    deliverable: "Vietnam mycotoxin · 1-page leaflet promo",
    trustScore: 84,
    approvalStatus: "approved",
    species: "aqua",
    scheduledFor: new Date(Date.now() + 2 * 3_600_000).toISOString(),
  },
  {
    tenantId: "adisseo",
    channel: "wechat",
    deliverable: "Hokkaido heat-stress brochure · WeChat OA push",
    trustScore: 84,
    approvalStatus: "approved",
    species: "ruminants",
    scheduledFor: new Date(Date.now() + 5 * 3_600_000).toISOString(),
  },
  {
    tenantId: "adisseo",
    channel: "email",
    deliverable: "Asian Poultry Magazine · co-submission email",
    trustScore: 87,
    approvalStatus: "approved",
    species: "poultry",
    scheduledFor: new Date(Date.now() + 8 * 3_600_000).toISOString(),
  },
];

/* ----------------------------------------------------------------------------
 * Live-deliverable seed (for engagement-tracker).
 *
 * Five recent shipped instances tagged as "live" so engagement-tracker
 * shows live-vs-seeded variety without depending on the user actually
 * shipping anything from /distribution.
 * -------------------------------------------------------------------------- */
const SEEDED_LIVE_DELIVERABLES: DeliverableInstance[] = [
  {
    id: "live-id-agp-carousel",
    kind: "carousel",
    title: "Indonesia AGP carousel · 5-slide LinkedIn pack",
    language: "ID",
    region: "Indonesia",
    species: "poultry",
    audience: "Mid-large integrator nutrition directors",
    owner: "Vish",
    sentAt: hoursAgo(18),
    views: 24276,
    qualifiedViews: 612,
    conversations: 142,
    conversions: 84,
    anchorSignal: "Kemin Indonesia AGP-free premix tie-up (art-006)",
    trustScore: 87,
  },
  {
    id: "live-vn-mycotoxin",
    kind: "leaflet",
    title: "Vietnam mycotoxin gate · 1-page leaflet",
    language: "EN",
    region: "Vietnam",
    species: "aqua",
    audience: "VN aqua feed-mill technical buyers",
    owner: "Aileen",
    sentAt: hoursAgo(8),
    views: 1_240,
    qualifiedViews: 312,
    conversations: 41,
    conversions: 22,
    anchorSignal: "Alltech Bangkok mycotoxin lab (art-004)",
    trustScore: 84,
  },
  {
    id: "live-zh-prrs",
    kind: "short",
    title: "Swine vertical short · PRRS recovery (WeChat)",
    language: "ZH",
    region: "China",
    species: "swine",
    audience: "Vet KOL channel · CN",
    owner: "Claire",
    sentAt: hoursAgo(6),
    views: 18412,
    qualifiedViews: 421,
    conversations: 38,
    conversions: 11,
    anchorSignal: "DSM PRRS-resilience paper (art-002)",
    trustScore: 79,
  },
  {
    id: "live-jp-heat",
    kind: "manga",
    title: "Hokkaido heat-stress · 2-page manga brochure (JA)",
    language: "JA",
    region: "Hokkaido",
    species: "ruminants",
    audience: "JP dairy R&D buyers",
    owner: "Antoine",
    sentAt: hoursAgo(3),
    views: 9_840,
    qualifiedViews: 311,
    conversations: 47,
    conversions: 21,
    anchorSignal: "BASF Lutavit Vita-mix NZ launch (art-005)",
    trustScore: 84,
  },
];

/* ----------------------------------------------------------------------------
 * Public entry-point.
 * -------------------------------------------------------------------------- */

export interface SeedFullDemoResult {
  stakeholders: number;
  ladders: number;
  matchSet: boolean;
  frameSet: boolean;
  activity: number;
  approvalsRequested: number;
  approvalsDecided: number;
  distribution: number;
  scheduled: number;
  liveDeliverables: number;
}

/**
 * Hydrate the entire demo state in one call. Idempotent in the sense
 * that running it twice will produce twice the activity; the caller
 * should clear-then-seed if that matters. We don't auto-clear because
 * the user might have legitimate live state they don't want destroyed.
 */
export function seedFullDemo(actions: SeedActions): SeedFullDemoResult {
  // Stakeholders + ladders.
  actions.setSelectedStakeholders(SEEDED_STAKEHOLDER_IDS);
  for (const l of SEEDED_LADDERS) actions.setLadder(l);

  // Article + match.
  actions.setSelectedArticle(SEEDED_MATCH.articleId);
  actions.setMatch(SEEDED_MATCH);

  // Strategic frame.
  actions.setComposedFrame(SEEDED_FRAME);

  // Activity log — push in chronological order so most-recent ends up at top.
  const ordered = [...SEEDED_ACTIVITY].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
  for (const e of ordered) actions.pushActivity(e);

  // Approvals + decisions.
  let decided = 0;
  for (const a of SEEDED_APPROVALS) {
    const id = actions.requestApproval(a.payload);
    if (a.decision) {
      actions.decideApproval(
        id,
        a.decision.decision,
        a.decision.reviewerComment,
        a.decision.reviewer
      );
      decided += 1;
    }
  }

  // Distribution log.
  for (const d of SEEDED_DISTRIBUTION) actions.pushDistribution(d);

  // Scheduled sends.
  for (const s of SEEDED_SCHEDULED) actions.schedule(s);

  // Live deliverables.
  for (const d of SEEDED_LIVE_DELIVERABLES) actions.pushLiveDeliverable(d);

  return {
    stakeholders: SEEDED_STAKEHOLDER_IDS.length,
    ladders: SEEDED_LADDERS.length,
    matchSet: true,
    frameSet: true,
    activity: SEEDED_ACTIVITY.length,
    approvalsRequested: SEEDED_APPROVALS.length,
    approvalsDecided: decided,
    distribution: SEEDED_DISTRIBUTION.length,
    scheduled: SEEDED_SCHEDULED.length,
    liveDeliverables: SEEDED_LIVE_DELIVERABLES.length,
  };
}
