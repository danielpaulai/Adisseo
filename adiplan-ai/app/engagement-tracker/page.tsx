"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  ExternalLink,
  Quote,
  FileText,
  Mail,
  BookOpen,
  Clapperboard,
  Mic,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { WorkflowRibbon } from "@/components/workspace/WorkflowRibbon";
import {
  aggregateFunnel,
  groupBySpecies,
  groupByKind,
  gradeAgainstBenchmark,
  meanTrustScore,
  MALAYSIA_BENCHMARK,
  pct,
  seededDeliverables,
  type DeliverableInstance,
  type DeliverableKind,
  type SpeciesKey,
} from "@/lib/engagement";
import {
  CHANNEL_METRICS,
  SEED_BREAKDOWNS,
  headlineFor,
  primaryChannelForKind,
} from "@/lib/engagement-metrics";
import {
  ALL_WORKSHOP_METRICS,
  workshopMetricsByBucket,
  WORKSHOP_BUCKET_LABEL,
  WORKSHOP_BUCKET_BLURB,
  type WorkshopMetric,
  type WorkshopMetricStatus,
} from "@/lib/workshop-metrics";
import { useAdiPlanStore } from "@/lib/store";

const KIND_LABEL: Record<DeliverableKind, string> = {
  leaflet: "Aqua leaflet",
  email: "Poultry email",
  carousel: "LinkedIn carousel",
  manga: "Ruminants manga",
  short: "Swine short",
  "voice-memo": "Voice memo",
  frame: "Strategic frame",
};

const KIND_ICON: Record<DeliverableKind, React.ComponentType<{ size?: number }>> = {
  leaflet: FileText,
  email: Mail,
  carousel: Mail,
  manga: BookOpen,
  short: Clapperboard,
  "voice-memo": Mic,
  frame: Target,
};

const SPECIES_LABEL: Record<SpeciesKey, string> = {
  aqua: "Aqua",
  poultry: "Poultry",
  ruminants: "Ruminants",
  swine: "Swine",
  cross: "Cross-species",
};

type SortKey = "conversionRate" | "qualifiedRate" | "views" | "sentAt";

export default function EngagementTrackerPage() {
  const [filterSpecies, setFilterSpecies] = useState<SpeciesKey | "all">("all");
  const [filterKind, setFilterKind] = useState<DeliverableKind | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("conversionRate");
  /** TFIP plan Phase F — workshop-framework tab toggle. */
  const [legendTab, setLegendTab] = useState<"per-channel" | "workshop">(
    "per-channel",
  );

  /* Phase 5 — merge live deliverables (auto-created on ship) with the
   * historical seed dataset so the tracker reflects what just happened. */
  const liveDeliverables = useAdiPlanStore((s) => s.liveDeliverables);
  const allDeliverables: DeliverableInstance[] = useMemo(
    () => [...liveDeliverables, ...seededDeliverables],
    [liveDeliverables]
  );

  const filtered = useMemo(() => {
    let items: DeliverableInstance[] = allDeliverables;
    if (filterSpecies !== "all")
      items = items.filter((d) => d.species === filterSpecies);
    if (filterKind !== "all") items = items.filter((d) => d.kind === filterKind);
    return [...items].sort((a, b) => {
      if (sortKey === "sentAt")
        return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
      if (sortKey === "views") return b.views - a.views;
      const aRate =
        sortKey === "qualifiedRate"
          ? a.qualifiedViews / Math.max(a.views, 1)
          : a.conversions / Math.max(a.qualifiedViews, 1);
      const bRate =
        sortKey === "qualifiedRate"
          ? b.qualifiedViews / Math.max(b.views, 1)
          : b.conversions / Math.max(b.qualifiedViews, 1);
      return bRate - aRate;
    });
  }, [allDeliverables, filterSpecies, filterKind, sortKey]);

  const overall = aggregateFunnel(filtered);
  const overallTrust = meanTrustScore(filtered);
  const bySpecies = groupBySpecies(allDeliverables);
  const byKind = groupByKind(allDeliverables);

  return (
    <WorkspaceShell>
    <main className="min-h-screen bg-adisseo-bg">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <Activity size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Layer 5 · Activation
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              Engagement tracker
            </h1>
            <p className="text-sm text-adisseo-muted">
              Every shipped deliverable. Channel-native signals. Graded against
              the Malaysia-ASF benchmark.
            </p>
          </div>
        </div>

        <WorkflowRibbon />

        {/* Phase 7 / TFIP-F — channel signal legend with workshop-framework tab */}
        <section className="mb-8 rounded-2xl border border-adisseo-line bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              <Activity size={11} />
              {legendTab === "per-channel"
                ? "Per-channel signal mapping · \"views\" replaced by what the buyer actually did"
                : "Workshop framework · Apr-30 poultry-A team poster 1 (leading + lagging metrics)"}
            </div>
            <div className="flex items-center gap-1 rounded-md border border-adisseo-line bg-adisseo-bg p-1">
              <button
                onClick={() => setLegendTab("per-channel")}
                className={`rounded px-2.5 py-1 text-[10px] font-semibold transition ${
                  legendTab === "per-channel"
                    ? "bg-white text-adisseo-ink-strong shadow-sm"
                    : "text-adisseo-muted hover:text-adisseo-ink"
                }`}
              >
                Per-channel
              </button>
              <button
                onClick={() => setLegendTab("workshop")}
                className={`rounded px-2.5 py-1 text-[10px] font-semibold transition ${
                  legendTab === "workshop"
                    ? "bg-adisseo-crimson text-white shadow-sm"
                    : "text-adisseo-muted hover:text-adisseo-ink"
                }`}
              >
                Workshop framework
              </button>
            </div>
          </div>

          {legendTab === "per-channel" && (
            <div className="mt-3 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              {Object.values(CHANNEL_METRICS).map((m) => (
                <div
                  key={m.channel}
                  className="rounded-lg border border-adisseo-line bg-adisseo-bg p-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-ink-strong">
                    {m.label}
                  </p>
                  <p className="mt-1 text-[10px] text-adisseo-muted">
                    Reach: <span className="font-medium text-adisseo-ink">{m.primaryMetric}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-adisseo-muted">
                    Qualified: <span className="font-medium text-adisseo-ink">{m.qualifiedMetric}</span>
                  </p>
                  <p className="mt-1 text-[9px] text-adisseo-muted/80">{m.source}</p>
                </div>
              ))}
            </div>
          )}

          {legendTab === "workshop" && <WorkshopFrameworkPanel />}
        </section>

        {/* MALAYSIA BENCHMARK CALLOUT */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-adisseo-crimson bg-white shadow-sm">
          <div className="border-l-8 border-adisseo-crimson p-6 md:p-8">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              <Quote size={12} />
              The benchmark Ricardo named on the call
            </div>
            <p className="mt-3 font-serif text-2xl italic leading-snug text-adisseo-ink-strong md:text-3xl">
              &ldquo;7 serious viewers (over 2.5-min watch time) → 3
              customer conversions. Institutionalize this metric.&rdquo;
            </p>
            <p className="mt-2 text-xs font-medium text-adisseo-muted">
              — Apr 28 call, Adisseo APAC
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <BenchStat n="38" label="views" />
              <BenchStat n="7" label="qualified (>2.5min)" />
              <BenchStat n="5" label="conversations" />
              <BenchStat n="3" label="conversions" tone="crimson" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-adisseo-muted">
              The number that matters: <strong className="text-adisseo-crimson">qualified-view-to-conversion</strong>{" "}
              held at <strong>{pct(MALAYSIA_BENCHMARK.conversionRate)}</strong>.
              That&apos;s the bar. Every new deliverable below is graded
              against it.
            </p>
          </div>
        </section>

        {/* OVERALL FUNNEL */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-adisseo-ink-strong">
              Across {filtered.length} deliverable
              {filtered.length === 1 ? "" : "s"}
            </h2>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-adisseo-muted">
              <Filter
                label="Species"
                value={filterSpecies}
                options={[
                  { id: "all", label: "All" },
                  { id: "aqua", label: "Aqua" },
                  { id: "poultry", label: "Poultry" },
                  { id: "ruminants", label: "Ruminants" },
                  { id: "swine", label: "Swine" },
                  { id: "cross", label: "Cross" },
                ]}
                onChange={(v) => setFilterSpecies(v as SpeciesKey | "all")}
              />
              <Filter
                label="Kind"
                value={filterKind}
                options={[
                  { id: "all", label: "All" },
                  ...(Object.keys(KIND_LABEL) as DeliverableKind[]).map((k) => ({
                    id: k,
                    label: KIND_LABEL[k],
                  })),
                ]}
                onChange={(v) => setFilterKind(v as DeliverableKind | "all")}
              />
            </div>
          </div>
          <FunnelStrip funnel={overall} />
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-adisseo-line bg-white px-4 py-3 text-xs">
            <ShieldCheck size={14} className="text-adisseo-crimson" />
            <span className="font-semibold text-adisseo-ink-strong">Trust-layer floor:</span>
            <span className="text-adisseo-muted">
              Cohort mean trust score is{" "}
              <strong
                className={
                  overallTrust >= 80
                    ? "text-emerald-600"
                    : overallTrust >= 60
                      ? "text-amber-600"
                      : "text-rose-600"
                }
              >
                {overallTrust}/100
              </strong>
              . Phase 1 rule: a deliverable can only be graded "above benchmark" if its trust score is ≥ 80. High engagement on slop-heavy copy stays at "at" — we don't promote it to a template.
            </span>
          </div>
        </section>

        {/* BY SPECIES + BY KIND */}
        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-adisseo-line bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              <Users size={12} /> By species
            </div>
            <ul className="space-y-2">
              {bySpecies.map((s) => {
                const items = allDeliverables.filter((d) => d.species === s.species);
                const trust = meanTrustScore(items);
                return (
                  <li key={s.species} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-bold text-adisseo-ink-strong">
                      {SPECIES_LABEL[s.species]}
                    </span>
                    <span className="text-[10px] text-adisseo-muted">
                      {s.count} · {s.funnel.conversions} conv
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        trust >= 80 ? "text-emerald-600" : trust >= 60 ? "text-amber-600" : "text-rose-600"
                      }`}
                      title="Mean trust-layer score for the cohort"
                    >
                      • trust {trust}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <RatioBar value={s.funnel.conversionRate} />
                      <span
                        className={`w-12 text-right text-xs font-bold ${gradeColor(
                          gradeAgainstBenchmark(s.funnel, trust)
                        )}`}
                      >
                        {pct(s.funnel.conversionRate)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-adisseo-line bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              <Layers size={12} /> By deliverable kind
            </div>
            <ul className="space-y-2">
              {byKind.map((k) => {
                const Icon = KIND_ICON[k.kind];
                const items = allDeliverables.filter((d) => d.kind === k.kind);
                const trust = meanTrustScore(items);
                return (
                  <li key={k.kind} className="flex items-center gap-3">
                    <span className="flex w-32 items-center gap-1.5 text-xs font-bold text-adisseo-ink-strong">
                      <Icon size={11} />
                      {KIND_LABEL[k.kind]}
                    </span>
                    <span className="text-[10px] text-adisseo-muted">
                      {k.count} · {k.funnel.conversions} conv
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        trust >= 80 ? "text-emerald-600" : trust >= 60 ? "text-amber-600" : "text-rose-600"
                      }`}
                      title="Mean trust-layer score for the cohort"
                    >
                      • trust {trust}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <RatioBar value={k.funnel.conversionRate} />
                      <span
                        className={`w-12 text-right text-xs font-bold ${gradeColor(
                          gradeAgainstBenchmark(k.funnel, trust)
                        )}`}
                      >
                        {pct(k.funnel.conversionRate)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* TABLE */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-adisseo-ink-strong">
              Per-deliverable performance
            </h2>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-adisseo-muted">
              Sort by:
              {(["conversionRate", "qualifiedRate", "views", "sentAt"] as SortKey[]).map(
                (k) => (
                  <button
                    key={k}
                    onClick={() => setSortKey(k)}
                    className={`rounded-md border px-2 py-1 ${
                      sortKey === k
                        ? "border-adisseo-crimson bg-adisseo-crimson text-white"
                        : "border-adisseo-line bg-white text-adisseo-ink-strong hover:border-adisseo-crimson"
                    }`}
                  >
                    {k === "conversionRate"
                      ? "Conv rate"
                      : k === "qualifiedRate"
                        ? "Qualified rate"
                        : k === "views"
                          ? "Views"
                          : "Date"}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-adisseo-line bg-white">
            <table className="w-full text-xs">
              <thead className="bg-adisseo-bg text-[10px] uppercase tracking-widest text-adisseo-muted">
                <tr>
                  <Th>Deliverable</Th>
                  <Th align="right">Reach</Th>
                  <Th align="right">Qualified engagement</Th>
                  <Th align="right">Conv rate</Th>
                  <Th align="right">Conversations</Th>
                  <Th align="right">Conversions</Th>
                  <Th align="center">Trust</Th>
                  <Th align="center">vs MY benchmark</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const Icon = KIND_ICON[d.kind];
                  const f = aggregateFunnel([d]);
                  const trust = d.trustScore ?? 90;
                  const grade = gradeAgainstBenchmark(f, trust);
                  const breakdown = SEED_BREAKDOWNS[d.id];
                  const headline = headlineFor(d, breakdown);
                  const channel = primaryChannelForKind(d.kind, d.region);
                  const meta = CHANNEL_METRICS[channel];
                  return (
                    <tr
                      key={d.id}
                      className="border-t border-adisseo-line align-top hover:bg-adisseo-bg"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-adisseo-crimson/5 text-adisseo-crimson">
                            <Icon size={12} />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-adisseo-ink-strong">
                              {d.title}
                            </p>
                            <p className="mt-0.5 truncate text-[10px] text-adisseo-muted">
                              {SPECIES_LABEL[d.species]} · {d.region}{" "}
                              · {d.audience} · {d.owner}
                            </p>
                            {d.anchorSignal && (
                              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-adisseo-cyan/10 px-2 py-0.5 text-[10px] font-medium text-adisseo-cyan">
                                <ExternalLink size={9} /> {d.anchorSignal}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-adisseo-ink">
                        <div className="font-medium">
                          {headline.reachValue.toLocaleString()}
                        </div>
                        <div
                          className="text-[9px] uppercase tracking-wide text-adisseo-muted"
                          title={`${meta.label} · ${headline.source}`}
                        >
                          {headline.reachLabel}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-adisseo-ink">
                        <div className="font-medium">
                          {headline.qualifiedValue.toLocaleString()}
                        </div>
                        <div className="text-[9px] uppercase tracking-wide text-adisseo-muted">
                          {headline.qualifiedLabel}
                          {f.qualifiedRate > 0 && (
                            <span className="ml-1 normal-case text-adisseo-muted/80">
                              · {pct(f.qualifiedRate)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold ${gradeColor(grade)}`}
                      >
                        {pct(f.conversionRate)}
                      </td>
                      <td className="px-4 py-3 text-right text-adisseo-ink">
                        {d.conversations}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-adisseo-ink-strong">
                        {d.conversions}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <TrustBadge trust={trust} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <GradeBadge grade={grade} trust={trust} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-[10px] text-adisseo-muted">
          Seed dataset · 9 deliverables, Q4 2025 – Q1 2026 · Live
          measurement plumbing pending: viewer-time tracker on the leaflet PDF
          viewer, watch-time on the Swine shorts, scroll-depth on the LinkedIn
          carousels.
        </p>
      </div>
    </main>
    </WorkspaceShell>
  );
}

function Filter<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex items-center gap-1 normal-case tracking-normal">
      <span className="text-adisseo-muted">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-md border border-adisseo-line bg-white px-2 py-1 text-[11px] font-semibold text-adisseo-ink-strong"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FunnelStrip({
  funnel,
}: {
  funnel: ReturnType<typeof aggregateFunnel>;
}) {
  const stages = [
    {
      label: "Reach",
      n: funnel.views.toLocaleString(),
      sub: "Impressions / delivered / plays / downloads (per channel)",
      color: "bg-adisseo-bg text-adisseo-ink-strong border-adisseo-line",
    },
    {
      label: "Qualified engagement",
      n: funnel.qualifiedViews.toLocaleString(),
      sub: `${pct(funnel.qualifiedRate)} of reach · LinkedIn engaged / Mailgun clicks / read >80%`,
      color: "bg-adisseo-cyan/10 text-adisseo-cyan border-adisseo-cyan/30",
    },
    {
      label: "Conversations",
      n: funnel.conversations.toLocaleString(),
      sub: `${pct(funnel.conversationRate)} of qualified`,
      color: "bg-adisseo-orange/10 text-adisseo-orange border-adisseo-orange/30",
    },
    {
      label: "Conversions",
      n: funnel.conversions.toLocaleString(),
      sub: `${pct(funnel.conversionRate)} of qualified · benchmark ${pct(MALAYSIA_BENCHMARK.conversionRate)}`,
      color: "bg-adisseo-crimson/10 text-adisseo-crimson border-adisseo-crimson",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
      {stages.map((s, i) => (
        <div
          key={s.label}
          className={`rounded-2xl border p-4 ${s.color}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
              {`0${i + 1}`} · {s.label}
            </p>
          </div>
          <p className="mt-2 font-serif text-3xl font-bold md:text-4xl">{s.n}</p>
          <p className="mt-1 text-[10px] opacity-80">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

function BenchStat({
  n,
  label,
  tone,
}: {
  n: string;
  label: string;
  tone?: "crimson";
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        tone === "crimson"
          ? "border-adisseo-crimson bg-adisseo-crimson/5"
          : "border-adisseo-line bg-adisseo-bg"
      }`}
    >
      <p
        className={`font-serif text-3xl font-bold ${
          tone === "crimson" ? "text-adisseo-crimson" : "text-adisseo-ink-strong"
        }`}
      >
        {n}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-adisseo-muted">
        {label}
      </p>
    </div>
  );
}

function RatioBar({ value }: { value: number }) {
  const pctVal = Math.min(value * 100, 100);
  return (
    <div className="h-1.5 w-32 rounded-full bg-adisseo-bg">
      <div
        className="h-1.5 rounded-full bg-adisseo-crimson"
        style={{ width: `${pctVal}%` }}
      />
    </div>
  );
}

function GradeBadge({
  grade,
  trust,
}: {
  grade: "above" | "at" | "below";
  trust?: number;
}) {
  const blockedByTrust = trust !== undefined && trust < 80 && grade === "at";
  if (grade === "above")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <TrendingUp size={10} /> Above
      </span>
    );
  if (grade === "at")
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          blockedByTrust
            ? "bg-amber-50 text-amber-800"
            : "bg-adisseo-bg text-adisseo-ink-strong"
        }`}
        title={
          blockedByTrust
            ? "Above benchmark numerically, but trust-layer score < 80 — don't make this asset a template."
            : undefined
        }
      >
        <Clock size={10} /> {blockedByTrust ? "At (trust-gated)" : "At"}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-adisseo-orange">
      <TrendingDown size={10} /> Below
    </span>
  );
}

function TrustBadge({ trust }: { trust: number }) {
  const tone =
    trust >= 80
      ? "bg-emerald-50 text-emerald-700"
      : trust >= 60
        ? "bg-amber-50 text-amber-800"
        : "bg-rose-50 text-rose-700";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}
      title="Trust-layer composite (slop · brand voice · grammar)"
    >
      <ShieldCheck size={10} /> {trust}
    </span>
  );
}

function gradeColor(g: "above" | "at" | "below") {
  if (g === "above") return "text-emerald-700";
  if (g === "at") return "text-adisseo-ink-strong";
  return "text-adisseo-orange";
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th className={`px-4 py-3 ${alignClass} font-semibold`} scope="col">
      {children}
    </th>
  );
}

/* ============================================================================
 * TFIP plan Phase F — workshop-framework panel
 * ========================================================================== */

const STATUS_CHIP: Record<
  WorkshopMetricStatus,
  { label: string; tone: string }
> = {
  "on-track": {
    label: "On track",
    tone: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  watch: {
    label: "Watch",
    tone: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  "off-track": {
    label: "Off track",
    tone: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

function WorkshopFrameworkPanel() {
  const buckets: WorkshopMetric["bucket"][] = ["leading", "progress", "lagging"];
  const amberCount = ALL_WORKSHOP_METRICS.filter(
    (m) => m.status === "watch" || m.status === "off-track",
  ).length;

  return (
    <div className="mt-3 space-y-4">
      <p className="text-[11px] leading-relaxed text-adisseo-muted">
        Workshop poster 1 in structured form. Three columns mirror the poster
        layout: <strong>leading</strong> activity we control, <strong>progress</strong>{" "}
        funnel signals, <strong>lagging</strong> CRM outcomes. Every TFIP-tagged
        deliverable shipped from{" "}
        <Link href="/campaign-fanout" className="text-adisseo-crimson underline">
          /campaign-fanout
        </Link>{" "}
        threads <code className="text-adisseo-crimson">campaignId=&quot;tfip&quot;</code>{" "}
        through to the lagging-metric attribution path.
      </p>

      {amberCount > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          <strong>Workshop poster flagged {amberCount}</strong> progress / lagging
          metrics as amber. They&apos;re tinted below.
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {buckets.map((bucket) => (
          <div
            key={bucket}
            className="rounded-xl border border-adisseo-line bg-adisseo-bg p-3"
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-adisseo-ink-strong">
              {WORKSHOP_BUCKET_LABEL[bucket]}
            </div>
            <p className="mt-1 text-[10px] leading-snug text-adisseo-muted">
              {WORKSHOP_BUCKET_BLURB[bucket]}
            </p>
            <ul className="mt-2 space-y-2">
              {workshopMetricsByBucket(bucket).map((m) => {
                const chip = m.status ? STATUS_CHIP[m.status] : null;
                return (
                  <li
                    key={m.id}
                    className="rounded-lg border border-adisseo-line bg-white p-2.5 text-[11px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold leading-snug text-adisseo-ink-strong">
                        {m.label}
                      </p>
                      {chip && (
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${chip.tone}`}
                        >
                          {chip.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-adisseo-muted">
                      {m.definition}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[9px] uppercase tracking-wide text-adisseo-muted">
                      <span>{m.source}</span>
                      {m.tfipCampaignTag && (
                        <span
                          className="rounded-full bg-adisseo-warmth/60 px-1.5 py-0.5 text-[9px] font-semibold text-adisseo-crimson"
                          title="Depends on the TFIP campaign tag being attached to the deliverable / visit report."
                        >
                          tfip-tagged
                        </span>
                      )}
                    </div>
                    {m.target && (
                      <div className="mt-1 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="rounded bg-adisseo-bg px-2 py-1">
                          <p className="font-semibold uppercase tracking-wider text-adisseo-muted">
                            Target
                          </p>
                          <p className="text-adisseo-ink">{m.target}</p>
                        </div>
                        <div className="rounded bg-adisseo-bg px-2 py-1">
                          <p className="font-semibold uppercase tracking-wider text-adisseo-muted">
                            Now
                          </p>
                          <p className="text-adisseo-ink">{m.current ?? "—"}</p>
                        </div>
                      </div>
                    )}
                    <p className="mt-1 text-[9px] uppercase tracking-wide text-adisseo-muted">
                      Owner: {m.owner}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
