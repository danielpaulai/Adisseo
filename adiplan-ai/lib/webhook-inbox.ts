/**
 * Webhook inbox — Phase 6 of APAC.
 *
 * The /api/webhook/[tenant]/[channel] endpoint receives inbound
 * engagement events from the channel (LinkedIn UGC engagement webhook,
 * WeChat OA reply, WhatsApp delivery report, Mailgun event, editorial
 * portal status update). After HMAC verification, events land here.
 *
 * The /credentials page reads back from this inbox so operators can
 * see what's actually being delivered.
 *
 * In-memory ring buffer; swap for an event store / queue in production.
 */

import type { TenantId, DistributionChannel } from "@/lib/tenant";

export type InboundStatus = "ok" | "rejected" | "stale" | "malformed";

export interface InboundEvent {
  id: string;
  /** ISO timestamp when received. */
  receivedAt: string;
  tenantId: TenantId;
  channel: DistributionChannel;
  /** HMAC verification outcome. */
  status: InboundStatus;
  /** Reason if not "ok". */
  reason?: string;
  /** Original signature header. */
  signatureHeader?: string;
  /** Raw body length (so demo can show "12 KB" without leaking content). */
  bodyBytes: number;
  /** Parsed body (if JSON). */
  body?: unknown;
}

declare global {
  // eslint-disable-next-line no-var
  var __adiplanWebhookInbox: { events: InboundEvent[]; cap: number } | undefined;
}

function ring() {
  if (!globalThis.__adiplanWebhookInbox) {
    globalThis.__adiplanWebhookInbox = { events: [], cap: 100 };
  }
  return globalThis.__adiplanWebhookInbox;
}

export function pushInboundEvent(event: Omit<InboundEvent, "id" | "receivedAt"> & {
  id?: string;
  receivedAt?: string;
}): InboundEvent {
  const r = ring();
  const next: InboundEvent = {
    id:
      event.id ??
      `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    receivedAt: event.receivedAt ?? new Date().toISOString(),
    tenantId: event.tenantId,
    channel: event.channel,
    status: event.status,
    reason: event.reason,
    signatureHeader: event.signatureHeader,
    bodyBytes: event.bodyBytes,
    body: event.body,
  };
  r.events.unshift(next);
  if (r.events.length > r.cap) r.events.length = r.cap;
  return next;
}

export function readInbox(opts?: {
  tenantId?: TenantId;
  channel?: DistributionChannel;
  limit?: number;
}): InboundEvent[] {
  const r = ring();
  let out = r.events;
  if (opts?.tenantId) out = out.filter((e) => e.tenantId === opts.tenantId);
  if (opts?.channel) out = out.filter((e) => e.channel === opts.channel);
  if (opts?.limit) out = out.slice(0, opts.limit);
  return out.slice();
}

export function clearInbox() {
  ring().events.length = 0;
}
