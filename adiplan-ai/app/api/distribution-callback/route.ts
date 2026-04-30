import { NextRequest, NextResponse } from "next/server";
import { startTrace } from "@/lib/llm-trace";
import type { DistributionChannel } from "@/lib/tenant";

export const runtime = "nodejs";

/**
 * POST /api/distribution-callback
 *
 * Phase 5 — simulates a delivery webhook from the channel returning
 * post-ship engagement metrics. In production this is exactly the shape
 * a LinkedIn / WeChat / WhatsApp / Mailgun / editorial portal would
 * fire back at us; here it's deterministic so the demo always lands the
 * same way.
 *
 * Inputs:
 *   externalId        — channel-side dispatch id (returned from /api/distribute)
 *   channel           — channel id
 *   audienceCount     — reach the channel reported
 *   trustScore        — trust composite at ship time (drives the conversion floor)
 *   citationCount     — citation depth (boosts qualified-rate)
 *   hoursSinceShip    — let caller pick "1 hour later" vs "24 hours later"
 *
 * Returns the engagement deltas + a synthetic message.
 */

interface CallbackRequest {
  externalId?: string;
  channel: DistributionChannel;
  audienceCount?: number;
  trustScore?: number;
  citationCount?: number;
  hoursSinceShip?: number;
}

interface CallbackResponse {
  externalId: string;
  channel: DistributionChannel;
  impressions: number;
  qualifiedViews: number;
  conversations: number;
  conversions: number;
  /** Floor 0–1 that drives qualified rate (channel-specific). */
  qualifiedRate: number;
  /** Floor 0–1 that drives conversion rate (trust-driven). */
  conversionRate: number;
  /** Synthetic narrative — used as the toast description. */
  summary: string;
  updatedAt: string;
}

/* ----------------------------------------------------------------------------
 * Deterministic engagement model.
 *
 * impressions   = audienceCount * channelReachFactor * (0.4 + 0.6 * curve(t))
 * qualifiedRate = baseQualified[channel] * (0.7 + 0.005 * citationCount * 6)
 * conversions   = qualifiedViews * (0.10 + 0.30 * trustFactor)
 *
 * Where:
 *   trustFactor = clamp((trust - 60) / 40, 0, 1)
 *   curve(t)    = 1 - 1 / (1 + t / 6)   — saturating to 1 by ~24 hrs
 * -------------------------------------------------------------------------- */

const REACH_FACTOR: Record<DistributionChannel, number> = {
  linkedin: 0.62,   // 62% of subscribers see a sponsored post
  wechat: 0.45,
  whatsapp: 0.92,   // very high, opt-in distribution list
  email: 0.41,      // typical open rate
  "trade-mag": 0.0, // no impressions until publication; conversations only
};

const BASE_QUALIFIED: Record<DistributionChannel, number> = {
  linkedin: 0.06,
  wechat: 0.05,
  whatsapp: 0.18,
  email: 0.09,
  "trade-mag": 0.40,
};

function curve(hours: number): number {
  if (hours <= 0) return 0;
  return 1 - 1 / (1 + hours / 6);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function modelEngagement(req: CallbackRequest) {
  const t = req.hoursSinceShip ?? 24;
  const audience = req.audienceCount ?? (
    req.channel === "linkedin" ? 18_000 :
    req.channel === "wechat" ? 12_400 :
    req.channel === "whatsapp" ? 540 :
    req.channel === "email" ? 6_200 :
    240
  );
  const citations = req.citationCount ?? 1;
  const trust = req.trustScore ?? 75;
  const trustFactor = clamp((trust - 60) / 40, 0, 1);

  const reach = REACH_FACTOR[req.channel];
  const impressions =
    req.channel === "trade-mag"
      ? Math.round(audience * (0.6 + 0.4 * curve(t * 0.4)))
      : Math.round(audience * reach * (0.4 + 0.6 * curve(t)));

  const baseQ = BASE_QUALIFIED[req.channel];
  const qualifiedRate = clamp(baseQ * (0.7 + 0.05 * citations), 0.02, 0.6);
  const qualifiedViews = Math.round(impressions * qualifiedRate);

  const conversionRate = 0.1 + 0.3 * trustFactor;
  const conversations = Math.round(qualifiedViews * (conversionRate * 1.4));
  const conversions = Math.round(qualifiedViews * conversionRate);

  return {
    impressions,
    qualifiedViews,
    conversations,
    conversions,
    qualifiedRate,
    conversionRate,
  };
}

export async function POST(req: NextRequest) {
  let body: CallbackRequest;
  try {
    body = (await req.json()) as CallbackRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.channel) {
    return NextResponse.json({ error: "channel required" }, { status: 400 });
  }

  const trace = startTrace({
    kind: "distribute",
    title: `callback ${body.channel}`,
    model: "deterministic",
    determined: true,
    payload: JSON.stringify(body),
  });

  const m = modelEngagement(body);
  const externalId = body.externalId ?? `ext-${Date.now().toString(36)}`;

  const summary =
    `${m.impressions.toLocaleString()} impressions \u2192 ${m.qualifiedViews} qualified ` +
    `\u2192 ${m.conversations} conversations \u2192 ${m.conversions} conversions ` +
    `(trust ${body.trustScore ?? "?"}, citations ${body.citationCount ?? "?"})`;

  const response: CallbackResponse = {
    externalId,
    channel: body.channel,
    impressions: m.impressions,
    qualifiedViews: m.qualifiedViews,
    conversations: m.conversations,
    conversions: m.conversions,
    qualifiedRate: m.qualifiedRate,
    conversionRate: m.conversionRate,
    summary,
    updatedAt: new Date().toISOString(),
  };

  trace.finish({
    summary,
    status: "success",
    trustScore: body.trustScore,
  });

  return NextResponse.json(response, { status: 200 });
}
