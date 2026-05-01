"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Wand2,
  Globe,
  Newspaper,
  Download,
  ShieldCheck,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import { aquaMagazines, type AquaLanguage } from "@/lib/aqua-leaflet";
import { SpeciesIcon } from "@/components/Logo";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { WorkflowRibbon } from "@/components/workspace/WorkflowRibbon";
import { SendToHQButton } from "@/components/SendToHQButton";
import { ProseQualityCard } from "@/components/ProseQualityCard";
import { AnchorInVault } from "@/components/AnchorInVault";
import { collectAquaProse } from "@/lib/studio-prose";
import { InlineSectionEditor } from "@/components/InlineSectionEditor";

type LeafletResponse = {
  leaflet: {
    language: AquaLanguage;
    magazineId: string;
    topic: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    heroClaim: string;
    heroEvidence: string;
    sections: { label: string; heading: string; body: string }[];
    specs: { label: string; value: string }[];
    cta: string;
    contactLine: string;
    citationLine: string;
    guardrailNotes: string[];
  };
  magazine: {
    id: string;
    name: string;
    country: string;
    language: AquaLanguage;
    audience: string;
  };
  meta: { usedModel: string };
};

const SUGGESTED_TOPICS = [
  "Pangasius hepatopancreas resilience under raw-material price volatility",
  "Pre-loaded gut integrity for shrimp ponds before WSSV season",
  "Mycotoxin lateral-flow as a routine premix-acceptance gate",
  "Lecithin choice on FCR in nursery-phase tilapia",
  "Selenium yeast and survival in late-cycle pangasius",
];

export default function AquaStudioPage() {
  const studioTopic = useAdiPlanStore((s) => s.studioTopic);
  const setStudioTopic = useAdiPlanStore((s) => s.setStudioTopic);
  const match = useAdiPlanStore((s) => s.match);

  const [language, setLanguage] = useState<AquaLanguage>("en");
  const [magazineId, setMagazineId] = useState<string>("mag-en-asia");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<LeafletResponse | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  /** Prefer Puppeteer HTML→PDF for brand fidelity; falls back to @react-pdf. */
  const [pdfEngine, setPdfEngine] = useState<"chrome" | "react-pdf" | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gatePasses, setGatePasses] = useState(true);
  const [gateScore, setGateScore] = useState(100);
  const lastBlobRef = useRef<string | null>(null);

  const consumeStudioPrefill = useAdiPlanStore((s) => s.consumeStudioPrefill);
  const [bridgeContext, setBridgeContext] = useState<{
    articleTitle: string;
    competitor: string;
    publishedAt: string;
  } | null>(null);

  // Consume prefill from News Bridge on mount.
  useEffect(() => {
    const p = consumeStudioPrefill();
    if (!p) return;
    setBridgeContext({
      articleTitle: p.articleTitle,
      competitor: p.competitor,
      publishedAt: p.publishedAt,
    });
    if (p.aquaLanguage) setLanguage(p.aquaLanguage);
    if (p.aquaMagazineId) setMagazineId(p.aquaMagazineId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
    };
  }, []);

  // Auto-sync magazine when language changes (pick the first magazine that matches)
  useEffect(() => {
    const match = aquaMagazines.find((m) => m.language === language);
    if (match && match.id !== magazineId) setMagazineId(match.id);
  }, [language, magazineId]);

  const renderPdf = useCallback(
    async (leaflet: LeafletResponse["leaflet"]) => {
      setPdfLoading(true);
      setPdfEngine(null);
      try {
        const personaLabel = match?.persona;
        let res = await fetch("/api/render-leaflet-html", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leaflet,
            ...(personaLabel ? { personaLabel } : {}),
          }),
        });
        const chromeCt = res.headers.get("content-type") ?? "";
        if (res.ok && chromeCt.includes("application/pdf")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
          lastBlobRef.current = url;
          setPdfUrl(url);
          setPdfEngine("chrome");
          return;
        }

        res = await fetch("/api/render-aqua-leaflet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leaflet }),
        });
        if (!res.ok) throw new Error("Render failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
        lastBlobRef.current = url;
        setPdfUrl(url);
        setPdfEngine("react-pdf");
      } catch (e) {
        setError(e instanceof Error ? e.message : "PDF render failed");
      } finally {
        setPdfLoading(false);
      }
    },
    [match?.persona]
  );

  const generate = useCallback(async () => {
    if (!studioTopic.trim()) {
      setError("Topic required");
      return;
    }
    setLoading(true);
    setError(null);
    setPdfUrl(null);
    try {
      const res = await fetch("/api/generate-aqua-leaflet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: studioTopic,
          language,
          magazineId,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: LeafletResponse = await res.json();
      setResponse(data);
      useAdiPlanStore.getState().pushActivity({
        kind: "aqua",
        title: `Aqua leaflet: ${data.leaflet.title.slice(0, 64)}`,
        detail: `${language.toUpperCase()} · ${magazineId}`,
        href: "/studio/aqua",
        tone: "cyan",
      });
      await renderPdf(data.leaflet);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [studioTopic, language, magazineId, renderPdf]);

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `adisseo-aqua-${response?.leaflet.language ?? "en"}.pdf`;
    a.click();
  };

  return (
    <WorkspaceShell>
    <main className="min-h-screen bg-adisseo-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <SpeciesIcon species="aqua" size={32} className="opacity-80" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              Content Studio &middot; Aqua (Aileen)
            </p>
            <h1 className="text-lg font-semibold text-adisseo-ink-strong">
              1-page technical leaflet — local-magazine ready
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-adisseo-muted">
          <Link
            href="/studio/poultry"
            className="hover:text-adisseo-ink-strong"
          >
            Poultry Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link
            href="/studio/ruminants"
            className="hover:text-adisseo-ink-strong"
          >
            Ruminants Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link
            href="/studio/swine"
            className="hover:text-adisseo-ink-strong"
          >
            Swine Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link
            href="/news-bridge"
            className="hover:text-adisseo-ink-strong"
          >
            News bridge
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pt-4 lg:pt-5">
        <WorkflowRibbon />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[380px,1fr]">
        <aside className="space-y-5 rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm">
          {(bridgeContext || match) && (
            <div className="rounded-xl border border-adisseo-crimson/30 bg-adisseo-crimson/5 p-3 text-xs">
              <p className="font-semibold uppercase tracking-widest text-adisseo-crimson">
                From News Bridge
              </p>
              {bridgeContext && (
                <p className="mt-1 line-clamp-2 text-adisseo-ink-strong">
                  <span className="font-medium">{bridgeContext.competitor}</span> ·{" "}
                  {bridgeContext.publishedAt} · {bridgeContext.articleTitle}
                </p>
              )}
              {match && (
                <>
                  <p className="mt-1 text-adisseo-ink-strong">
                    CBI: <span className="font-medium">{match.cbi}</span>
                  </p>
                  <p className="text-adisseo-ink-strong">
                    Persona: <span className="font-medium">{match.persona}</span>
                  </p>
                </>
              )}
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Topic
            </label>
            <textarea
              value={studioTopic}
              onChange={(e) => setStudioTopic(e.target.value)}
              placeholder="e.g. Pangasius hepatopancreas resilience"
              rows={3}
              className="mt-1 w-full rounded-lg border border-adisseo-line p-3 text-sm focus:border-adisseo-crimson focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {SUGGESTED_TOPICS.slice(0, 3).map((t) => (
                <button
                  key={t}
                  onClick={() => setStudioTopic(t)}
                  className="rounded-full border border-adisseo-line px-2 py-1 text-[10px] text-adisseo-muted hover:border-adisseo-crimson hover:text-adisseo-crimson"
                >
                  {t.length > 40 ? t.slice(0, 38) + "…" : t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              <Globe size={11} /> Output language
            </label>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {(["en", "id", "vi", "th"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`rounded-md border px-2 py-2 text-[10px] font-semibold transition ${
                    language === l
                      ? "border-adisseo-crimson bg-adisseo-crimson text-white"
                      : "border-adisseo-line text-adisseo-muted hover:text-adisseo-ink-strong"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              <Newspaper size={11} /> Magazine target
            </label>
            <select
              value={magazineId}
              onChange={(e) => setMagazineId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-adisseo-line p-2.5 text-sm focus:border-adisseo-crimson focus:outline-none"
            >
              {aquaMagazines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.country})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-adisseo-muted">
              {aquaMagazines.find((m) => m.id === magazineId)?.audience}
            </p>
          </div>

          <button
            onClick={generate}
            disabled={loading || !studioTopic.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-adisseo-crimson px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Wand2 size={16} />
            )}
            Generate leaflet
          </button>

          {response && (
            <button
              onClick={downloadPdf}
              disabled={!pdfUrl}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-adisseo-crimson px-4 py-2.5 text-sm font-semibold text-adisseo-crimson hover:bg-adisseo-crimson hover:text-white disabled:opacity-50"
            >
              <Download size={14} /> Download PDF
            </button>
          )}

          <AnchorInVault
            species="aqua"
            defaultQuery={studioTopic}
            compact
          />

          {response && (
            <ProseQualityCard
              text={collectAquaProse(response.leaflet)}
              language={(["en", "vi", "id", "th", "zh"].includes(response.leaflet.language)
                ? response.leaflet.language
                : "en") as "en" | "vi" | "id" | "th" | "zh"}
              onGateChange={(passes, score) => {
                setGatePasses(passes);
                setGateScore(score);
              }}
              compact
            />
          )}

          {response && (
            <SendToHQButton
              kind="aqua-leaflet"
              title={`Aqua leaflet · ${response.leaflet.title}`}
              summary={`${response.leaflet.language.toUpperCase()} · ${aquaMagazines.find((m) => m.id === magazineId)?.name ?? magazineId} · trust ${gateScore}/100`}
              href="/studio/aqua"
              payload={{
                language: response.leaflet.language,
                magazine: magazineId,
                topic: studioTopic,
                trustScore: gateScore,
              }}
              gateBlocked={!gatePasses}
              gateReason={gateScore < 60 ? `Trust score ${gateScore}/100 below 60.` : undefined}
            />
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </p>
          )}

          {response && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs">
              <p className="flex items-center gap-1.5 font-semibold uppercase tracking-widest text-amber-800">
                <ShieldCheck size={11} /> Brand-guardrail audit
              </p>
              <ul className="mt-2 space-y-1 text-amber-900">
                {response.leaflet.guardrailNotes.map((n, i) => (
                  <li key={i}>· {n}</li>
                ))}
              </ul>
            </div>
          )}

          {response && (
            <div className="border-t border-adisseo-line pt-3 text-[10px] text-adisseo-muted">
              Model:{" "}
              <span className="font-mono text-adisseo-ink-strong">
                {response.meta.usedModel}
              </span>
            </div>
          )}
        </aside>

        <section className="min-h-[600px] overflow-hidden rounded-2xl border border-adisseo-line bg-white shadow-sm">
          {!response && !loading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-32 text-adisseo-muted">
              <FileText size={36} />
              <p className="text-sm">Pick a topic + magazine target → generate.</p>
              <p className="text-xs">
                Output: A4 PDF leaflet, brand-styled, embedded Adisseo logo, ready to
                send to the magazine.
              </p>
            </div>
          )}

          {(loading || pdfLoading) && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-32 text-adisseo-muted">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">
                {loading ? "Drafting leaflet copy…" : "Rendering PDF…"}
              </p>
            </div>
          )}

          {response && pdfUrl && !loading && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-adisseo-line bg-adisseo-tint px-4 py-2 text-xs text-adisseo-muted">
                <span className="flex flex-wrap items-center gap-2">
                  <span>
                    {response.magazine.name} · {response.magazine.country} ·{" "}
                    <span className="font-mono">{response.leaflet.language.toUpperCase()}</span>
                  </span>
                  {pdfEngine && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        pdfEngine === "chrome"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                      title={
                        pdfEngine === "chrome"
                          ? "Rendered with Puppeteer (full CSS, TFIP template)"
                          : "Rendered with @react-pdf (fallback)"
                      }
                    >
                      {pdfEngine === "chrome" ? "Brand PDF · Chrome" : "PDF · react-pdf"}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => renderPdf(response.leaflet)}
                  className="flex items-center gap-1 hover:text-adisseo-crimson"
                  title="Re-render PDF"
                >
                  <RefreshCw size={11} /> Re-render
                </button>
              </div>
              {/* Phase 5 — inline section editor */}
              <div className="grid gap-2 border-b border-adisseo-line bg-adisseo-warmth/30 p-3 md:grid-cols-2">
                <InlineSectionEditor
                  sectionId={`aqua-title-${response.leaflet.language}`}
                  sectionLabel="Leaflet · Title"
                  value={response.leaflet.title}
                  original={response.leaflet.title}
                  language={response.leaflet.language as "en" | "vi" | "th" | "id"}
                  onChange={(next) => {
                    const merged = {
                      ...response,
                      leaflet: { ...response.leaflet, title: next },
                    };
                    setResponse(merged);
                    renderPdf(merged.leaflet);
                  }}
                  compact
                />
                <InlineSectionEditor
                  sectionId={`aqua-hero-${response.leaflet.language}`}
                  sectionLabel="Leaflet · Hero claim"
                  value={response.leaflet.heroClaim}
                  original={response.leaflet.heroClaim}
                  language={response.leaflet.language as "en" | "vi" | "th" | "id"}
                  onChange={(next) => {
                    const merged = {
                      ...response,
                      leaflet: { ...response.leaflet, heroClaim: next },
                    };
                    setResponse(merged);
                    renderPdf(merged.leaflet);
                  }}
                  compact
                />
              </div>
              <iframe
                src={pdfUrl}
                title="Aqua Leaflet preview"
                className="h-[calc(100vh-200px)] w-full border-0 bg-adisseo-tint"
              />
            </div>
          )}
        </section>
      </div>
    </main>
    </WorkspaceShell>
  );
}
