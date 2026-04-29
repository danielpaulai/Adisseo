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
  },
];
