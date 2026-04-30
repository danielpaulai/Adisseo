/**
 * Distribution rails — Phase 4 of AdiPlan.
 *
 * Once a deliverable clears the trust gate AND HQ approval, it can be
 * distributed to a channel. This module centralises the gating logic
 * so every channel goes through the same checks.
 *
 * Gating rules (all must pass):
 *   1. Tenant approves this channel (`tenant.approvedChannels`).
 *   2. Trust composite ≥ tenant.trustFloor.
 *   3. If tenant.requiresHqApproval: approval status must be "approved".
 *   4. Deliverable's species is allowed for this tenant.
 *
 * Mock distribution latency is simulated by the API. In production this
 * would be a typed dispatch into the LinkedIn / WeChat / WhatsApp /
 * email / trade-mag plumbing.
 */

import {
  CHANNELS,
  TENANTS,
  type ChannelMeta,
  type DistributionChannel,
  type TenantId,
} from "@/lib/tenant";

export type DistributionStatus = "queued" | "shipped" | "blocked";

export interface DistributionRequest {
  tenantId: TenantId;
  channel: DistributionChannel;
  /** Deliverable label, e.g. "Indonesia AGP-removal carousel · ID Q1 2026". */
  deliverable: string;
  /** Trust composite, 0–100. */
  trustScore: number;
  /** Approval id if requiresHqApproval is true. */
  approvalId?: string;
  /** "approved" | "pending" | "rejected" | undefined. */
  approvalStatus?: "approved" | "pending" | "rejected";
  /** Species the deliverable is for. */
  species?: "aqua" | "poultry" | "ruminants" | "swine" | "cross";
}

export interface DistributionResult {
  status: DistributionStatus;
  reason?: string;
  channelMeta: ChannelMeta;
  /** Mock latency the API will sleep before responding. */
  mockLatencyMs: number;
  /** Audience description. */
  audience: string;
}

/**
 * Apply all gating rules. Returns a DistributionResult ready to be
 * persisted to the activity log + observability.
 */
export function evaluateDistribution(req: DistributionRequest): DistributionResult {
  const tenant = TENANTS[req.tenantId];
  const channelMeta = CHANNELS[req.channel];
  if (!tenant) {
    return {
      status: "blocked",
      reason: `Unknown tenant: ${req.tenantId}`,
      channelMeta,
      mockLatencyMs: 0,
      audience: channelMeta?.audience ?? "—",
    };
  }
  if (!channelMeta) {
    return {
      status: "blocked",
      reason: `Unknown channel: ${req.channel}`,
      channelMeta,
      mockLatencyMs: 0,
      audience: "—",
    };
  }

  // 1. Channel approved by tenant?
  if (!tenant.approvedChannels.includes(req.channel)) {
    return {
      status: "blocked",
      reason: `${tenant.name} does not approve channel "${channelMeta.label}"`,
      channelMeta,
      mockLatencyMs: 0,
      audience: channelMeta.audience,
    };
  }

  // 2. Trust floor?
  if (req.trustScore < tenant.trustFloor) {
    return {
      status: "blocked",
      reason: `Trust ${req.trustScore} below ${tenant.name}'s floor of ${tenant.trustFloor}. Run /trust-layer.`,
      channelMeta,
      mockLatencyMs: 0,
      audience: channelMeta.audience,
    };
  }

  // 3. HQ approval?
  if (tenant.requiresHqApproval) {
    if (req.approvalStatus !== "approved") {
      return {
        status: "blocked",
        reason: `${tenant.name} requires HQ approval — current status: ${req.approvalStatus ?? "missing"}`,
        channelMeta,
        mockLatencyMs: 0,
        audience: channelMeta.audience,
      };
    }
  }

  // 4. Species in tenant scope?
  if (req.species && !tenant.species.includes(req.species)) {
    return {
      status: "blocked",
      reason: `${tenant.name} does not cover species "${req.species}"`,
      channelMeta,
      mockLatencyMs: 0,
      audience: channelMeta.audience,
    };
  }

  return {
    status: "shipped",
    channelMeta,
    mockLatencyMs: channelMeta.mockLatencyMs,
    audience: channelMeta.audience,
  };
}

/**
 * Curated demo deliverables, tagged by tenant + species, with synthetic
 * trust scores. Used by the /distribution page so the queue is never
 * empty.
 */
export interface DemoDeliverable {
  id: string;
  tenantId: TenantId;
  label: string;
  species: "aqua" | "poultry" | "ruminants" | "swine" | "cross";
  manager: string;
  trustScore: number;
  /** Synthetic approval status. */
  approvalStatus: "approved" | "pending" | "rejected";
  /** The natural channel(s) for this deliverable. */
  recommendedChannels: DistributionChannel[];
  /** Studio that produced it. */
  studio: string;
  /** Phase 5 — body text used by channel adapters to build the preview. */
  body: string;
  /** Phase 5 — region for audience copy. */
  region?: string;
  /** Phase 5 — citation count for the trust footer. */
  citationCount?: number;
  /** Phase 5 — hashtags for LinkedIn / WeChat. */
  hashtags?: string[];
}

export const DEMO_DELIVERABLES: DemoDeliverable[] = [
  // Adisseo
  {
    id: "del-adi-poultry-id",
    tenantId: "adisseo",
    label: "Indonesia AGP-removal carousel · 5-slide LinkedIn pack",
    species: "poultry",
    manager: "Vish",
    trustScore: 87,
    approvalStatus: "approved",
    recommendedChannels: ["linkedin", "email"],
    studio: "Poultry studio",
    region: "Indonesia",
    citationCount: 4,
    hashtags: ["#poultry", "#feed", "#APAC", "#AGPfree"],
    body:
      "Indonesia mills are removing AGPs faster than the regulators expected. Trial across 6 commercial broiler farms (n=144,000 birds) shows that holding FCR within 3 points of the AGP baseline takes a methionine + organic-acid stack, not a single-additive swap. Day-7 mortality drops from 1.8% to 1.1%. Rhodimet AT88 is the spine; Adisseo's APAC team has the protocol. [^v-poultry-id-2025]",
  },
  {
    id: "del-adi-aqua-vn",
    tenantId: "adisseo",
    label: "Vietnam mycotoxin gate · 1-page leaflet",
    species: "aqua",
    manager: "Aileen",
    trustScore: 84,
    approvalStatus: "approved",
    recommendedChannels: ["email", "trade-mag"],
    studio: "Aqua studio",
    region: "Vietnam",
    citationCount: 3,
    hashtags: ["#aqua", "#shrimp", "#mycotoxin"],
    body:
      "Vietnamese shrimp-feed mill QC trial (n=12 batches) showed a 38% reduction in DON contamination after switching to the mycotoxin binder protocol. Average dry-matter intake recovered to baseline within 7 days. The leaflet captures the 4-step gate Adisseo's APAC team uses with three top-3 integrators in HCMC. [^v-aqua-asfu-2025]",
  },
  {
    id: "del-adi-ruminants-jp",
    tenantId: "adisseo",
    label: "Hokkaido J-credit manga 2-pager (JP)",
    species: "ruminants",
    manager: "Antoine",
    trustScore: 82,
    approvalStatus: "approved",
    recommendedChannels: ["trade-mag"],
    studio: "Ruminants studio",
    region: "Hokkaido",
    citationCount: 2,
    hashtags: ["#ruminants", "#dairy", "#methane", "#JCredit"],
    body:
      "Hokkaido dairy farmers face heat stress + methane reporting in the same Q2. The manga 2-pager pitches the J-credit pathway as a margin tool, not a compliance tax. Bovaer-style 27% methane suppression with no milk-yield trade-off; Mizuho's J-credit auction last cleared at ¥1,400/tCO2. [^v-rumi-bovaer-2025]",
  },
  {
    id: "del-adi-swine-cn",
    tenantId: "adisseo",
    label: "ASF nursery short · 60s WeChat",
    species: "swine",
    manager: "Claire",
    trustScore: 76,
    approvalStatus: "pending",
    recommendedChannels: ["wechat"],
    studio: "Swine studio",
    region: "China",
    citationCount: 2,
    hashtags: ["#swine", "#ASF", "#nursery"],
    body:
      "ASF nursery recovery starts at the feed bunk. 60-second short captures the 4-day re-introduction protocol Adisseo's swine team validated across 4 SE-Asia integrators. Mortality falls from 2.4% to 0.9%; FCR holds within 2 points of pre-outbreak baseline. [^v-swine-asf-2025]",
  },
  {
    id: "del-adi-poultry-th",
    tenantId: "adisseo",
    label: "Thailand emailer + carousel · mycotoxin gate",
    species: "poultry",
    manager: "Vish",
    trustScore: 58,
    approvalStatus: "approved",
    recommendedChannels: ["email", "linkedin"],
    studio: "Poultry studio",
    region: "Thailand",
    citationCount: 1,
    hashtags: ["#poultry", "#mycotoxin", "#APAC"],
    body:
      "Thailand integrator panel confirms the mycotoxin gate from the Indonesia trial holds up at the Thai humidity baseline. The emailer is a single-page brief; the carousel is the 5-slide deep dive. Send both in one push for the integrator vet desks.",
  },
  // DSM-Firmenich (blueprint)
  {
    id: "del-dsm-bovaer-eu",
    tenantId: "dsm-firmenich",
    label: "Bovaer methane brief · EU dairy trade pack",
    species: "ruminants",
    manager: "Zurich desk",
    trustScore: 88,
    approvalStatus: "approved",
    recommendedChannels: ["trade-mag", "linkedin"],
    studio: "Ruminants studio",
    region: "EU",
    citationCount: 5,
    hashtags: ["#dairy", "#methane", "#Bovaer"],
    body:
      "DSM-Firmenich Bovaer (3-NOP) hits 27% enteric methane suppression with no milk-yield trade-off. Trade-pack covers the EU Sustainable Dairy framework anchor, the meta-analysis across 14 trials, and the regulatory compliance posture for EU Reg 2018/848. [^v-dsm-bovaer-2026]",
  },
  {
    id: "del-dsm-balancius-nl",
    tenantId: "dsm-firmenich",
    label: "Balancius NL broiler trial · LinkedIn carousel",
    species: "poultry",
    manager: "Zurich desk",
    trustScore: 82,
    approvalStatus: "pending",
    recommendedChannels: ["linkedin", "email"],
    studio: "Poultry studio",
    region: "Netherlands",
    citationCount: 3,
    hashtags: ["#poultry", "#enzyme", "#EU"],
    body:
      "Balancius enzyme tested across 6 commercial Dutch broiler farms (n=144,000 birds). FCR improvement of 3.1 points, 1.4pp mortality reduction vs control. Compliant with EU Reg 2018/848. The 5-slide carousel breaks down the protocol for nutritionist-side decisions. [^v-dsm-balancius-2026]",
  },
  // Cargill (blueprint)
  {
    id: "del-cargill-promote-mx",
    tenantId: "cargill",
    label: "Promote nursery protocol · LatAm WhatsApp pack",
    species: "swine",
    manager: "Mpls desk",
    trustScore: 81,
    approvalStatus: "approved",
    recommendedChannels: ["whatsapp", "email"],
    studio: "Swine studio",
    region: "Mexico",
    citationCount: 4,
    hashtags: ["#swine", "#nursery", "#LatAm"],
    body:
      "Cargill Promote nursery protocol — 4 sites, 14,200 piglets, mortality reduction of 0.8pp and nursery FCR improvement of 2.4 points. The WhatsApp pack lands as a one-bubble brief plus a 5-slide carousel for the LatAm distributor list. [^v-cargill-promote-2026]",
  },
  // Kemin (blueprint)
  {
    id: "del-kemin-clostat",
    tenantId: "kemin",
    label: "CLOSTAT broiler peer-review summary · trade-mag",
    species: "poultry",
    manager: "Des Moines desk",
    trustScore: 85,
    approvalStatus: "approved",
    recommendedChannels: ["trade-mag", "linkedin"],
    studio: "Poultry studio",
    region: "Global",
    citationCount: 6,
    hashtags: ["#poultry", "#probiotic", "#NE"],
    body:
      "CLOSTAT (Bacillus subtilis) reduces necrotic enteritis incidence by 41% and improves bird uniformity by 2.8pp across 8 university trials. The trade-mag submission walks through the meta-analysis and the on-farm protocol nutritionists can deploy in week one. [^v-kemin-clostat-2026]",
  },
];
