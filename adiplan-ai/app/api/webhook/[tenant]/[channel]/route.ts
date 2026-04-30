import { NextRequest, NextResponse } from "next/server";
import { TENANTS, type TenantId, type DistributionChannel } from "@/lib/tenant";
import {
  getWebhookSecret,
  isLive,
} from "@/lib/channel-credentials";
import { verifyWebhookSignature } from "@/lib/webhook-signing";
import { pushInboundEvent, readInbox } from "@/lib/webhook-inbox";
import { startTrace } from "@/lib/llm-trace";

export const runtime = "nodejs";

const VALID_CHANNELS: DistributionChannel[] = [
  "linkedin",
  "wechat",
  "whatsapp",
  "email",
  "trade-mag",
];

interface RouteCtx {
  params: Promise<{ tenant: string; channel: string }>;
}

/* ============================================================================
 * GET /api/webhook/[tenant]/[channel]
 *
 * Operator + verification endpoint. Returns:
 *   - the canonical webhook URL the channel should POST to
 *   - the live-mode flag for this tenant + channel
 *   - the most recent inbound events for this scope
 *
 * In production this would gate on session auth; for the demo it's open.
 * ========================================================================== */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { tenant, channel } = await ctx.params;
  const tenantId = tenant as TenantId;
  const ch = channel as DistributionChannel;
  if (!TENANTS[tenantId] || !VALID_CHANNELS.includes(ch)) {
    return NextResponse.json(
      { error: "Unknown tenant or channel" },
      { status: 404 }
    );
  }
  const events = readInbox({ tenantId, channel: ch, limit: 20 });
  const url = `${req.nextUrl.origin}/api/webhook/${tenantId}/${channel}`;
  return NextResponse.json({
    url,
    tenant: TENANTS[tenantId].name,
    channel: ch,
    live: isLive(tenantId, ch),
    events,
  });
}

/* ============================================================================
 * POST /api/webhook/[tenant]/[channel]
 *
 * The actual inbound webhook. Steps:
 *   1. Resolve tenant + channel from path
 *   2. Read raw body
 *   3. Verify HMAC signature against tenant's webhook secret
 *   4. On success, append the parsed body to the inbox
 *   5. Push an observability span either way
 *
 * Returns 202 on success; 400/401/404/422 with a structured error
 * otherwise. The shape lines up with how Stripe / Mailgun / LinkedIn
 * already document their webhook return codes.
 * ========================================================================== */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { tenant, channel } = await ctx.params;
  const tenantId = tenant as TenantId;
  const ch = channel as DistributionChannel;
  if (!TENANTS[tenantId] || !VALID_CHANNELS.includes(ch)) {
    return NextResponse.json(
      { error: "Unknown tenant or channel" },
      { status: 404 }
    );
  }

  const rawBody = await req.text();
  const signatureHeader = req.headers.get("x-adiplan-signature");
  const trace = startTrace({
    kind: "distribute",
    title: `webhook ${tenantId}/${ch}`,
    model: "deterministic",
    determined: true,
    payload: rawBody.slice(0, 600),
  });

  const verify = verifyWebhookSignature(
    rawBody,
    signatureHeader,
    getWebhookSecret(tenantId)
  );

  if (!verify.ok) {
    pushInboundEvent({
      tenantId,
      channel: ch,
      status: verify.reason === "stale" ? "stale" :
        verify.reason === "missing-header" || verify.reason === "malformed-header"
          ? "malformed"
          : "rejected",
      reason: verify.reason,
      signatureHeader: signatureHeader ?? undefined,
      bodyBytes: rawBody.length,
    });
    trace.finish({
      summary: `Webhook rejected: ${verify.reason}`,
      status: "warn",
    });
    return NextResponse.json(
      {
        ok: false,
        reason: verify.reason,
        hint:
          verify.reason === "missing-header"
            ? "Missing x-adiplan-signature header"
            : verify.reason === "stale"
              ? "Timestamp older than 5 minutes (replay protection)"
              : verify.reason === "malformed-header"
                ? "Header could not be parsed"
                : "HMAC mismatch — wrong secret or tampered body",
      },
      { status: verify.reason === "missing-header" ? 401 : 422 }
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody || "null");
  } catch {
    parsed = { raw: rawBody.slice(0, 200) };
  }

  const event = pushInboundEvent({
    tenantId,
    channel: ch,
    status: "ok",
    signatureHeader: signatureHeader ?? undefined,
    bodyBytes: rawBody.length,
    body: parsed,
  });

  trace.finish({
    summary: `Webhook accepted: ${rawBody.length} bytes`,
    status: "success",
  });

  return NextResponse.json({ ok: true, eventId: event.id }, { status: 202 });
}
