/**
 * Multi-tenant configuration registry.
 *
 * Phase 4. The trust layer is already brand-voice scoped. The Vault
 * already tags entries by species + region. What's missing is a single
 * "tenant" that ties everything together so APAC can run for
 * Adisseo today, DSM-Firmenich next quarter, Cargill the quarter
 * after, etc. — each with their own brand voice, vault scope,
 * approved channels, and trust floor.
 *
 * The tenant id flows through:
 *   - ProseQualityCard → picks the brand-voice config
 *   - /vault → filters entries the user can see
 *   - /distribution → only routes to channels the tenant approves
 *   - /api/distribute → enforces tenant trust floor + approval rules
 *   - Engagement tracker → partitions metrics
 *
 * Keep deterministic. No tenant-specific code paths sprinkled through
 * the codebase — every consumer reads from this registry.
 */

import type { BrandVoiceId } from "@/lib/brand-voice";

export type TenantId = "adisseo" | "dsm-firmenich" | "cargill" | "kemin";

export type DistributionChannel = "linkedin" | "wechat" | "whatsapp" | "email" | "trade-mag";

export interface TenantConfig {
  id: TenantId;
  /** Display label, e.g. "Adisseo APAC". */
  name: string;
  /** Short blurb, used on /tenants. */
  blurb: string;
  /** Hex accent colour — used in tenant chips. */
  accent: string;
  /** Brand-voice config id. */
  brandVoice: BrandVoiceId;
  /** Tenant-specific home region focus. */
  homeRegions: string[];
  /** Trust composite floor below which Send-to-HQ is blocked. */
  trustFloor: number;
  /** Trust composite floor below which engagement-tracker grading is demoted. */
  warningFloor: number;
  /** Approved distribution channels (anything else is blocked at API). */
  approvedChannels: DistributionChannel[];
  /** If true, deliverables MUST clear HQ approval before distribution. */
  requiresHqApproval: boolean;
  /** Reviewer label shown on the approval queue. */
  reviewerLabel: string;
  /** Vault tenancy mode — "owned" reads tenant-only, "shared" includes cross-tenant. */
  vaultMode: "owned" | "shared";
  /** Tenant-approved species (others are blocked from this tenant's view). */
  species: ("aqua" | "poultry" | "ruminants" | "swine" | "cross")[];
  /** Tenant-approved manager ids — who can ship under this tenant. */
  managers: string[];
  /** Display order on the tenant directory. */
  order: number;
}

/* ----------------------------------------------------------------------------
 * Seeded tenant registry.
 *
 * Adisseo is the live customer; the other three are blueprinted as
 * "what would it look like to onboard them next" — channel mix and
 * trust floor reflect what each company's compliance team would
 * actually demand based on public statements.
 * -------------------------------------------------------------------------- */
export const TENANTS: Record<TenantId, TenantConfig> = {
  adisseo: {
    id: "adisseo",
    name: "Adisseo APAC",
    blurb:
      "Live customer. Ricardo's APAC team — 4 species managers, 8–10 markets, ~300 stakeholders mapped, 20+ Vault entries.",
    accent: "#A70A2D",
    brandVoice: "adisseo",
    homeRegions: ["JP", "CN", "VN", "TH", "ID", "PH", "MY", "KR", "AU"],
    trustFloor: 60,
    warningFloor: 80,
    approvedChannels: ["linkedin", "wechat", "trade-mag", "email"],
    requiresHqApproval: true,
    reviewerLabel: "Ricardo (APAC lead)",
    vaultMode: "owned",
    species: ["aqua", "poultry", "ruminants", "swine", "cross"],
    managers: ["vish", "aileen", "antoine", "claire", "ricardo"],
    order: 1,
  },
  "dsm-firmenich": {
    id: "dsm-firmenich",
    name: "DSM-Firmenich",
    blurb:
      "Q3 2026 onboarding blueprint. Stricter regulatory posture (Swiss + EU compliance), narrower channel mix, no WhatsApp.",
    accent: "#0F8A8D",
    brandVoice: "dsm-firmenich",
    homeRegions: ["EU", "JP", "CN", "BR"],
    trustFloor: 70,
    warningFloor: 85,
    approvedChannels: ["linkedin", "trade-mag", "email"],
    requiresHqApproval: true,
    reviewerLabel: "Zurich brand desk",
    vaultMode: "owned",
    species: ["aqua", "poultry", "ruminants", "swine"],
    managers: ["zurich-desk-1", "zurich-desk-2"],
    order: 2,
  },
  cargill: {
    id: "cargill",
    name: "Cargill Animal Nutrition",
    blurb:
      "Q4 2026 onboarding blueprint. Massive North-American footprint, wider channel mix including WhatsApp for LatAm distributors.",
    accent: "#0E7C66",
    brandVoice: "cargill",
    homeRegions: ["US", "BR", "MX", "TH", "ID"],
    trustFloor: 65,
    warningFloor: 80,
    approvedChannels: ["linkedin", "wechat", "whatsapp", "email"],
    requiresHqApproval: true,
    reviewerLabel: "Minneapolis brand desk",
    vaultMode: "owned",
    species: ["aqua", "poultry", "ruminants", "swine"],
    managers: ["mpls-desk-1", "mpls-desk-2"],
    order: 3,
  },
  kemin: {
    id: "kemin",
    name: "Kemin Industries",
    blurb:
      "Q1 2027 onboarding blueprint. Smaller team, leans heavily on Vault-anchored technical bulletins. Trade-mag + LinkedIn only.",
    accent: "#7C2D12",
    brandVoice: "kemin",
    homeRegions: ["US", "EU", "JP", "TH"],
    trustFloor: 65,
    warningFloor: 80,
    approvedChannels: ["linkedin", "trade-mag"],
    requiresHqApproval: true,
    reviewerLabel: "Des Moines brand desk",
    vaultMode: "owned",
    species: ["aqua", "poultry", "ruminants", "swine"],
    managers: ["dsm-desk-1"],
    order: 4,
  },
};

export const TENANT_LIST: TenantConfig[] = Object.values(TENANTS).sort(
  (a, b) => a.order - b.order
);

export function getTenant(id: TenantId): TenantConfig {
  return TENANTS[id] ?? TENANTS.adisseo;
}

export const DEFAULT_TENANT_ID: TenantId = "adisseo";

/* ----------------------------------------------------------------------------
 * Channel metadata — used by /distribution and /api/distribute.
 * -------------------------------------------------------------------------- */
export interface ChannelMeta {
  id: DistributionChannel;
  label: string;
  /** Quick description of what shipping here means. */
  blurb: string;
  /** Approx audience size description. */
  audience: string;
  /** Hex accent for chips. */
  accent: string;
  /** Mock distribution latency (ms). */
  mockLatencyMs: number;
}

export const CHANNELS: Record<DistributionChannel, ChannelMeta> = {
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    blurb: "Carousel + emailer pack on the regional manager's company page.",
    audience: "12k–85k followers per region",
    accent: "#0A66C2",
    mockLatencyMs: 1_200,
  },
  wechat: {
    id: "wechat",
    label: "WeChat OA",
    blurb: "Official Account push to verified subscribers in CN markets.",
    audience: "8k–40k subscribers per OA",
    accent: "#07C160",
    mockLatencyMs: 1_800,
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp distributor list",
    blurb: "Direct push to a pre-opted-in distributor / KOL list (LatAm, SEA).",
    audience: "200–1,200 distributors per list",
    accent: "#25D366",
    mockLatencyMs: 1_400,
  },
  email: {
    id: "email",
    label: "Email blast",
    blurb: "Targeted send to the species manager's CRM list with HTML + PDF attached.",
    audience: "3k–18k recipients per list",
    accent: "#6366F1",
    mockLatencyMs: 900,
  },
  "trade-mag": {
    id: "trade-mag",
    label: "Trade-magazine slot",
    blurb: "Submission queue for Japanese dairy / aqua / poultry trade publications.",
    audience: "Editorial review + print + digital",
    accent: "#9333EA",
    mockLatencyMs: 4_200,
  },
};

export const CHANNEL_LIST: ChannelMeta[] = Object.values(CHANNELS);
