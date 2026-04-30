import { NextRequest, NextResponse } from "next/server";
import {
  evaluateDistribution,
  type DistributionRequest,
  type DistributionResult,
} from "@/lib/distribution";
import {
  buildPreview,
  getAdapter,
  type ChannelDispatchResult,
  type ChannelPreview,
} from "@/lib/channel-adapter";
import { startTrace } from "@/lib/llm-trace";

export const runtime = "nodejs";

export interface DistributeApiRequest extends DistributionRequest {
  /** Body / caption text used by the channel adapter to build a preview. */
  body?: string;
  /** Subject line for email + trade-mag. */
  subject?: string;
  hashtags?: string[];
  region?: string;
  manager?: string;
  citationCount?: number;
  /** If true, skip the dispatch and return only the preview. */
  previewOnly?: boolean;
}

export interface DistributeApiResponse extends DistributionResult {
  /** Server-side timestamp the dispatch was processed. */
  shippedAt: string;
  /* Phase 5 — channel-native dispatch enrichments. */
  preview?: ChannelPreview;
  publicUrl?: string;
  externalId?: string;
  audienceCount?: number;
}

/**
 * POST /api/distribute
 *
 * Phase 4 — gates a dispatch under the active tenant's rules.
 * Phase 5 — on success, dispatches via the per-channel adapter, returning
 * the channel-native preview, public URL, audience reach, and external id.
 *
 * If `previewOnly: true` is set, returns only the preview (no gate, no
 * dispatch, no trace span). The /distribution UI uses this for live
 * previews before the user hits "Ship".
 */
export async function POST(req: NextRequest) {
  let body: DistributeApiRequest;
  try {
    body = (await req.json()) as DistributeApiRequest;
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

  // Preview-only fast path.
  if (body.previewOnly) {
    const preview = buildPreview({
      tenantId: body.tenantId,
      channel: body.channel,
      deliverable: body.deliverable,
      body: body.body ?? body.deliverable,
      subject: body.subject,
      hashtags: body.hashtags,
      region: body.region,
      species: body.species,
      manager: body.manager,
      trustScore: body.trustScore,
      citationCount: body.citationCount,
    });
    return NextResponse.json({ previewOnly: true, preview }, { status: 200 });
  }

  const trace = startTrace({
    kind: "distribute",
    title: `${body.tenantId} \u2192 ${body.channel}`,
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

  let dispatch: ChannelDispatchResult | null = null;
  if (result.status === "shipped") {
    const adapter = getAdapter(body.channel);
    dispatch = await adapter.dispatch({
      tenantId: body.tenantId,
      channel: body.channel,
      deliverable: body.deliverable,
      body: body.body ?? body.deliverable,
      subject: body.subject,
      hashtags: body.hashtags,
      region: body.region,
      species: body.species,
      manager: body.manager,
      trustScore: body.trustScore,
      citationCount: body.citationCount,
    });
  }

  const shippedAt = new Date().toISOString();
  const response: DistributeApiResponse = {
    ...result,
    shippedAt,
    preview: dispatch?.preview,
    publicUrl: dispatch?.publicUrl,
    externalId: dispatch?.externalId,
    audienceCount: dispatch?.audienceCount,
  };

  trace.finish({
    summary:
      result.status === "shipped"
        ? `Shipped to ${result.channelMeta.label} \u2014 reach ${
            dispatch?.audienceCount ?? "?"
          }`
        : `Blocked: ${result.reason ?? "unknown"}`,
    outputTokens: 0,
    status: result.status === "shipped" ? "success" : "warn",
    trustScore: body.trustScore,
  });

  return NextResponse.json(response, {
    status: result.status === "shipped" ? 200 : 422,
  });
}
