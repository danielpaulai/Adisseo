"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  RefreshCw,
  Telescope,
  Trash2,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import type { TraceSpan, TraceKind } from "@/lib/llm-trace";
import { toast } from "sonner";

const KIND_LABEL: Record<TraceKind, string> = {
  "score-prose": "Trust scoring",
  "research-deep": "Deep research",
  "match-article": "Article analysis",
  "render-aqua-leaflet": "Aqua leaflet",
  "render-poultry-pack": "Poultry pack",
  "render-ruminants-brochure": "Ruminants brochure",
  "render-swine-short": "Swine short",
  "compose-frame": "Strategic frame",
  "voice-memo-transcribe": "Voice memo",
  "voice-fingerprint-build": "Voice profile",
  "og-card": "OG card",
  distribute: "Distribute",
  "section-rewrite": "Section rewrite",
  "ingest-workshop-photo": "Workshop OCR",
  "ingest-document": "Document OCR",
  other: "Other",
};

const KIND_TINT: Record<TraceKind, string> = {
  "score-prose": "bg-emerald-100 text-emerald-800",
  "research-deep": "bg-sky-100 text-sky-800",
  "match-article": "bg-violet-100 text-violet-800",
  "render-aqua-leaflet": "bg-cyan-100 text-cyan-800",
  "render-poultry-pack": "bg-amber-100 text-amber-800",
  "render-ruminants-brochure": "bg-rose-100 text-rose-800",
  "render-swine-short": "bg-teal-100 text-teal-800",
  "compose-frame": "bg-orange-100 text-orange-800",
  "voice-memo-transcribe": "bg-stone-100 text-stone-800",
  "voice-fingerprint-build": "bg-fuchsia-100 text-fuchsia-800",
  "og-card": "bg-blue-100 text-blue-800",
  distribute: "bg-indigo-100 text-indigo-800",
  "section-rewrite": "bg-lime-100 text-lime-800",
  "ingest-workshop-photo": "bg-purple-100 text-purple-800",
  "ingest-document": "bg-yellow-100 text-yellow-800",
  other: "bg-stone-100 text-stone-800",
};

export default function ObservabilityPage() {
  const [traces, setTraces] = useState<TraceSpan[]>([]);
  const [selected, setSelected] = useState<TraceSpan | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterKind, setFilterKind] = useState<TraceKind | "all">("all");
  const [showDeterministicOnly, setShowDeterministicOnly] = useState(false);
  const [showLlmOnly, setShowLlmOnly] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/llm-trace", { cache: "no-store" });
      const data = (await res.json()) as { traces: TraceSpan[] };
      setTraces(data.traces);
      if (data.traces[0] && !selected) setSelected(data.traces[0]);
    } catch {
      toast.error("Could not load traces");
    } finally {
      setLoading(false);
    }
  }

  async function clearAll() {
    if (!confirm("Clear the trace ring?")) return;
    await fetch("/api/llm-trace", { method: "DELETE" });
    setTraces([]);
    setSelected(null);
    toast.success("Traces cleared");
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return traces.filter((t) => {
      if (filterKind !== "all" && t.kind !== filterKind) return false;
      if (showDeterministicOnly && !t.determined) return false;
      if (showLlmOnly && t.determined) return false;
      return true;
    });
  }, [traces, filterKind, showDeterministicOnly, showLlmOnly]);

  const stats = useMemo(() => {
    const total = traces.length;
    const llmCalls = traces.filter((t) => !t.determined).length;
    const deterministic = total - llmCalls;
    const totalCost = traces.reduce((acc, t) => acc + (t.costUsd ?? 0), 0);
    const meanLatency =
      total === 0 ? 0 : Math.round(traces.reduce((acc, t) => acc + t.latencyMs, 0) / total);
    const p95 =
      total === 0
        ? 0
        : (() => {
            const sorted = [...traces].map((t) => t.latencyMs).sort((a, b) => a - b);
            return sorted[Math.floor(sorted.length * 0.95)] ?? 0;
          })();
    const errors = traces.filter((t) => t.status === "error").length;
    const warnings = traces.filter((t) => t.status === "warn").length;
    const trustScores = traces.filter((t) => t.trustScore !== undefined).map((t) => t.trustScore!);
    const meanTrust =
      trustScores.length === 0
        ? null
        : Math.round(trustScores.reduce((a, b) => a + b, 0) / trustScores.length);
    return { total, llmCalls, deterministic, totalCost, meanLatency, p95, errors, warnings, meanTrust };
  }, [traces]);

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="flex items-center gap-1 text-adisseo-muted hover:text-adisseo-crimson">
              <ArrowLeft size={11} /> Home
            </Link>
            <Link href="/voice-fingerprint" className="text-adisseo-muted hover:text-adisseo-crimson">Voice fingerprint</Link>
            <Link href="/og-cards" className="text-adisseo-muted hover:text-adisseo-crimson">OG cards</Link>
            <Link href="/trust-layer" className="text-adisseo-muted hover:text-adisseo-crimson">Trust layer</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <Telescope size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Langfuse-style observability
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              Every model call, in one trace ring
            </h1>
            <p className="text-sm text-adisseo-muted">
              For Adisseo's IT/legal team. Which model is being called, with what
              payload, at what latency, at what cost. Deterministic fallbacks
              are flagged. Swap the in-memory ring for Langfuse / Helicone when
              shipping.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2.5 py-1.5 font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson disabled:opacity-50"
            >
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2.5 py-1.5 font-semibold text-rose-700 hover:border-rose-400"
            >
              <Trash2 size={11} /> Clear
            </button>
          </div>
        </div>

        {/* STATS */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          <Stat label="Total spans" v={stats.total} />
          <Stat label="LLM calls" v={stats.llmCalls} tint="violet" />
          <Stat label="Deterministic" v={stats.deterministic} tint="emerald" />
          <Stat
            label="Cost"
            v={stats.totalCost === 0 ? "$0" : `$${stats.totalCost.toFixed(3)}`}
          />
          <Stat label="Mean latency" v={`${stats.meanLatency} ms`} />
          <Stat label="p95 latency" v={`${stats.p95} ms`} />
          <Stat
            label="Errors"
            v={stats.errors}
            tint={stats.errors === 0 ? "emerald" : "rose"}
          />
          <Stat
            label="Mean trust"
            v={stats.meanTrust ?? "—"}
            tint={stats.meanTrust && stats.meanTrust >= 75 ? "emerald" : "amber"}
          />
        </section>

        {/* FILTERS */}
        <section className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-adisseo-line bg-white p-3 text-xs">
          <span className="font-semibold uppercase tracking-widest text-adisseo-crimson">Filter</span>
          <select
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value as TraceKind | "all")}
            className="rounded-md border border-adisseo-line bg-adisseo-bg/40 px-2 py-1"
          >
            <option value="all">All kinds</option>
            {Object.entries(KIND_LABEL).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showLlmOnly}
              onChange={(e) => {
                setShowLlmOnly(e.target.checked);
                if (e.target.checked) setShowDeterministicOnly(false);
              }}
            />
            LLM only
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showDeterministicOnly}
              onChange={(e) => {
                setShowDeterministicOnly(e.target.checked);
                if (e.target.checked) setShowLlmOnly(false);
              }}
            />
            Deterministic only
          </label>
          <span className="ml-auto text-adisseo-muted">{filtered.length} of {traces.length} shown</span>
        </section>

        {/* MAIN GRID */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LIST */}
          <ul className="space-y-2 lg:col-span-7">
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setSelected(t)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                    selected?.id === t.id
                      ? "border-adisseo-crimson bg-white"
                      : "border-adisseo-line bg-white hover:border-adisseo-crimson"
                  }`}
                >
                  <span className={`mt-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${KIND_TINT[t.kind] ?? "bg-stone-100"}`}>
                    {KIND_LABEL[t.kind] ?? t.kind}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-adisseo-ink-strong">
                      {t.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-adisseo-muted">
                      {t.summary ?? KIND_LABEL[t.kind]}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-adisseo-muted">
                      <span className="font-mono">{t.model}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                          t.determined
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-violet-100 text-violet-700"
                        }`}
                      >
                        {t.determined ? "deterministic" : "LLM"}
                      </span>
                      <span className="font-mono">{t.latencyMs}ms</span>
                      {t.costUsd !== undefined && t.costUsd > 0 && (
                        <span className="font-mono">${t.costUsd.toFixed(3)}</span>
                      )}
                      {t.trustScore !== undefined && (
                        <span className="font-mono">trust {t.trustScore}</span>
                      )}
                      <StatusIcon status={t.status} />
                      <span className="ml-auto">{relTime(t.at)}</span>
                    </div>
                  </div>
                  <ChevronRight size={11} className="mt-1 text-adisseo-muted" />
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-2xl border border-dashed border-adisseo-line bg-white p-6 text-center text-xs text-adisseo-muted">
                No traces match the filter.
              </li>
            )}
          </ul>

          {/* DETAIL */}
          <aside className="lg:col-span-5 lg:sticky lg:top-6 lg:h-fit">
            {selected ? (
              <div className="rounded-2xl border border-adisseo-line bg-white p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                    Span detail
                  </p>
                  <span className="text-[10px] text-adisseo-muted">{relTime(selected.at)}</span>
                </div>
                <h2 className="mt-1 text-lg font-bold text-adisseo-ink-strong">{selected.title}</h2>
                <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${KIND_TINT[selected.kind] ?? "bg-stone-100"}`}>
                  {KIND_LABEL[selected.kind] ?? selected.kind}
                </span>

                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <Row label="Model" v={selected.model} mono />
                  <Row label="Mode" v={selected.determined ? "deterministic" : "LLM"} />
                  <Row label="Latency" v={`${selected.latencyMs} ms`} mono />
                  {selected.costUsd !== undefined && (
                    <Row label="Cost" v={`$${selected.costUsd.toFixed(4)}`} mono />
                  )}
                  {selected.inputTokens !== undefined && (
                    <Row label="Input tokens" v={String(selected.inputTokens)} mono />
                  )}
                  {selected.outputTokens !== undefined && (
                    <Row label="Output tokens" v={String(selected.outputTokens)} mono />
                  )}
                  {selected.trustScore !== undefined && (
                    <Row label="Trust" v={String(selected.trustScore)} mono />
                  )}
                  <Row label="Status" v={selected.status} />
                </dl>

                {selected.summary && (
                  <p className="mt-3 rounded-md bg-adisseo-bg p-3 text-xs text-adisseo-ink-strong">
                    {selected.summary}
                  </p>
                )}
                {selected.payload && (
                  <div className="mt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                      Payload preview
                    </p>
                    <pre className="mt-1 max-h-48 overflow-auto rounded-md bg-stone-900 p-3 font-mono text-[10px] text-emerald-100">
                      {selected.payload}
                    </pre>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-1 text-[10px] text-adisseo-muted">
                  <CircleDot size={10} className="text-emerald-600" /> Span ID:
                  <span className="font-mono">{selected.id.slice(0, 14)}…</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-adisseo-line bg-white p-6 text-center text-xs text-adisseo-muted">
                <Activity size={20} className="mx-auto mb-2 text-adisseo-muted" />
                Pick a span to drill down.
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, v, tint }: { label: string; v: string | number; tint?: "violet" | "emerald" | "rose" | "amber" }) {
  const tintCls =
    tint === "violet"
      ? "text-violet-700"
      : tint === "emerald"
        ? "text-emerald-700"
        : tint === "rose"
          ? "text-rose-700"
          : tint === "amber"
            ? "text-amber-700"
            : "text-adisseo-ink-strong";
  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-3">
      <p className="text-[9px] uppercase tracking-widest text-adisseo-muted">{label}</p>
      <p className={`mt-1 font-mono text-xl font-bold ${tintCls}`}>{v}</p>
    </div>
  );
}

function Row({ label, v, mono = false }: { label: string; v: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-[10px] uppercase tracking-widest text-adisseo-muted">{label}</dt>
      <dd className={mono ? "font-mono text-xs" : "text-xs"}>{v}</dd>
    </>
  );
}

function StatusIcon({ status }: { status: TraceSpan["status"] }) {
  if (status === "success") return <CheckCircle2 size={10} className="text-emerald-600" />;
  if (status === "warn") return <AlertTriangle size={10} className="text-amber-600" />;
  return <Zap size={10} className="text-rose-600" />;
}

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}
