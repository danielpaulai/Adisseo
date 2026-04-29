import { NextRequest, NextResponse } from "next/server";
import {
  evaluateDistribution,
  type DistributionRequest,
  type DistributionResult,
} from "@/lib/distribution";
import { startTrace } from "@/lib/llm-trace";

export const runtime = "nodejs";

export interface DistributeApiResponse extends DistributionResult {
  /** Server-side timestamp the dispatch was processed. */
  shippedAt: string;
}

/**
 * POST /api/distribute
 *
 * Validates a deliverable can be sent to the requested channel under
 * the active tenant's gating rules, then "ships" it (mock).
 *
 * Returns the evaluation + a server-stamped timestamp. The client is
 * responsible for persisting the dispatch to the store + activity log.
 */
export async function POST(req: NextRequest) {
  let body: DistributionRequest;
  try {
    body = (await req.json()) as DistributionRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.tenantId || !body.channel || !body.deliverable) {
    return NextResponse.json(
      { error: "tenantId, channel, deliverable required" },
      { status: 400 }
    );
  }

  const trace = startTrace({
    kind: "distribute",
    title: `${body.tenantId} → ${body.channel}`,
    model: "deterministic",
    determined: true,
    payload: JSON.stringify({
      tenantId: body.tenantId,
      channel: body.channel,
      deliverable: body.deliverable,
      trustScore: body.trustScore,
      approvalStatus: body.approvalStatus,
      species: body.species,
    }),
    inputTokens: 0,
  });

  const result = evaluateDistribution(body);

  // Simulate distribution latency only when shipping.
  if (result.status === "shipped" && result.mockLatencyMs > 0) {
    await new Promise((res) =>
      setTimeout(res, Math.min(result.mockLatencyMs, 2_500))
    );
  }

  const shippedAt = new Date().toISOString();
  const response: DistributeApiResponse = { ...result, shippedAt };

  trace.finish({
    summary:
      result.status === "shipped"
        ? `Shipped to ${result.channelMeta.label}`
        : `Blocked: ${result.reason ?? "unknown"}`,
    outputTokens: 0,
    status: result.status === "shipped" ? "success" : "warn",
    trustScore: body.trustScore,
  });

  return NextResponse.json(response, {
    status: result.status === "shipped" ? 200 : 422,
  });
}
