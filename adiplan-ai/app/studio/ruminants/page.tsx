"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Wand2,
  Globe,
  Users,
  Download,
  ShieldCheck,
  FileText,
  Megaphone,
} from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import {
  ruminantsAudiences,
  ruminantsCampaigns,
  type RuminantsBrochureData,
  type RuminantsLanguage,
} from "@/lib/ruminants-brochure";
import { SpeciesIcon } from "@/components/Logo";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { WorkflowRibbon } from "@/components/workspace/WorkflowRibbon";
import { SendForRegionalReviewButton } from "@/components/SendForRegionalReviewButton";
import { ProseQualityCard } from "@/components/ProseQualityCard";
import { AnchorInVault } from "@/components/AnchorInVault";
import { collectRuminantsProse } from "@/lib/studio-prose";
import { InlineSectionEditor } from "@/components/InlineSectionEditor";
import { StudioDeliverableOptions } from "@/components/StudioDeliverableOptions";

type BrochureResponse = {
  brochure: RuminantsBrochureData;
  audience: (typeof ruminantsAudiences)[number];
  campaign: (typeof ruminantsCampaigns)[number];
  meta: { usedModel: string };
};

function gateReason(score: number): string {
  if (score < 40) return `Trust score ${score}/100 — saturated, rewrite required.`;
  if (score < 60) return `Trust score ${score}/100 — below brand floor of 60.`;
  return `Score below floor.`;
}

export default function RuminantsStudioPage() {
  const studioTopic = useAdiPlanStore((s) => s.studioTopic);
  const setStudioTopic = useAdiPlanStore((s) => s.setStudioTopic);
  const match = useAdiPlanStore((s) => s.match);

  const [language, setLanguage] = useState<RuminantsLanguage>("ja");
  const [campaignId, setCampaignId] = useState<string>("camp-heat-stress");
  const [audienceId, setAudienceId] = useState<string>("aud-jp-snow-meiji");

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<BrochureResponse | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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

  useEffect(() => {
    const p = consumeStudioPrefill();
    if (!p) return;
    setBridgeContext({
      articleTitle: p.articleTitle,
      competitor: p.competitor,
      publishedAt: p.publishedAt,
    });
    if (p.ruminantsLanguage) setLanguage(p.ruminantsLanguage);
    if (p.ruminantsCampaignId) setCampaignId(p.ruminantsCampaignId);
    if (p.ruminantsAudienceId) setAudienceId(p.ruminantsAudienceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
    };
  }, []);

  const renderPdf = useCallback(async (brochure: RuminantsBrochureData) => {
    setPdfLoading(true);
    try {
      const res = await fetch("/api/render-ruminants-brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brochure }),
      });
      if (!res.ok) throw new Error("Render failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
      lastBlobRef.current = url;
      setPdfUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF render failed");
    } finally {
      setPdfLoading(false);
    }
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPdfUrl(null);
    try {
      const res = await fetch("/api/generate-ruminants-brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: studioTopic,
          language,
          campaignId,
          audienceId,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: BrochureResponse = await res.json();
      setResponse(data);
      useAdiPlanStore.getState().pushActivity({
        kind: "ruminants",
        title: `Ruminants brochure: ${data.brochure?.coverHook?.slice(0, 64) ?? campaignId}`,
        detail: `${language.toUpperCase()} · ${campaignId} · ${audienceId}`,
        href: "/studio/ruminants",
        tone: "ink",
      });
      await renderPdf(data.brochure);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [studioTopic, language, campaignId, audienceId, renderPdf]);

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `adisseo-ruminants-${language}.pdf`;
    a.click();
  };

  const audience = ruminantsAudiences.find((a) => a.id === audienceId);
  const campaign = ruminantsCampaigns.find((c) => c.id === campaignId);

  return (
    <WorkspaceShell>
    <main className="min-h-screen bg-adisseo-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <SpeciesIcon species="ruminants" size={32} className="opacity-80" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              Content Studio · Ruminants (Antoine)
            </p>
            <h1 className="font-display text-lg font-semibold text-adisseo-ink-strong">
              Manga-style 2-page brochure — Japanese dairy
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-adisseo-muted">
          <Link href="/studio/aqua" className="hover:text-adisseo-ink-strong">
            Aqua Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link href="/studio/poultry" className="hover:text-adisseo-ink-strong">
            Poultry Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link href="/studio/swine" className="hover:text-adisseo-ink-strong">
            Swine Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link href="/competitor-watch" className="hover:text-adisseo-ink-strong">
            Competitor Watch
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pt-4 lg:pt-5">
        <WorkflowRibbon />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[380px,1fr]">
        <aside className="adi-surface space-y-5 p-5">
          {(bridgeContext || match) && (
            <div className="rounded-xl border border-adisseo-crimson/30 bg-adisseo-crimson/5 p-3 text-xs">
              <p className="font-semibold uppercase tracking-widest text-adisseo-crimson">
                From Competitor Watch
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
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              <Megaphone size={11} /> Campaign
            </label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-adisseo-line p-2.5 text-sm focus:border-adisseo-crimson focus:outline-none"
            >
              {ruminantsCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {campaign && (
              <p className="mt-2 rounded-md bg-adisseo-line-soft p-2 text-[10px] text-adisseo-ink">
                Hook seed:{" "}
                <span className="font-medium text-adisseo-ink-strong">
                  {campaign.hook}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              <Users size={11} /> Audience
            </label>
            <select
              value={audienceId}
              onChange={(e) => setAudienceId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-adisseo-line p-2.5 text-sm focus:border-adisseo-crimson focus:outline-none"
            >
              <optgroup label="Integrators">
                {ruminantsAudiences
                  .filter((a) => a.type === "integrator")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Co-ops & commercial">
                {ruminantsAudiences
                  .filter((a) => a.type !== "integrator")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </optgroup>
            </select>
            {audience && (
              <p className="mt-2 rounded-md bg-adisseo-line-soft p-2 text-[10px] text-adisseo-ink">
                {audience.approachNote}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              <Globe size={11} /> Output language
            </label>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {(["ja", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`rounded-md border px-2 py-2 text-[10px] font-semibold transition ${
                    language === l
                      ? "border-adisseo-crimson bg-adisseo-crimson text-white"
                      : "border-adisseo-line text-adisseo-muted hover:text-adisseo-ink-strong"
                  }`}
                >
                  {l === "ja" ? "日本語" : "ENGLISH"}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-adisseo-muted">
              JP is the primary deliverable; EN is for global re-share.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Topic override (optional)
            </label>
            <textarea
              value={studioTopic}
              onChange={(e) => setStudioTopic(e.target.value)}
              placeholder="Leave blank to use campaign hook as topic seed"
              rows={2}
              className="mt-1 w-full rounded-lg border border-adisseo-line p-3 text-sm focus:border-adisseo-crimson focus:outline-none"
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-adisseo-crimson px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Wand2 size={16} />
            )}
            Generate manga brochure
          </button>

          <StudioDeliverableOptions
            options={[
              {
                label: "Manga-style brochure",
                detail: "Live generator in this studio.",
                active: true,
              },
              {
                label: "Technical article",
                detail: "Same proof stack, magazine-ready prose.",
                active: true,
              },
              {
                label: "Email blast",
                detail: "Switch to poultry pack for sales enablement email.",
                href: "/studio/poultry",
              },
              {
                label: "Infographic / carousel",
                detail: "Switch to poultry for the 5-slide visual path.",
                href: "/studio/poultry",
              },
              {
                label: "Video script",
                detail: "Switch to swine short for storyboard + voiceover.",
                href: "/studio/swine",
              },
            ]}
          />

          {response && (
            <button
              onClick={downloadPdf}
              disabled={!pdfUrl}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-adisseo-crimson px-4 py-2.5 text-sm font-semibold text-adisseo-crimson hover:bg-adisseo-crimson hover:text-white disabled:opacity-50"
            >
              <Download size={14} /> Download PDF
            </button>
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
                {response.brochure.guardrailNotes.map((n, i) => (
                  <li key={i}>· {n}</li>
                ))}
              </ul>
            </div>
          )}

          <AnchorInVault
            species="ruminants"
            defaultQuery={studioTopic || "Hokkaido heat-stress"}
            compact
          />

          {response && (
            <ProseQualityCard
              text={collectRuminantsProse(response.brochure)}
              language={(response.brochure.language === "ja" ? "ja" : "en") as "ja" | "en"}
              onGateChange={(passes, score) => {
                setGatePasses(passes);
                setGateScore(score);
              }}
              compact
            />
          )}

          {response && (
            <SendForRegionalReviewButton
              kind="ruminants-brochure"
              title={`Ruminants manga · ${response.brochure.topic ?? "Hokkaido"}`}
              summary={`${(response.brochure.language ?? "ja").toUpperCase()} · manga 2-page brochure · trust ${gateScore}/100`}
              href="/studio/ruminants"
              payload={{
                language: response.brochure.language,
                topic: response.brochure.topic,
                trustScore: gateScore,
              }}
              gateBlocked={!gatePasses}
              gateReason={gateReason(gateScore)}
            />
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

        <section className="adi-surface min-h-[600px] overflow-hidden">
          {!response && !loading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-32 text-adisseo-muted">
              <FileText size={36} />
              <p className="text-sm">
                Pick a campaign + audience → generate the manga brochure.
              </p>
              <p className="text-[11px] text-adisseo-muted-soft">
                2-page A4 PDF · cover panel + 4-panel narrative spread
              </p>
            </div>
          )}

          {(loading || pdfLoading) && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-32 text-adisseo-muted">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">
                {loading ? "Drafting brochure copy…" : "Rendering PDF…"}
              </p>
            </div>
          )}

          {response && pdfUrl && !loading && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-adisseo-line bg-adisseo-line-soft/40 px-4 py-2 text-xs text-adisseo-muted">
                <span>
                  Cover title:{" "}
                  <span className="font-medium text-adisseo-ink-strong">
                    {response.brochure.coverTitle}
                  </span>
                </span>
                <span>
                  {response.audience.name} · {response.audience.region}
                </span>
                <Link
                  href={pdfUrl}
                  target="_blank"
                  className="flex items-center gap-1 text-adisseo-crimson hover:underline"
                >
                  Open in new tab <ArrowRight size={12} />
                </Link>
              </div>
              {/* Phase 5 — inline section editor */}
              <div className="grid gap-2 border-b border-adisseo-line bg-adisseo-warmth/30 p-3 md:grid-cols-2">
                <InlineSectionEditor
                  sectionId={`ruminants-cover-${response.brochure.language}`}
                  sectionLabel="Brochure · Cover title"
                  value={response.brochure.coverTitle}
                  original={response.brochure.coverTitle}
                  language={response.brochure.language === "ja" ? "en" : "en"}
                  onChange={(next) => {
                    const merged = {
                      ...response,
                      brochure: { ...response.brochure, coverTitle: next },
                    };
                    setResponse(merged);
                    renderPdf(merged.brochure);
                  }}
                  compact
                />
                <InlineSectionEditor
                  sectionId={`ruminants-hook-${response.brochure.language}`}
                  sectionLabel="Brochure · Cover hook"
                  value={response.brochure.coverHook}
                  original={response.brochure.coverHook}
                  language={response.brochure.language === "ja" ? "en" : "en"}
                  onChange={(next) => {
                    const merged = {
                      ...response,
                      brochure: { ...response.brochure, coverHook: next },
                    };
                    setResponse(merged);
                    renderPdf(merged.brochure);
                  }}
                  compact
                />
              </div>
              <iframe
                src={pdfUrl}
                className="flex-1 w-full"
                style={{ minHeight: "780px" }}
                title="Ruminants brochure preview"
              />
            </div>
          )}
        </section>
      </div>
    </main>
    </WorkspaceShell>
  );
}
