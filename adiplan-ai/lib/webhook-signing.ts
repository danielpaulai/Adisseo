/**
 * Webhook signing — Phase 6 of APAC.
 *
 * Production webhooks (from LinkedIn / WeChat / WhatsApp / Mailgun /
 * editorial portals) sign their payloads so we can verify they're
 * actually from the channel. We use the same convention here:
 *
 *   X-APAC-Timestamp: <unix seconds>
 *   X-APAC-Signature: t=<ts>,v1=<hex hmac-sha256>
 *
 * The signed string is `${timestamp}.${rawBody}`, hashed with the
 * tenant's webhook secret. Mirror Stripe's exactly because every
 * downstream Adisseo integrator already understands it.
 *
 * Replay protection: timestamps older than 5 minutes are rejected.
 */

import { createHmac, timingSafeEqual } from "crypto";

const TOLERANCE_SECONDS = 5 * 60;

export interface SignatureHeaders {
  timestamp: string;
  signature: string;
}

/**
 * Compute the X-APAC-Signature header value for a payload.
 * Format: `t=<timestamp>,v1=<hex-hmac-sha256>`
 */
export function signWebhookPayload(
  rawBody: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): SignatureHeaders {
  const signedPayload = `${timestamp}.${rawBody}`;
  const hmac = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return {
    timestamp: String(timestamp),
    signature: `t=${timestamp},v1=${hmac}`,
  };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "missing-header" | "malformed-header" | "stale" | "mismatch" };

/**
 * Verify the X-APAC-Signature header against a raw body + secret.
 *
 *   - Reject if header missing / malformed
 *   - Reject if timestamp is older than 5 minutes (replay)
 *   - Reject if hmac doesn't match (timing-safe compare)
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
  now: number = Math.floor(Date.now() / 1000)
): VerifyResult {
  if (!signatureHeader) return { ok: false, reason: "missing-header" };

  const parts = signatureHeader.split(",").map((p) => p.trim());
  const tStr = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!tStr || !v1) return { ok: false, reason: "malformed-header" };

  const ts = parseInt(tStr, 10);
  if (!Number.isFinite(ts)) return { ok: false, reason: "malformed-header" };

  if (Math.abs(now - ts) > TOLERANCE_SECONDS) {
    return { ok: false, reason: "stale" };
  }

  const expected = createHmac("sha256", secret)
    .update(`${ts}.${rawBody}`)
    .digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(v1, "hex");
  } catch {
    return { ok: false, reason: "malformed-header" };
  }
  if (actual.length !== expected.length) return { ok: false, reason: "mismatch" };
  if (!timingSafeEqual(actual, expected)) return { ok: false, reason: "mismatch" };
  return { ok: true };
}

/**
 * Convenience for the demo — generate a curl command operators can
 * paste to test their tenant's webhook locally.
 */
export function exampleCurl(
  webhookUrl: string,
  rawBody: string,
  secret: string
): string {
  const { signature, timestamp } = signWebhookPayload(rawBody, secret);
  return [
    `curl -X POST '${webhookUrl}' \\`,
    `  -H 'content-type: application/json' \\`,
    `  -H 'x-apac-timestamp: ${timestamp}' \\`,
    `  -H 'x-apac-signature: ${signature}' \\`,
    `  -d '${rawBody.replace(/'/g, "'\\''")}'`,
  ].join("\n");
}
