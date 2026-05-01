/**
 * Langfuse-style LLM observability — in-memory trace ring.
 *
 * Every LLM-ish API call (score-prose, research-deep, match-article, etc.)
 * pushes a trace here on the server. The /observability page reads it
 * back via /api/llm-trace.
 *
 * Why bother for a demo? Adisseo's IT/legal team will ask exactly two
 * questions:
 *   1. Which model is being called, with what payload?
 *   2. How fast, and at what cost?
 *
 * This module answers both, deterministically and without external SaaS.
 *
 * In production you'd swap this out for Langfuse / Helicone / Phoenix.
 * The shape is intentionally close to Langfuse spans so the swap is small.
 */

export type TraceKind =
  | "score-prose"
  | "research-deep"
  | "match-article"
  | "render-aqua-leaflet"
  | "render-poultry-pack"
  | "render-ruminants-brochure"
  | "render-swine-short"
  | "compose-frame"
  | "voice-memo-transcribe"
  | "voice-fingerprint-build"
  | "og-card"
  | "distribute"
  | "section-rewrite"
  | "ingest-workshop-photo"
  | "ingest-document"
  | "other";

export type TraceStatus = "success" | "warn" | "error";

export interface TraceSpan {
  id: string;
  kind: TraceKind;
  /** Display label for the row. */
  title: string;
  /** Model id, e.g. "gpt-4o-mini", "deterministic", "satori". */
  model: string;
  /** Whether the call hit a real LLM or a deterministic fallback. */
  determined: boolean;
  /** Milliseconds. */
  latencyMs: number;
  /** Approx tokens in / out (0 if N/A). */
  inputTokens?: number;
  outputTokens?: number;
  /** Estimated USD cost. */
  costUsd?: number;
  /** Status of the call. */
  status: TraceStatus;
  /** Optional summary line. */
  summary?: string;
  /** Optional full payload preview, truncated. */
  payload?: string;
  /** Trust score the call produced, if relevant. */
  trustScore?: number;
  /** ISO timestamp. */
  at: string;
}

interface TraceRing {
  list: TraceSpan[];
  cap: number;
}

declare global {
  var __adiplanTrace: TraceRing | undefined;
}

function getRing(): TraceRing {
  if (!globalThis.__adiplanTrace) {
    globalThis.__adiplanTrace = { list: [], cap: 200 };
  }
  return globalThis.__adiplanTrace;
}

/**
 * Synchronous trace push — call directly from API route handlers.
 */
export function pushTrace(span: Omit<TraceSpan, "id" | "at">): TraceSpan {
  const ring = getRing();
  const full: TraceSpan = {
    ...span,
    id: cryptoRandom(),
    at: new Date().toISOString(),
  };
  ring.list.unshift(full);
  if (ring.list.length > ring.cap) ring.list.length = ring.cap;
  return full;
}

/**
 * Wrap an async function so its latency, status, and outputs are captured.
 *
 * Usage in an API route:
 *
 *   const span = startTrace({ kind: "score-prose", title: req.text.slice(0, 60), model: "deterministic" });
 *   try { ...; span.finish({ trustScore: composite, summary: ... }); }
 *   catch (e) { span.fail(String(e)); throw e; }
 */
export function startTrace(seed: {
  kind: TraceKind;
  title: string;
  model: string;
  determined?: boolean;
  payload?: string;
  inputTokens?: number;
}) {
  const start = Date.now();
  const partial = {
    kind: seed.kind,
    title: seed.title.slice(0, 80),
    model: seed.model,
    determined: seed.determined ?? true,
    payload: seed.payload?.slice(0, 600),
    inputTokens: seed.inputTokens,
  };
  return {
    finish(detail: {
      summary?: string;
      outputTokens?: number;
      costUsd?: number;
      trustScore?: number;
      status?: TraceStatus;
    } = {}): TraceSpan {
      return pushTrace({
        ...partial,
        latencyMs: Date.now() - start,
        outputTokens: detail.outputTokens,
        costUsd: detail.costUsd,
        trustScore: detail.trustScore,
        summary: detail.summary,
        status: detail.status ?? "success",
      });
    },
    fail(reason: string): TraceSpan {
      return pushTrace({
        ...partial,
        latencyMs: Date.now() - start,
        summary: reason.slice(0, 200),
        status: "error",
      });
    },
  };
}

export function readTraces(limit = 100): TraceSpan[] {
  const ring = getRing();
  return ring.list.slice(0, limit);
}

export function clearTraces(): void {
  const ring = getRing();
  ring.list = [];
}

function cryptoRandom(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return "tr-" + Math.random().toString(36).slice(2, 12);
}

/* ----------------------------------------------------------------------------
 * Demo seed — first time the trace ring is read, populate with a believable
 * morning of calls so the observability page is never empty.
 * -------------------------------------------------------------------------- */

let _seeded = false;

export function ensureTraceSeed(): void {
  if (_seeded) return;
  _seeded = true;
  const ring = getRing();
  if (ring.list.length > 0) return;

  const now = Date.now();
  const seeds: Array<Omit<TraceSpan, "id" | "at"> & { offsetMs: number }> = [
    {
      offsetMs: 80 * 60 * 1000,
      kind: "research-deep",
      title: "What is the Indonesia AGP-removal trial outcome?",
      model: "deterministic",
      determined: true,
      latencyMs: 412,
      inputTokens: 320,
      outputTokens: 0,
      costUsd: 0,
      status: "success",
      summary: "6 sub-queries, 4 vault hits, confidence 82",
      trustScore: 82,
    },
    {
      offsetMs: 76 * 60 * 1000,
      kind: "match-article",
      title: "Cargill rolls out APAC eubiotic line",
      model: "claude-3.5-sonnet",
      determined: false,
      latencyMs: 2_180,
      inputTokens: 1340,
      outputTokens: 540,
      costUsd: 0.012,
      status: "success",
      summary: "Matched: Vish (Poultry, ID) → carousel + emailer",
    },
    {
      offsetMs: 72 * 60 * 1000,
      kind: "score-prose",
      title: "Poultry carousel · ID · 5-slide",
      model: "deterministic",
      determined: true,
      latencyMs: 14,
      status: "success",
      summary: "Composite 78/100 — light slop, no claim breach",
      trustScore: 78,
    },
    {
      offsetMs: 65 * 60 * 1000,
      kind: "render-poultry-pack",
      title: "Coordinated emailer + 5-slide carousel",
      model: "deterministic",
      determined: true,
      latencyMs: 2_400,
      status: "success",
      summary: "PDF rendered · 4.2 MB",
      trustScore: 78,
    },
    {
      offsetMs: 58 * 60 * 1000,
      kind: "score-prose",
      title: "Aqua leaflet · VN · 1-page",
      model: "deterministic",
      determined: true,
      latencyMs: 12,
      status: "success",
      summary: "Composite 84/100 — clean",
      trustScore: 84,
    },
    {
      offsetMs: 52 * 60 * 1000,
      kind: "score-prose",
      title: "Swine short · CN · 60s",
      model: "deterministic",
      determined: true,
      latencyMs: 11,
      status: "warn",
      summary: "Composite 64/100 — unanchored, no n=, year",
      trustScore: 64,
    },
    {
      offsetMs: 48 * 60 * 1000,
      kind: "voice-fingerprint-build",
      title: "Build profile · vish",
      model: "deterministic",
      determined: true,
      latencyMs: 8,
      status: "success",
      summary: "8 axes, 4 signature 3-grams",
    },
    {
      offsetMs: 41 * 60 * 1000,
      kind: "compose-frame",
      title: "ID · AGP-free · Integrator nutrition lead",
      model: "claude-3.5-sonnet",
      determined: false,
      latencyMs: 1_690,
      inputTokens: 980,
      outputTokens: 410,
      costUsd: 0.008,
      status: "success",
      summary: "Total Value Solution composed",
    },
    {
      offsetMs: 30 * 60 * 1000,
      kind: "og-card",
      title: "Indonesia AGP-removal poultry card",
      model: "satori",
      determined: true,
      latencyMs: 230,
      status: "success",
      summary: "1200x630 PNG · trust 87 · 4 cites",
      trustScore: 87,
    },
    {
      offsetMs: 22 * 60 * 1000,
      kind: "render-aqua-leaflet",
      title: "Mycotoxin gate · VN · 1-page",
      model: "deterministic",
      determined: true,
      latencyMs: 980,
      status: "success",
      summary: "PDF rendered · 0.9 MB",
      trustScore: 84,
    },
    {
      offsetMs: 14 * 60 * 1000,
      kind: "voice-memo-transcribe",
      title: "60s memo · ricardo · EN",
      model: "whisper-large-v3",
      determined: false,
      latencyMs: 4_120,
      inputTokens: 0,
      outputTokens: 142,
      costUsd: 0.003,
      status: "success",
      summary: "Routed to Aqua studio with prefill",
    },
    {
      offsetMs: 6 * 60 * 1000,
      kind: "score-prose",
      title: "Ruminants brochure · JP · manga 2-pager",
      model: "deterministic",
      determined: true,
      latencyMs: 18,
      status: "success",
      summary: "Composite 81/100 — J-credit anchored",
      trustScore: 81,
    },
    {
      offsetMs: 90 * 1000,
      kind: "research-deep",
      title: "What's the Hokkaido J-credit threshold?",
      model: "deterministic",
      determined: true,
      latencyMs: 380,
      status: "success",
      summary: "5 sub-queries, 3 vault hits, confidence 76",
      trustScore: 76,
    },
  ];

  for (const s of seeds) {
    ring.list.push({
      ...s,
      id: cryptoRandom(),
      at: new Date(now - s.offsetMs).toISOString(),
    });
  }
  // Sort newest-first
  ring.list.sort((a, b) => b.at.localeCompare(a.at));
}
