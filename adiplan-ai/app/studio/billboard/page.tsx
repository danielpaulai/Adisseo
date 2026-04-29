"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Bookmark,
  Target,
  FileDown,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import {
  BILLBOARD_FORMATS,
  type BillboardFormat,
  type BillboardPack,
} from "@/lib/billboards";
import { Logo } from "@/components/Logo";
import { SendToHQButton } from "@/components/SendToHQButton";
import { ProseQualityCard } from "@/components/ProseQualityCard";
import { collectBillboardProse } from "@/lib/studio-prose";
import { toast } from "sonner";

type GenerateResp = {
  pack: BillboardPack;
  source: "deterministic" | "llm" | "deterministic-fallback";
  warning?: string;
};

export default function BillboardStudioPage() {
  const composedFrame = useAdiPlanStore((s) => s.composedFrame);
  const match = useAdiPlanStore((s) => s.match);

  const [format, setFormat] = useState<BillboardFormat>("a2-portrait");
  const [pack, setPack] = useState<BillboardPack | null>(null);
  const [meta, setMeta] = useState<GenerateResp | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gatePasses, setGatePasses] = useState(true);
  const [gateScore, setGateScore] = useState(100);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [renderedKey, setRenderedKey] = useState<string | null>(null);

  // For local manual override (used when there's no composed frame yet)
  const [manualTopic, setManualTopic] = useState("");
  const [manualCompetitor, setManualCompetitor] = useState("");
  const [manualRegion, setManualRegion] = useState("APAC");

  const sourceLabel = useMemo(() => {
    if (composedFrame) return "Composed strategic frame";
    if (match)
      return "News-Bridge match (no frame composed yet — manual fields used)";
    return "Manual";
  }, [composedFrame, match]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-billboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          composedFrame
            ? { frame: composedFrame }
            : {
                cbi: match?.cbi,
                persona: match?.persona,
                competitor: manualCompetitor || match?.cbi || "Industry signal",
                region: manualRegion || "APAC",
                topicHint: manualTopic || match?.cbi,
              }
        ),
      });
      if (!res.ok) throw new Error("Billboard generation failed");
      const data = (await res.json()) as GenerateResp;
      setPack(data.pack);
      setMeta(data);
      setPreviewVersion((v) => v + 1);
      useAdiPlanStore.getState().pushActivity({
        kind: "billboard",
        title: `Billboard composed: ${data.pack.headline.slice(0, 64)}`,
        detail: `${BILLBOARD_FORMATS.find((f) => f.id === format)?.label} · ${data.source}`,
        href: "/studio/billboard",
        tone: "orange",
      });
      toast.success("Billboard composed", {
        description: `Unique ${data.pack.scoring.unique}/5 · Important ${data.pack.scoring.important}/5 · Believable ${data.pack.scoring.believable}/5`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg);
      toast.error("Billboard generate failed", { description: msg });
    } finally {
      setGenerating(false);
    }
  };

  // Render preview by POSTing the pack to /api/render-billboard, getting a
  // blob, and pointing an iframe at the object URL. Re-runs on format change.
  useEffect(() => {
    if (!pack) return;
    let revoked = false;
    let url: string | null = null;
    const run = async () => {
      const res = await fetch("/api/render-billboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack, format }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      url = URL.createObjectURL(blob);
      if (!revoked) setRenderedKey(url);
    };
    run();
    return () => {
      revoked = true;
      if (renderedKey) URL.revokeObjectURL(renderedKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack, format, previewVersion]);

  const downloadPdf = async () => {
    if (!pack) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/render-billboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack, format }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `adisseo-billboard-${format}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const fmtSpec = BILLBOARD_FORMATS.find((f) => f.id === format)!;

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
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <Bookmark size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Module 05 · Creating
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              Billboard Campaign generator
            </h1>
            <p className="text-sm text-adisseo-muted">
              The AdiPlan billboard test — Headline + Differentiation +
              Reason to Believe + Visual brief, in one printable poster.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* ============================== LEFT COL ============================== */}
          <div className="space-y-4">
            {/* SOURCE */}
            <Section title="Source" icon={Target}>
              <div className="flex items-center gap-2 rounded-lg border border-adisseo-line bg-adisseo-bg px-3 py-2 text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${
                    composedFrame
                      ? "bg-emerald-500"
                      : match
                        ? "bg-orange-500"
                        : "bg-adisseo-muted"
                  }`}
                />
                <span className="font-medium text-adisseo-ink-strong">
                  {sourceLabel}
                </span>
              </div>

              {composedFrame ? (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs">
                  <p className="font-bold text-emerald-800">
                    {composedFrame.oneLineSummary}
                  </p>
                  <p className="mt-1 text-emerald-700">
                    CBI · {composedFrame.cbi} · Persona ·{" "}
                    {composedFrame.persona} · Region ·{" "}
                    {composedFrame.region}
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <Field
                    label="Topic / CBI hint"
                    value={manualTopic}
                    onChange={setManualTopic}
                    placeholder="AGP phase-out · Heat stress · J-credit dairy methane"
                  />
                  <Field
                    label="Competitor / signal"
                    value={manualCompetitor}
                    onChange={setManualCompetitor}
                    placeholder="Kemin · Evonik · Cargill · Mintec"
                  />
                  <Field
                    label="Region"
                    value={manualRegion}
                    onChange={setManualRegion}
                    placeholder="APAC · Hokkaido · ID · TH"
                  />
                  <Link
                    href="/news-bridge"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-adisseo-crimson hover:underline"
                  >
                    Match an article first <ArrowRight size={11} />
                  </Link>
                </div>
              )}
            </Section>

            {/* FORMAT */}
            <Section title="Format" icon={Bookmark}>
              <div className="grid grid-cols-1 gap-2">
                {BILLBOARD_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`rounded-lg border p-3 text-left text-xs transition ${
                      format === f.id
                        ? "border-adisseo-crimson bg-adisseo-crimson/5"
                        : "border-adisseo-line bg-white hover:border-adisseo-crimson/40"
                    }`}
                  >
                    <p className="font-bold text-adisseo-ink-strong">
                      {f.label}
                    </p>
                    <p className="mt-0.5 text-adisseo-muted">{f.body}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-adisseo-crimson">
                      {f.use}
                    </p>
                  </button>
                ))}
              </div>
            </Section>

            {/* GENERATE */}
            <button
              onClick={generate}
              disabled={generating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-adisseo-crimson px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {generating ? "Composing billboard…" : "Compose billboard"}
            </button>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {pack && (
              <Section title="Self-test · AdiPlan billboard score" icon={CheckCircle2}>
                <div className="grid grid-cols-3 gap-2">
                  {(["unique", "important", "believable"] as const).map((k) => (
                    <div
                      key={k}
                      className="rounded-lg border border-adisseo-line bg-white p-3 text-center"
                    >
                      <p className="font-serif text-2xl font-bold text-adisseo-crimson">
                        {pack.scoring[k]}/5
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-adisseo-muted">
                        {k}
                      </p>
                    </div>
                  ))}
                </div>
                {meta && (
                  <p className="mt-3 text-[10px] text-adisseo-muted">
                    Source: <strong>{meta.source}</strong>
                    {meta.warning ? ` · ${meta.warning}` : ""}
                  </p>
                )}
              </Section>
            )}

            {pack && (
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-adisseo-line bg-white px-4 py-3 text-sm font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson hover:text-adisseo-crimson disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileDown size={14} />
                )}
                {downloading ? "Rendering…" : `Download PDF · ${fmtSpec.label}`}
              </button>
            )}

            {pack && (
              <>
                <ProseQualityCard
                  text={collectBillboardProse(pack)}
                  language="en"
                  onGateChange={(passes, score) => {
                    setGatePasses(passes);
                    setGateScore(score);
                  }}
                  compact
                />
                <SendToHQButton
                  kind="billboard"
                  title={`Billboard · ${pack.headline}`}
                  summary={`${fmtSpec.label} · ${pack.region ?? "APAC"} · ${pack.persona ?? "billboard"} · trust ${gateScore}/100`}
                  href="/studio/billboard"
                  payload={{
                    format,
                    region: pack.region,
                    persona: pack.persona,
                    cbi: pack.cbi,
                    trustScore: gateScore,
                  }}
                  gateBlocked={!gatePasses}
                  gateReason={gateScore < 60 ? `Trust score ${gateScore}/100 below 60.` : undefined}
                />
              </>
            )}
          </div>

          {/* ============================== RIGHT COL ============================== */}
          <div className="space-y-4">
            {!pack && (
              <div className="flex h-full min-h-[600px] items-center justify-center rounded-3xl border border-dashed border-adisseo-line bg-white p-10 text-center">
                <div>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-adisseo-crimson/10 text-adisseo-crimson">
                    <Bookmark size={20} />
                  </span>
                  <p className="mt-4 text-sm font-bold text-adisseo-ink-strong">
                    No billboard composed yet
                  </p>
                  <p className="mt-2 max-w-sm text-xs text-adisseo-muted">
                    Compose a Strategic Frame first (recommended) or fill the
                    manual fields on the left, then click <em>Compose
                    billboard</em>. The poster will render here.
                  </p>
                </div>
              </div>
            )}

            {pack && renderedKey && (
              <div className="overflow-hidden rounded-3xl border border-adisseo-line bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-adisseo-line bg-adisseo-bg px-4 py-2">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                    <Bookmark size={12} />
                    {fmtSpec.label}
                  </div>
                  <button
                    onClick={() => setPreviewVersion((v) => v + 1)}
                    className="flex items-center gap-1 rounded-md border border-adisseo-line px-2 py-1 text-[10px] font-semibold text-adisseo-muted hover:border-adisseo-crimson hover:text-adisseo-crimson"
                  >
                    <RefreshCw size={10} /> Re-render
                  </button>
                </div>
                <iframe
                  key={renderedKey}
                  src={renderedKey}
                  className="h-[1024px] w-full bg-adisseo-bg"
                  title="Billboard preview"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
        <Icon size={12} />
        {title}
      </div>
      {children}
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
