import { NextRequest, NextResponse } from "next/server";
import { TENANTS, type TenantId } from "@/lib/tenant";
import { getMailgunConfig, sendViaMailgun } from "@/lib/live-channels/email-mailgun";
import { startTrace } from "@/lib/llm-trace";

export const runtime = "nodejs";

interface TestSendRequest {
  tenantId: TenantId;
  /** Optional override (defaults to ADIPLAN_<T>_EMAIL_TEST_TO). */
  to?: string[];
  /** Optional override subject + body. */
  subject?: string;
  body?: string;
}

/**
 * POST /api/email-test-send
 *
 * The /credentials page calls this to exercise the live Mailgun path
 * without going through the full distribution gate. Useful for
 * confirming a tenant's env vars produce a real send before the demo.
 *
 * Returns:
 *   200 { ok: true, externalId, audienceCount, latencyMs, publicUrl }
 *   404 { ok: false, reason } — Mailgun not configured
 *   422 { ok: false, reason } — Mailgun rejected (bad domain, key, etc.)
 */
export async function POST(req: NextRequest) {
  let body: TestSendRequest;
  try {
    body = (await req.json()) as TestSendRequest;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.tenantId || !TENANTS[body.tenantId]) {
    return NextResponse.json(
      { ok: false, reason: "Unknown tenantId" },
      { status: 400 }
    );
  }

  if (!getMailgunConfig(body.tenantId)) {
    return NextResponse.json(
      {
        ok: false,
        reason: `Mailgun is not configured for ${body.tenantId}. Set ADIPLAN_${body.tenantId
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "")}_EMAIL_{PROVIDER=mailgun,API_KEY,FROM_DOMAIN}.`,
      },
      { status: 404 }
    );
  }

  const trace = startTrace({
    kind: "distribute",
    title: `mailgun test-send · ${body.tenantId}`,
    model: "mailgun",
    determined: true,
  });

  try {
    const result = await sendViaMailgun({
      tenantId: body.tenantId,
      channel: "email",
      deliverable: "AdiPlan · live-channel test send",
      body:
        body.body ??
        "This is an AdiPlan live-channel test message.\n\nIt confirms your Mailgun credentials are wired correctly: API key, from-domain, and DKIM/SPF.\n\nIf you're seeing this in your inbox, the live email rail is ready for the May 7 demo.",
      subject: body.subject ?? "AdiPlan · live-channel test send",
      hashtags: ["#AdiPlan", "#LiveChannel"],
      manager: "AdiPlan",
      to: body.to && body.to.length ? body.to : undefined,
    });
    trace.finish({
      summary: `Mailgun delivered → ${result.audienceCount} recipients (${result.latencyMs}ms)`,
      status: "success",
    });
    return NextResponse.json(
      {
        ok: true,
        externalId: result.externalId,
        audienceCount: result.audienceCount,
        latencyMs: result.latencyMs,
        publicUrl: result.publicUrl,
      },
      { status: 200 }
    );
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    trace.finish({ summary: `Mailgun rejected: ${reason}`, status: "warn" });
    return NextResponse.json({ ok: false, reason }, { status: 422 });
  }
}
