import { NextRequest, NextResponse } from "next/server";
import { getTenantCredentials } from "@/lib/channel-credentials";
import { TENANTS, type TenantId } from "@/lib/tenant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/credential-status?tenant=<id>
 *
 * Returns the live-vs-mock status for every channel under the given
 * tenant. Used by <LiveModeChip /> in the top-bars.
 */
export async function GET(req: NextRequest) {
  const tenantParam = req.nextUrl.searchParams.get("tenant") ?? "adisseo";
  const tenantId = (TENANTS[tenantParam as TenantId]
    ? tenantParam
    : "adisseo") as TenantId;

  const creds = getTenantCredentials(tenantId);
  return NextResponse.json({
    tenant: tenantId,
    channels: creds.map((c) => ({ channel: c.channel, live: c.ready })),
    liveCount: creds.filter((c) => c.ready).length,
    totalCount: creds.length,
  });
}
