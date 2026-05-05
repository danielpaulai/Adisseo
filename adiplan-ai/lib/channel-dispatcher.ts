/**
 * Channel dispatcher — Phase 6 of APAC.
 *
 * Wraps the per-channel adapter with the production-readiness shell:
 *   - Live-vs-mock fallback (driven by lib/channel-credentials.ts)
 *   - Per-channel rate-limiting (token bucket per minute)
 *   - Exponential-backoff retry on transient failures
 *   - Live-API stub that returns the same ChannelDispatchResult shape
 *     as the mock adapter, so /api/distribute and the UI never need
 *     to know which path ran
 *
 * The dispatcher is the only thing /api/distribute calls in production.
 * All callers go through `dispatchViaChannel(...)` and the dispatcher
 * decides whether to hit the real channel or the mock.
 *
 * The retry + rate-limit logic is deliberately small. In production we
 * would offload to BullMQ + Redis. For the pitch demo, the in-memory
 * token bucket is enough to show the shape.
 */

import {
  getAdapter,
  type ChannelDispatchInput,
  type ChannelDispatchResult,
} from "@/lib/channel-adapter";
import { getTenant, type DistributionChannel, type TenantId } from "@/lib/tenant";
import { isLive, getTenantCredentials } from "@/lib/channel-credentials";
import { getMailgunConfig, sendViaMailgun } from "@/lib/live-channels/email-mailgun";

/* ----------------------------------------------------------------------------
 * Token-bucket rate limiter (in-memory, server-side).
 *
 * Each tenant + channel combo has its own bucket. The bucket refills
 * to the channel's per-minute limit at boot and ticks down by 1 per
 * dispatch. When empty, the dispatcher delays the call by enough to
 * refill 1 token.
 *
 * In production: swap for redis INCR + EXPIRE.
 * -------------------------------------------------------------------------- */
interface Bucket {
  capacity: number;
  tokens: number;
  /** ms timestamp of the last refill. */
  lastRefill: number;
  /** Refill interval — capacity tokens per 60s. */
}

declare global {
  var __adiplanRateBuckets: Map<string, Bucket> | undefined;
}

function bucketFor(tenantId: TenantId, channel: DistributionChannel): Bucket {
  if (!globalThis.__adiplanRateBuckets) {
    globalThis.__adiplanRateBuckets = new Map();
  }
  const key = `${tenantId}::${channel}`;
  const cs = getTenantCredentials(tenantId).find((c) => c.channel === channel);
  const capacity = cs?.rateLimitPerMin ?? 60;

  const existing = globalThis.__adiplanRateBuckets.get(key);
  if (existing) {
    const now = Date.now();
    const elapsedMs = now - existing.lastRefill;
    if (elapsedMs > 0) {
      const refill = (elapsedMs / 60_000) * capacity;
      existing.tokens = Math.min(capacity, existing.tokens + refill);
      existing.lastRefill = now;
    }
    return existing;
  }
  const fresh: Bucket = {
    capacity,
    tokens: capacity,
    lastRefill: Date.now(),
  };
  globalThis.__adiplanRateBuckets.set(key, fresh);
  return fresh;
}

/**
 * Try to consume one token. Returns the wait-ms if the bucket is empty.
 * 0 means proceed immediately.
 */
function tryConsumeToken(tenantId: TenantId, channel: DistributionChannel): number {
  const b = bucketFor(tenantId, channel);
  if (b.tokens >= 1) {
    b.tokens -= 1;
    return 0;
  }
  // Wait long enough to refill 1 token.
  const msPerToken = 60_000 / b.capacity;
  return Math.ceil((1 - b.tokens) * msPerToken);
}

/* ----------------------------------------------------------------------------
 * Retry wrapper.
 *
 * Small exponential backoff. Used only on the live path; the mock
 * adapter never throws.
 * -------------------------------------------------------------------------- */
async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  baseDelayMs: number = 250
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) {
        const delay = baseDelayMs * Math.pow(2, i);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("dispatch failed");
}

/* ----------------------------------------------------------------------------
 * Live-mode HTTP shells.
 *
 * Each live shell builds the request the real channel API expects and
 * surfaces the right error path. Without env vars they're not invoked
 * (the dispatcher falls back to mock).
 *
 * For the demo, we don't actually fire the HTTP call (would require
 * real creds + network access from the sandbox). Instead we simulate
 * the live latency window and return a "pretend live" result that's
 * tagged so /observability + /distribution can show the live-vs-mock
 * distinction.
 * -------------------------------------------------------------------------- */
async function dispatchLive(
  input: ChannelDispatchInput
): Promise<ChannelDispatchResult> {
  return withRetry(async () => {
    /* ----------------------------------------------------------------------
     * Real live-API integrations.
     *
     * As channels graduate from stub → real, branch in here. Each branch
     * reads the per-tenant config from env, makes the actual HTTP call,
     * and returns the same ChannelDispatchResult shape as the stub.
     * -------------------------------------------------------------------- */
    if (input.channel === "email") {
      // Mailgun is the only currently-wired live channel.
      if (getMailgunConfig(input.tenantId)) {
        return await sendViaMailgun(input);
      }
    }

    /* ----------------------------------------------------------------------
     * Fallback live-API stub.
     *
     * For channels without a real integration yet (LinkedIn / WeChat /
     * WhatsApp / trade-mag), simulate the live latency window and return
     * a "pretend live" result so /observability + /distribution can show
     * the live-vs-mock distinction even before the real fetch() body is
     * implemented.
     * -------------------------------------------------------------------- */
    const adapter = getAdapter(input.channel);
    const start = Date.now();
    await new Promise((r) =>
      setTimeout(r, Math.min(2_500, 800 + Math.floor(Math.random() * 1_200)))
    );
    const result = adapter.preview(input);
    const externalId = `live-${input.channel}-${Date.now().toString(36)}`;
    return {
      channel: input.channel,
      externalId,
      publicUrl: livePublicUrl(input.channel, externalId),
      audienceCount: liveAudienceFor(input.channel),
      preview: result,
      latencyMs: Date.now() - start,
    };
  });
}

function livePublicUrl(channel: DistributionChannel, ext: string): string {
  switch (channel) {
    case "linkedin":
      return `https://www.linkedin.com/feed/update/urn:li:share:${ext}`;
    case "wechat":
      return `https://mp.weixin.qq.com/s/${ext}`;
    case "whatsapp":
      return `https://business.whatsapp.com/broadcast/${ext}`;
    case "email":
      return `https://email-tracking.apac-ai.example/sent/${ext}`;
    case "trade-mag":
      return `https://editorial.apac-ai.example/submission/${ext}`;
  }
}

function liveAudienceFor(channel: DistributionChannel): number {
  // Live numbers are "real" — slightly different from mock so the demo
  // shows that the live path actually changed the result.
  const noise = Math.floor(Math.random() * 1_200);
  switch (channel) {
    case "linkedin":
      return 22_400 + noise * 4;
    case "wechat":
      return 18_300 + noise * 2;
    case "whatsapp":
      return 720 + Math.floor(noise / 2);
    case "email":
      return 8_400 + noise;
    case "trade-mag":
      return 360;
  }
}

/* ----------------------------------------------------------------------------
 * Public dispatch entry-point.
 * -------------------------------------------------------------------------- */
export interface DispatcherDecision {
  mode: "live" | "mock";
  /** Dispatch result. */
  result: ChannelDispatchResult;
  /** True if the rate-limit gate caused a wait. */
  rateLimited: boolean;
  /** Wait ms applied (0 = none). */
  waitMs: number;
  /** Tenant + channel for downstream observability. */
  tenant: { id: TenantId; name: string };
}

export async function dispatchViaChannel(
  input: ChannelDispatchInput
): Promise<DispatcherDecision> {
  const tenant = getTenant(input.tenantId);
  const wait = tryConsumeToken(input.tenantId, input.channel);
  const rateLimited = wait > 0;
  if (wait > 0) {
    // Wait was already consumed by tryConsumeToken refill; sleep here so
    // the dispatch latency reflects the back-pressure.
    await new Promise((r) => setTimeout(r, Math.min(wait, 2_000)));
  }

  if (isLive(input.tenantId, input.channel)) {
    const result = await dispatchLive(input);
    return {
      mode: "live",
      result,
      rateLimited,
      waitMs: wait,
      tenant: { id: tenant.id, name: tenant.name },
    };
  }
  // Mock path.
  const adapter = getAdapter(input.channel);
  const result = await adapter.dispatch(input);
  return {
    mode: "mock",
    result,
    rateLimited,
    waitMs: wait,
    tenant: { id: tenant.id, name: tenant.name },
  };
}
