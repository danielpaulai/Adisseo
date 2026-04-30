/**
 * Apr-30 workshop — leading vs lagging metrics framework (Poster 1).
 *
 * Ricardo recorded the workshop's metrics framework on the call, then sent
 * the picture afterward. Encoded here so the Engagement Tracker can render
 * the workshop view alongside the existing per-channel signal mapping.
 *
 * The framework has three columns:
 *   - LEADING  — campaign-level activity we control directly (push)
 *   - PROGRESS — sales-funnel mid-points (pull/qualify)
 *   - LAGGING  — sales outcomes the CRM measures (close)
 *
 * Each metric is tagged with a `tfipCampaignTag: true` flag if it depends on
 * the campaignId being attached to the deliverable / visit-report. The
 * /campaign-fanout page tags every output it produces with `campaignId: "tfip"`
 * so the lagging-metric attribution path stays unbroken.
 */

export type WorkshopMetricBucket = "leading" | "progress" | "lagging";

export type WorkshopMetricStatus = "on-track" | "watch" | "off-track";

export interface WorkshopMetric {
  id: string;
  bucket: WorkshopMetricBucket;
  label: string;
  /** One-sentence definition matching the poster wording. */
  definition: string;
  /** Source / system the workshop assigned (Salesforce, Showpad, etc.). */
  source: string;
  /** Owner role / desk on the workshop poster. */
  owner: string;
  /** Whether the metric depends on `campaignId: "tfip"` being attached. */
  tfipCampaignTag?: boolean;
  /** Workshop-tagged status — the poster flagged 3 progress-checks as amber. */
  status?: WorkshopMetricStatus;
  /** Demo target / benchmark Ricardo wants to see by May 7. */
  target?: string;
  /** Current demo value — pulled from the SEED set below. */
  current?: string;
}

export const LEADING_METRICS: WorkshopMetric[] = [
  {
    id: "lm-targeted-messaging-qty",
    bucket: "leading",
    label: "Targeted messaging by persona — quantity",
    definition:
      "Number of stakeholder-tuned deliverables shipped per persona per cycle (email + infographic).",
    source: "/campaign-fanout · DistributionLog",
    owner: "Vish · APAC marketing",
    tfipCampaignTag: true,
    target: "≥ 6 / cycle (3 stakeholders × 2 channels)",
    current: "6 / cycle",
    status: "on-track",
  },
  {
    id: "lm-customer-list-visited",
    bucket: "leading",
    label: "% of customer list visited",
    definition:
      "Share of named integrators (CP, Japfa, Charoen Pokphand, etc.) visited at least once with a TFIP brochure / deck in-hand.",
    source: "Salesforce · visit reports tagged TFIP",
    owner: "APAC field sales",
    tfipCampaignTag: true,
    target: "≥ 80% of top-50 list",
    current: "62%",
    status: "watch",
  },
  {
    id: "lm-feedback-rated",
    bucket: "leading",
    label: "Number of feedback ratings (1-to-5) collected",
    definition:
      "Post-visit feedback collected in Salesforce on the TFIP deck quality and the stakeholder reception.",
    source: "Salesforce · NPS-style 1-5 visit feedback",
    owner: "APAC field sales",
    tfipCampaignTag: true,
    target: "≥ 1 rating per visit",
    current: "0.71 ratings/visit",
    status: "watch",
  },
  {
    id: "lm-showpad-tracking",
    bucket: "leading",
    label: "Showpad tracking — TFIP asset opens & shares",
    definition:
      "Number of times the TFIP commercial deck / leaflet was opened or shared via Showpad in customer meetings.",
    source: "Showpad · TFIP asset shelf",
    owner: "APAC sales-ops",
    tfipCampaignTag: true,
    target: "≥ 200 asset interactions / month",
    current: "147 / month",
    status: "watch",
  },
  {
    id: "lm-digital-interactions",
    bucket: "leading",
    label: "Digital interactions on TFIP carousels & emails",
    definition:
      "LinkedIn engaged-views + Mailgun clicks on /campaign-fanout outputs.",
    source: "LinkedIn analytics · Mailgun · DistributionLog",
    owner: "APAC marketing",
    tfipCampaignTag: true,
    target: "≥ 8% qualified-engagement rate",
    current: "9.2%",
    status: "on-track",
  },
];

export const PROGRESS_METRICS: WorkshopMetric[] = [
  {
    id: "pm-opps-tagged",
    bucket: "progress",
    label: "Opportunities tagged with TFIP",
    definition:
      "Salesforce opportunities created with the TFIP campaign tag in the originating-campaign field.",
    source: "Salesforce · campaign attribution",
    owner: "APAC sales-ops",
    tfipCampaignTag: true,
    target: "≥ 25 tagged opps in cycle",
    current: "11 tagged opps",
    status: "off-track",
  },
  {
    id: "pm-visit-reports-tagged",
    bucket: "progress",
    label: "Visit reports tagged with TFIP campaign",
    definition:
      "Visit-report entries in Salesforce flagged with the TFIP campaign id (the QR-code workflow).",
    source: "Salesforce · visit-report campaign tag",
    owner: "APAC field sales",
    tfipCampaignTag: true,
    target: "≥ 60 tagged visit reports",
    current: "38 tagged",
    status: "watch",
  },
  {
    id: "pm-customer-interactions",
    bucket: "progress",
    label: "Customer interactions per opportunity",
    definition:
      "Number of meaningful interactions (call / visit / digital reply) logged per TFIP-tagged opportunity.",
    source: "Salesforce · interaction log",
    owner: "APAC field sales",
    target: "≥ 4 interactions per opp",
    current: "3.2 / opp",
    status: "watch",
  },
];

export const LAGGING_METRICS: WorkshopMetric[] = [
  {
    id: "gm-real-sales",
    bucket: "lagging",
    label: "Real sales generated by the campaign",
    definition:
      "Closed-won revenue attributed to TFIP-tagged opportunities (ASP × volume).",
    source: "Salesforce · closed-won by campaign",
    owner: "APAC commercial leadership",
    tfipCampaignTag: true,
    target: "≥ €1.2M closed-won this cycle",
    current: "€420k",
    status: "off-track",
  },
  {
    id: "gm-leads-converted",
    bucket: "lagging",
    label: "Leads converted to contracts",
    definition:
      "Lead → contract conversion rate on TFIP-tagged leads (any stakeholder).",
    source: "Salesforce · pipeline conversion",
    owner: "APAC commercial leadership",
    tfipCampaignTag: true,
    target: "≥ 18% conversion",
    current: "12.4%",
    status: "watch",
  },
  {
    id: "gm-asp",
    bucket: "lagging",
    label: "Average selling price (ASP) increase",
    definition:
      "ASP delta on closed-won TFIP-tagged opps vs control / non-tagged.",
    source: "Salesforce · ASP analytics",
    owner: "APAC pricing",
    tfipCampaignTag: true,
    target: "≥ +3% ASP",
    current: "+1.8% ASP",
    status: "watch",
  },
  {
    id: "gm-revenue-from-won",
    bucket: "lagging",
    label: "Revenue from won opps (TFIP-tagged)",
    definition:
      "Recognised revenue across TFIP-tagged closed-won opps (rolling 90 days).",
    source: "Finance · revenue recognition",
    owner: "APAC commercial leadership",
    tfipCampaignTag: true,
    target: "≥ €900k in 90d",
    current: "€312k",
    status: "off-track",
  },
  {
    id: "gm-profitability-uplift",
    bucket: "lagging",
    label: "Profitability uplift (%)",
    definition:
      "Margin uplift on TFIP-tagged opps vs the prior-cycle baseline.",
    source: "Finance · margin analytics",
    owner: "APAC finance",
    target: "≥ +2 pts margin",
    current: "+0.9 pts",
    status: "watch",
  },
  {
    id: "gm-adoption-of-services",
    bucket: "lagging",
    label: "Adoption rate of services (PNE / FDC / ADICT)",
    definition:
      "Share of TFIP-tagged accounts that adopted at least one Adisseo service post-campaign.",
    source: "Adisseo service registry",
    owner: "APAC technical services",
    tfipCampaignTag: true,
    target: "≥ 35% of tagged accounts",
    current: "21%",
    status: "watch",
  },
];

export const ALL_WORKSHOP_METRICS: WorkshopMetric[] = [
  ...LEADING_METRICS,
  ...PROGRESS_METRICS,
  ...LAGGING_METRICS,
];

export const WORKSHOP_BUCKET_LABEL: Record<WorkshopMetricBucket, string> = {
  leading: "Leading — what we ship (push)",
  progress: "Progress — what the funnel does (pull)",
  lagging: "Lagging — what the CRM closes (outcome)",
};

export const WORKSHOP_BUCKET_BLURB: Record<WorkshopMetricBucket, string> = {
  leading:
    "Activity-side metrics under marketing's direct control. Updated weekly, used to spot drift early.",
  progress:
    "Funnel-mid metrics that bridge activity to outcome. Watched bi-weekly. Three of these are flagged amber on the workshop poster.",
  lagging:
    "Closed-loop CRM outcomes. Reviewed monthly. Late signal — but the only signal that justifies budget.",
};

export function workshopMetricsByBucket(
  bucket: WorkshopMetricBucket,
): WorkshopMetric[] {
  return ALL_WORKSHOP_METRICS.filter((m) => m.bucket === bucket);
}

/** True when this view depends on having `campaignId: "tfip"` propagated. */
export function metricsRequiringTfipTag(): WorkshopMetric[] {
  return ALL_WORKSHOP_METRICS.filter((m) => m.tfipCampaignTag);
}
