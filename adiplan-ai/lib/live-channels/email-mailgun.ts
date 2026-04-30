/**
 * Live email channel — Mailgun.
 *
 * The first real channel adapter. Phase 6 stood up the production-readiness
 * shell (credentials, retry, rate-limit, HMAC webhooks); this is the first
 * adapter that actually hits an external API instead of returning a mocked
 * preview.
 *
 * Why Mailgun first:
 *   - Free tier: $0/mo, ~100 sends/day → enough for a live demo
 *   - Single REST POST, multipart/form-data, no OAuth dance
 *   - Verified-domain DKIM/SPF in 5 minutes
 *   - Inbound delivery webhook → /api/webhook/[tenant]/email already exists
 *
 * The adapter:
 *   1. Builds the multipart/form-data payload Mailgun expects
 *   2. POSTs to https://api.mailgun.net/v3/<domain>/messages with HTTP
 *      Basic auth (`api:<api-key>`)
 *   3. Returns the same ChannelDispatchResult shape the mock returns,
 *      so the dispatcher + UI never branch on "is this real?"
 *   4. Throws on non-2xx (the dispatcher's withRetry will catch + back off)
 *
 * Environment variables (per tenant):
 *   ADIPLAN_<TENANT>_EMAIL_PROVIDER    — must be "mailgun" to activate
 *   ADIPLAN_<TENANT>_EMAIL_API_KEY     — Mailgun secret API key
 *   ADIPLAN_<TENANT>_EMAIL_FROM_DOMAIN — verified send domain
 *
 * Plus optional overrides:
 *   ADIPLAN_<TENANT>_EMAIL_FROM_NAME    — defaults to "APAC"
 *   ADIPLAN_<TENANT>_EMAIL_FROM_ADDRESS — defaults to "adiplan@<domain>"
 *   ADIPLAN_<TENANT>_EMAIL_TEST_TO      — comma-separated test recipients
 *                                         used by /credentials "Test send"
 */

import type { ChannelDispatchInput, ChannelDispatchResult, EmailPreview } from "@/lib/channel-adapter";
import type { TenantId } from "@/lib/tenant";

/* ----------------------------------------------------------------------------
 * Tenant env reading helpers (server-side only).
 * -------------------------------------------------------------------------- */
function tenantTag(id: TenantId): string {
  return id.toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

function envFor(id: TenantId, suffix: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const k = `ADIPLAN_${tenantTag(id)}_EMAIL_${suffix}`;
  const v = process.env[k];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

export interface MailgunConfig {
  provider: "mailgun";
  apiKey: string;
  domain: string;
  fromName: string;
  fromAddress: string;
  /** Comma-separated test recipients for the /credentials "Test send" button. */
  testRecipients: string[];
}

/** Returns null if Mailgun is not configured for this tenant. */
export function getMailgunConfig(tenantId: TenantId): MailgunConfig | null {
  const provider = envFor(tenantId, "PROVIDER");
  if (provider !== "mailgun") return null;

  const apiKey = envFor(tenantId, "API_KEY");
  const domain = envFor(tenantId, "FROM_DOMAIN");
  if (!apiKey || !domain) return null;

  const fromName = envFor(tenantId, "FROM_NAME") ?? "APAC";
  const fromAddress =
    envFor(tenantId, "FROM_ADDRESS") ?? `adiplan@${domain}`;
  const testRecipients = (envFor(tenantId, "TEST_TO") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    provider: "mailgun",
    apiKey,
    domain,
    fromName,
    fromAddress,
    testRecipients,
  };
}

/* ----------------------------------------------------------------------------
 * Body composition helpers.
 *
 * Convert the APAC deliverable (subject + body markdown-ish text) into
 * the HTML + plain-text payloads Mailgun expects.
 * -------------------------------------------------------------------------- */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bodyToHtml(body: string, hashtags?: string[]): string {
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 16px 0;line-height:1.6">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
  const tags =
    hashtags && hashtags.length
      ? `<p style="margin:24px 0 0 0;color:#888;font-size:13px">${hashtags
          .map((t) => escapeHtml(t))
          .join(" · ")}</p>`
      : "";
  return [
    `<!doctype html>`,
    `<html><head><meta charset="utf-8"></head>`,
    `<body style="font-family:Inter,Arial,sans-serif;color:#1a1a1a;max-width:640px;margin:0 auto;padding:32px">`,
    paragraphs,
    tags,
    `<hr style="margin:32px 0;border:none;border-top:1px solid #eee" />`,
    `<p style="font-size:11px;color:#999;margin:0">Sent via APAC AI · brand-guardrail and trust-layer cleared.</p>`,
    `</body></html>`,
  ].join("\n");
}

/* ----------------------------------------------------------------------------
 * Public dispatcher.
 *
 * Returns ChannelDispatchResult on success, throws on transport failure.
 * The dispatcher's withRetry wrapper catches transient errors.
 * -------------------------------------------------------------------------- */
export interface MailgunDispatchInput extends ChannelDispatchInput {
  /** Override recipients (defaults to ADIPLAN_<TENANT>_EMAIL_TEST_TO). */
  to?: string[];
}

export async function sendViaMailgun(
  input: MailgunDispatchInput
): Promise<ChannelDispatchResult> {
  const config = getMailgunConfig(input.tenantId);
  if (!config) {
    throw new Error(
      `Mailgun not configured for tenant ${input.tenantId} — set ADIPLAN_${tenantTag(input.tenantId)}_EMAIL_{PROVIDER,API_KEY,FROM_DOMAIN}`
    );
  }

  const recipients = input.to ?? config.testRecipients;
  if (!recipients.length) {
    throw new Error(
      `No recipients set. Pass input.to=[...] or set ADIPLAN_${tenantTag(input.tenantId)}_EMAIL_TEST_TO`
    );
  }

  const subject =
    input.subject?.trim() ||
    input.deliverable.split(/[\.|·\-—]/)[0].trim() ||
    "APAC update";
  const html = bodyToHtml(input.body, input.hashtags);
  const text = input.body;

  const form = new URLSearchParams();
  form.set("from", `${config.fromName} <${config.fromAddress}>`);
  for (const to of recipients) form.append("to", to);
  form.set("subject", subject);
  form.set("text", text);
  form.set("html", html);
  // Tracking + tags so we can attribute engagement.
  form.set("o:tracking", "yes");
  form.set("o:tracking-clicks", "yes");
  form.set("o:tracking-opens", "yes");
  form.append("o:tag", `tenant:${input.tenantId}`);
  if (input.species) form.append("o:tag", `species:${input.species}`);
  if (input.region) form.append("o:tag", `region:${input.region}`);
  if (input.manager) form.append("o:tag", `manager:${input.manager}`);

  const auth = `Basic ${Buffer.from(`api:${config.apiKey}`).toString("base64")}`;
  const url = `https://api.mailgun.net/v3/${config.domain}/messages`;

  const start = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: auth,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "<unreadable>");
    throw new Error(
      `Mailgun ${res.status} ${res.statusText} — ${errBody.slice(0, 280)}`
    );
  }
  const json = (await res.json()) as { id?: string; message?: string };
  // Mailgun message id format: <abc...@domain>
  const externalId = (json.id ?? "").replace(/[<>]/g, "") || `mg-${Date.now()}`;

  const preview: EmailPreview = {
    channel: "email",
    fromName: config.fromName,
    fromAddress: config.fromAddress,
    subject,
    preheader: text.slice(0, 120),
    bodyHtmlLikeLines: text
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8),
    audienceLine: `${recipients.length} recipient${recipients.length === 1 ? "" : "s"} via Mailgun · ${config.domain}`,
  };

  return {
    channel: "email",
    externalId,
    publicUrl: `https://app.mailgun.com/app/sending/domains/${config.domain}/logs?id=${encodeURIComponent(externalId)}`,
    audienceCount: recipients.length,
    preview,
    latencyMs: Date.now() - start,
  };
}
