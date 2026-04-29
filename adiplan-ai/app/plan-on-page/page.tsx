"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  FileDown,
  Loader2,
  RefreshCw,
  Network,
  Target,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { buildPlan, type PlanOnPageData } from "@/lib/plan-on-page";

const PERSONA_COLOR: Record<string, string> = {
  "Efficiency Optimizer": "#A70A2D",
  "System Simplifier": "#00A3C4",
  "Risk Reducer": "#D97641",
  "Sustainability Advocate": "#047857",
  "Knowledge Builder": "#7C3AED",
};

export default function PlanOnPagePage() {
  const stakeholderIds = useAdiPlanStore((s) => s.selectedStakeholderIds);
  const ladders = useAdiPlanStore((s) => s.ladders);
  const match = useAdiPlanStore((s) => s.match);
  const composedFrame = useAdiPlanStore((s) => s.composedFrame);
  const activity = useAdiPlanStore((s) => s.activity);

  const [region, setRegion] = useState("APAC");
  const [campaign, setCampaign] = useState("");
  const [author, setAuthor] = useState("Ricardo Communod · Adisseo APAC");

  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);

  const plan: PlanOnPageData = useMemo(
    () =>
      buildPlan({
        stakeholderIds,
        ladders,
        match,
        frame: composedFrame,
        activity,
        region: region || undefined,
        campaignName: campaign || undefined,
        author: author || undefined,
      }),
    [stakeholderIds, ladders, match, composedFrame, activity, region, campaign, author]
  );

  // Render preview by POSTing the plan to /api/render-plan, getting a blob,
  // pointing an iframe at the object URL.
  useEffect(() => {
    let revoked = false;
    let url: string | null = null;
    const run = async () => {
      const res = await fetch("/api/render-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      url = URL.createObjectURL(blob);
      if (!revoked) setPreviewUrl(url);
    };
    run();
    return () => {
      revoked = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, previewVersion]);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/render-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `adisseo-plan-on-a-page.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const sourcesUsed = {
    stakeholders: stakeholderIds.length,
    ladders: Object.keys(ladders).length,
    match: !!match,
    frame: !!composedFrame,
    activity: activity.length,
  };

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="text-adisseo-muted hover:text-adisseo-crimson">
              Home
            </Link>
            <Link
              href="/strategic-frame"
              className="text-adisseo-muted hover:text-adisseo-crimson"
            >
              Strategic Frame
            </Link>
            <Link
              href="/dashboard"
              className="text-adisseo-muted hover:text-adisseo-crimson"
            >
              War Room
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <Layers size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Executing · AdiPlan
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              Plan on a Page
            </h1>
            <p className="text-sm text-adisseo-muted">
              The full session — stakeholders moved, frame composed,
              deliverables shipped, KPI targets — on a single sheet for
              regional sales / KAMs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* ============================== LEFT COL ============================== */}
          <div className="space-y-4">
            <Section title="Plan metadata">
              <Field label="Region" value={region} onChange={setRegion} placeholder="APAC · Hokkaido · ID" />
              <Field
                label="Campaign name"
                value={campaign}
                onChange={setCampaign}
                placeholder={plan.campaignName}
              />
              <Field
                label="Plan owner"
                value={author}
                onChange={setAuthor}
                placeholder="Ricardo Communod"
              />
            </Section>

            <Section title="Sources auto-pulled from your session">
              <ul className="space-y-2 text-xs">
                <SourceRow
                  label="Stakeholders selected"
                  ok={sourcesUsed.stakeholders > 0}
                  detail={`${sourcesUsed.stakeholders} · click bubbles on Stakeholder Map`}
                  href="/stakeholder-map"
                />
                <SourceRow
                  label="CBI ladders built"
                  ok={sourcesUsed.ladders > 0}
                  detail={`${sourcesUsed.ladders} ladder${sourcesUsed.ladders === 1 ? "" : "s"} · CBI Ladder builder`}
                  href="/cbi-ladder"
                />
                <SourceRow
                  label="News matched"
                  ok={sourcesUsed.match}
                  detail={
                    match
                      ? `${match.cbi} · ${match.persona}`
                      : "Match an article in News Bridge"
                  }
                  href="/news-bridge"
                />
                <SourceRow
                  label="Strategic frame composed"
                  ok={sourcesUsed.frame}
                  detail={
                    composedFrame
                      ? composedFrame.oneLineSummary?.slice(0, 64)
                      : "Compose a frame to fill the TVS panels"
                  }
                  href="/strategic-frame"
                />
                <SourceRow
                  label="Deliverables in flight"
                  ok={sourcesUsed.activity > 0}
                  detail={`${sourcesUsed.activity} log entries from this session`}
                  href="/dashboard"
                />
              </ul>
              <p className="mt-3 text-[10px] text-adisseo-muted">
                Anything missing? The plan still composes — it falls back
                to AdiPlan defaults so you can demo cold.
              </p>
            </Section>

            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-adisseo-crimson px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileDown size={14} />
              )}
              {downloading ? "Rendering…" : "Download Plan on a Page (PDF)"}
            </button>

            <button
              onClick={() => setPreviewVersion((v) => v + 1)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-adisseo-line bg-white px-4 py-2.5 text-xs font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              <RefreshCw size={12} /> Re-render preview
            </button>

            {/* Mini-preview of the plan content (HTML, not PDF) */}
            <div className="rounded-2xl border border-adisseo-line bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                Composed plan summary
              </p>
              <h3 className="mt-2 font-serif text-base font-bold text-adisseo-ink-strong">
                {plan.campaignName}
              </h3>
              <p className="mt-1 text-xs italic text-adisseo-muted">
                {plan.oneLineSummary}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Tag color="crimson">{`CBI · ${plan.cbi}`}</Tag>
                <Tag color="cyan">{`Persona · ${plan.persona}`}</Tag>
                <Tag color="orange">{`Region · ${plan.region}`}</Tag>
              </div>

              <div className="mt-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  Stakeholders ({plan.topStakeholders.length})
                </p>
                <ul className="space-y-1">
                  {plan.topStakeholders.slice(0, 5).map((s) => (
                    <li key={s.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="inline-block rounded-full"
                        style={{
                          width:
                            s.influence === "large"
                              ? 12
                              : s.influence === "medium"
                                ? 9
                                : 6,
                          height:
                            s.influence === "large"
                              ? 12
                              : s.influence === "medium"
                                ? 9
                                : 6,
                          backgroundColor:
                            PERSONA_COLOR[s.persona] ?? "#6B7280",
                        }}
                      />
                      <span className="font-semibold text-adisseo-ink-strong">
                        {s.name}
                      </span>
                      <span className="text-[10px] text-adisseo-muted">
                        {s.influence} · {s.trend}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  Next moves ({plan.nextMoves.length})
                </p>
                <ul className="space-y-1">
                  {plan.nextMoves.slice(0, 5).map((m, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          m.status === "shipped"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="font-semibold text-adisseo-ink-strong">
                        {m.species}
                      </span>
                      <span className="text-adisseo-muted">{m.deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ============================== RIGHT COL ============================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-t-2xl border border-b-0 border-adisseo-line bg-white px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                A4 Plan on a Page · live preview
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                <Clock size={10} className="inline" /> regenerates as you edit
              </p>
            </div>
            <iframe
              key={previewUrl ?? "no-preview"}
              src={previewUrl ?? undefined}
              className="-mt-4 h-[1400px] w-full rounded-b-2xl border border-adisseo-line bg-white shadow-sm"
              title="Plan on a Page preview"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-4">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs text-adisseo-ink-strong placeholder:text-adisseo-muted focus:border-adisseo-crimson focus:outline-none"
      />
    </label>
  );
}

function SourceRow({
  label,
  ok,
  detail,
  href,
}: {
  label: string;
  ok: boolean;
  detail?: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-start gap-2 rounded-lg border border-transparent p-1 hover:border-adisseo-line"
      >
        {ok ? (
          <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-600" />
        ) : (
          <ArrowRight size={12} className="mt-0.5 shrink-0 text-adisseo-muted group-hover:text-adisseo-crimson" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-adisseo-ink-strong">{label}</p>
          {detail && (
            <p className="truncate text-[10px] text-adisseo-muted">{detail}</p>
          )}
        </div>
      </Link>
    </li>
  );
}

function Tag({
  color,
  children,
}: {
  color: "crimson" | "cyan" | "orange";
  children: React.ReactNode;
}) {
  const cls =
    color === "crimson"
      ? "bg-adisseo-crimson/10 text-adisseo-crimson"
      : color === "cyan"
        ? "bg-adisseo-cyan/10 text-adisseo-cyan"
        : "bg-adisseo-orange/10 text-adisseo-orange";
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${cls}`}
    >
      {children}
    </span>
  );
}
