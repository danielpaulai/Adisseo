/**
 * Channel-credential registry — Phase 6 of AdiPlan.
 *
 * Phase 5 wired the channel-adapter pattern with mock dispatch. Phase 6
 * is the production-readiness shell: each channel declares the env vars
 * it needs to go live, the registry detects what's present, and the
 * adapter wrapper falls back to mock when creds are missing.
 *
 * Why not just call the real APIs directly? Because:
 *   1. Adisseo's IT team will want to see exactly what we'd ask for
 *      before approving keys.
 *   2. The demo runs without any creds (everything stays mock).
 *   3. Each tenant has different live channels — DSM-Firmenich won't
 *      ever wire WhatsApp; Cargill will. The registry models that.
 *
 * In production:
 *   - Env vars are loaded from a secrets manager (1Password / Doppler / Vercel)
 *   - The /credentials page reads this registry server-side and returns
 *     a per-tenant status matrix
 *   - The adapter wrapper checks `isLive(tenantId, channel)` per dispatch
 */

import type { TenantId, DistributionChannel } from "@/lib/tenant";

export interface CredentialField {
  /** Env var name. */
  envVar: string;
  /** Short human label. */
  label: string;
  /** True if present at boot. */
  present: boolean;
  /** Sensitivity tier — "secret" | "id" | "url". */
  kind: "secret" | "id" | "url";
}

export interface ChannelCredentials {
  channel: DistributionChannel;
  /** Tenant scope (creds are per-tenant). */
  tenantId: TenantId;
  /** Required + optional fields. */
  fields: CredentialField[];
  /** True if every required field is present. */
  ready: boolean;
  /** Free-form integration note (compliance, rate-limit, etc.). */
  note: string;
  /** Documentation link for the underlying API. */
  docUrl: string;
  /** Per-channel rate-limit (requests / minute). */
  rateLimitPerMin: number;
}

/* ----------------------------------------------------------------------------
 * Per-channel field declarations (channel-agnostic).
 * Tenants instantiate these by prefixing the env vars with their id.
 *
 * Convention:  ADIPLAN_<TENANT>_<CHANNEL>_<FIELD>
 * Example:     ADIPLAN_ADISSEO_LINKEDIN_ORGANIZATION_ID
 *
 * The actual integration would also use OAuth refresh tokens that
 * rotate on a 60-minute cycle; for the demo we just check presence.
 * -------------------------------------------------------------------------- */

interface FieldSpec {
  field: string;
  label: string;
  kind: "secret" | "id" | "url";
}

const CHANNEL_FIELDS: Record<DistributionChannel, FieldSpec[]> = {
  linkedin: [
    { field: "ORG_URN", label: "LinkedIn organisation URN", kind: "id" },
    { field: "OAUTH_TOKEN", label: "OAuth bearer token", kind: "secret" },
    { field: "POSTING_USER_ID", label: "Posting member id", kind: "id" },
  ],
  wechat: [
    { field: "OA_APP_ID", label: "Official Account AppID", kind: "id" },
    { field: "OA_APP_SECRET", label: "Official Account AppSecret", kind: "secret" },
    { field: "ENCODING_AES_KEY", label: "EncodingAESKey (msg push)", kind: "secret" },
  ],
  whatsapp: [
    { field: "PHONE_NUMBER_ID", label: "Business phone number id", kind: "id" },
    { field: "ACCESS_TOKEN", label: "Permanent access token", kind: "secret" },
    { field: "DISTRIBUTOR_LIST_ID", label: "Distributor list id", kind: "id" },
  ],
  email: [
    { field: "PROVIDER", label: "Provider (mailgun|ses)", kind: "id" },
    { field: "API_KEY", label: "Provider API key", kind: "secret" },
    { field: "FROM_DOMAIN", label: "Verified send domain", kind: "url" },
  ],
  "trade-mag": [
    { field: "PORTAL_URL", label: "Editorial portal URL", kind: "url" },
    { field: "EDITOR_EMAIL", label: "Submitting-editor email", kind: "id" },
    { field: "API_TOKEN", label: "Submission API token", kind: "secret" },
  ],
};

const CHANNEL_NOTES: Record<DistributionChannel, string> = {
  linkedin: "LinkedIn UGC API. OAuth scope w_organization_social. Sponsored carousels require an active ad account; we publish via the organisation's company page.",
  wechat: "WeChat OA Publish API. Cookies + WeChat Open Platform OAuth. Compliance: WeChat brand-safety review for non-CN entities (~24h SLA).",
  whatsapp: "WhatsApp Business Cloud API. Opt-in distributor list (template messages until a session is open). Meta business verification required.",
  email: "Pluggable provider. Mailgun by default (SMTP fallback). Verified send domain + DKIM/SPF + bounce-tracking webhook.",
  "trade-mag": "Editorial submission portal per publication. Manual review SLA 1-7 days; the API just queues the submission.",
};

const CHANNEL_DOC_URL: Record<DistributionChannel, string> = {
  linkedin: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api",
  wechat: "https://developers.weixin.qq.com/doc/offiaccount/Publish/Publish.html",
  whatsapp: "https://developers.facebook.com/docs/whatsapp/cloud-api",
  email: "https://documentation.mailgun.com/en/latest/api-sending.html",
  "trade-mag": "internal://docs/trade-mag-portal-api.pdf",
};

const CHANNEL_RATE_LIMIT: Record<DistributionChannel, number> = {
  linkedin: 25,
  wechat: 12,
  whatsapp: 60,
  email: 240,
  "trade-mag": 6,
};

/* ----------------------------------------------------------------------------
 * Env-presence detection.
 *
 * Reads process.env (server-side only). Phase 6 demo: zero env vars set
 * => everything reports "mock". Set a single var to flip a row to "ready"
 * and it becomes live.
 * -------------------------------------------------------------------------- */
function envVarFor(tenantId: TenantId, channel: DistributionChannel, field: string): string {
  const channelTag = channel === "trade-mag" ? "TRADEMAG" : channel.toUpperCase();
  const tenantTag = tenantId.toUpperCase().replace(/[^A-Z0-9]+/g, "");
  return `ADIPLAN_${tenantTag}_${channelTag}_${field}`;
}

function isPresent(varName: string): boolean {
  if (typeof process === "undefined") return false;
  const v = process.env[varName];
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Build the full credential matrix for one tenant.
 *
 * Server-side only — process.env reads do not work on the client. All
 * pages that consume this should be server components or pull via an
 * API route.
 */
export function getTenantCredentials(tenantId: TenantId): ChannelCredentials[] {
  return (Object.keys(CHANNEL_FIELDS) as DistributionChannel[]).map((channel) => {
    const fields: CredentialField[] = CHANNEL_FIELDS[channel].map((f) => {
      const envVar = envVarFor(tenantId, channel, f.field);
      return {
        envVar,
        label: f.label,
        kind: f.kind,
        present: isPresent(envVar),
      };
    });
    return {
      channel,
      tenantId,
      fields,
      ready: fields.every((f) => f.present),
      note: CHANNEL_NOTES[channel],
      docUrl: CHANNEL_DOC_URL[channel],
      rateLimitPerMin: CHANNEL_RATE_LIMIT[channel],
    };
  });
}

/**
 * Quick boolean — should the adapter use the live HTTP shell or fall
 * back to the mock dispatch? Server-side only.
 */
export function isLive(tenantId: TenantId, channel: DistributionChannel): boolean {
  const cs = getTenantCredentials(tenantId).find((c) => c.channel === channel);
  return cs?.ready ?? false;
}

/**
 * Per-tenant webhook secret. Used by /api/webhook/[tenant]/[channel] to
 * verify HMAC signatures on inbound callbacks. If the env var is absent
 * we fall back to a deterministic-but-public dev secret so the demo
 * always works.
 */
export function getWebhookSecret(tenantId: TenantId): string {
  const v = process.env[`ADIPLAN_${tenantId.toUpperCase().replace(/[^A-Z0-9]+/g, "")}_WEBHOOK_SECRET`];
  if (v && v.trim().length > 0) return v;
  // Deterministic dev fallback. NOT for production use.
  return `adiplan-dev-secret-${tenantId}`;
}

/**
 * The full env-var list a tenant operator needs to set. Used by the
 * /credentials page to render copy-paste env-var snippets.
 */
export function getRequiredEnvVarsForTenant(
  tenantId: TenantId
): { channel: DistributionChannel; envVars: string[] }[] {
  return (Object.keys(CHANNEL_FIELDS) as DistributionChannel[]).map((channel) => ({
    channel,
    envVars: CHANNEL_FIELDS[channel].map((f) => envVarFor(tenantId, channel, f.field)),
  }));
}
