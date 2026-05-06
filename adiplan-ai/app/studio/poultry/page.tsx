"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Wand2,
  Mail,
  Image as ImageIcon,
  Download,
  Copy,
  Send,
  ShieldCheck,
  Target,
  Users,
  RefreshCw,
  Presentation,
} from "lucide-react";
import {
  poultryCampaigns,
  poultryAudiences,
  type PoultryDeliverablePack,
} from "@/lib/poultry-pack";
import { SpeciesIcon } from "@/components/Logo";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { WorkflowRibbon } from "@/components/workspace/WorkflowRibbon";
import { SendForRegionalReviewButton } from "@/components/SendForRegionalReviewButton";
import { ProseQualityCard } from "@/components/ProseQualityCard";
import { AnchorInVault } from "@/components/AnchorInVault";
import { InlineSectionEditor } from "@/components/InlineSectionEditor";
import { StudioDeliverableOptions } from "@/components/StudioDeliverableOptions";
import { collectPoultryProse } from "@/lib/studio-prose";
import { useAdiPlanStore } from "@/lib/store";

type PackResponse = {
  pack: PoultryDeliverablePack;
  campaign: { id: string; name: string; blurb: string };
  audience: {
    id: string;
    name: string;
    country: string;
    segment: "integrator" | "commercial-farm";
  };
  meta: { usedModel: string };
};

export default function PoultryStudioPage() {
  const [campaignId, setCampaignId] = useState("agp-free-asia");
  const [audienceId, setAudienceId] = useState("integrator-cp");
  const [tab, setTab] = useState<"email" | "carousel">("email");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<PackResponse | null>(null);
  const [editedPack, setEditedPack] = useState<PoultryDeliverablePack | null>(null);
  const [emailHtml, setEmailHtml] = useState<string | null>(null);
  const [carouselUrl, setCarouselUrl] = useState<string | null>(null);
  const [renderingEmail, setRenderingEmail] = useState(false);
  const [renderingCarousel, setRenderingCarousel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);
  const [gatePasses, setGatePasses] = useState(true);
  const [gateScore, setGateScore] = useState(100);
  const [pptxLoading, setPptxLoading] = useState(false);
  const lastBlobRef = useRef<string | null>(null);

  const consumeStudioPrefill = useAdiPlanStore((s) => s.consumeStudioPrefill);
  const match = useAdiPlanStore((s) => s.match);
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
    if (p.poultryCampaignId) setCampaignId(p.poultryCampaignId);
    if (p.poultryAudienceId) setAudienceId(p.poultryAudienceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
    };
  }, []);

  const renderEmail = useCallback(async (pack: PackResponse, packOverride?: PoultryDeliverablePack) => {
    setRenderingEmail(true);
    try {
      const res = await fetch("/api/render-poultry-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: packOverride ?? pack.pack,
          campaignName: `APAC AI · ${pack.campaign.name}`,
          audienceLabel: `${pack.audience.name} · ${pack.audience.country}`,
        }),
      });
      if (!res.ok) throw new Error("Email render failed");
      setEmailHtml(await res.text());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Email render failed");
    } finally {
      setRenderingEmail(false);
    }
  }, []);

  const renderCarousel = useCallback(async (pack: PackResponse, packOverride?: PoultryDeliverablePack) => {
    setRenderingCarousel(true);
    try {
      const res = await fetch("/api/render-poultry-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: packOverride ?? pack.pack,
          campaignName: `Adisseo Poultry APAC · ${pack.campaign.name}`,
        }),
      });
      if (!res.ok) throw new Error("Carousel render failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
      lastBlobRef.current = url;
      setCarouselUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Carousel render failed");
    } finally {
      setRenderingCarousel(false);
    }
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEmailHtml(null);
    setCarouselUrl(null);
    try {
      const res = await fetch("/api/generate-poultry-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, audienceId }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: PackResponse = await res.json();
      setResponse(data);
      setEditedPack(data.pack);
      useAdiPlanStore.getState().pushActivity({
        kind: "poultry",
        title: `Poultry pack: ${data.pack?.email?.subject?.slice(0, 64) ?? campaignId}`,
        detail: `Email + carousel · ${audienceId}`,
        href: "/studio/poultry",
        tone: "cyan",
      });
      // Render both in parallel — keep things snappy
      await Promise.all([renderEmail(data), renderCarousel(data)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [campaignId, audienceId, renderEmail, renderCarousel]);

  const copyHtml = async () => {
    if (!emailHtml) return;
    await navigator.clipboard.writeText(emailHtml);
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 1800);
  };

  const downloadEmail = () => {
    if (!emailHtml) return;
    const blob = new Blob([emailHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adisseo-poultry-${response?.campaign.id ?? "campaign"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCarousel = () => {
    if (!carouselUrl) return;
    const a = document.createElement("a");
    a.href = carouselUrl;
    a.download = `adisseo-poultry-carousel-${response?.campaign.id ?? "campaign"}.pdf`;
    a.click();
  };

  const downloadPptx = async () => {
    if (!response) return;
    setPptxLoading(true);
    try {
      const res = await fetch("/api/render-poultry-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          audienceId,
          brandSubtitle: `${response.campaign.name} · ${response.audience.name}`,
        }),
      });
      if (!res.ok) {
        let msg = "PPTX export failed";
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `adisseo-poultry-${campaignId}-${audienceId}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PPTX export failed");
    } finally {
      setPptxLoading(false);
    }
  };

  const sendTest = () => {
    if (!response) return;
    const subject = encodeURIComponent(response.pack.email.subject);
    const body = encodeURIComponent(
      `${response.pack.email.greeting}\n\n${response.pack.email.intro}\n\n— Generated by APAC AI`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <WorkspaceShell>
    <main className="min-h-screen bg-adisseo-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <SpeciesIcon species="poultry" size={32} className="opacity-80" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              Content Studio · Poultry (Vish)
            </p>
            <h1 className="font-display text-lg font-semibold text-adisseo-ink-strong">
              AGP-Free Asia · email blast + LinkedIn carousel
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-adisseo-muted">
          <Link href="/studio/aqua" className="hover:text-adisseo-ink-strong">
            Aqua Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link href="/studio/ruminants" className="hover:text-adisseo-ink-strong">
            Ruminants Studio
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
              <Target size={11} /> Campaign
            </label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-adisseo-line p-2.5 text-sm focus:border-adisseo-crimson focus:outline-none"
            >
              {poultryCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-adisseo-muted">
              {poultryCampaigns.find((c) => c.id === campaignId)?.blurb}
            </p>
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
                {poultryAudiences
                  .filter((a) => a.segment === "integrator")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.country})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Commercial farms">
                {poultryAudiences
                  .filter((a) => a.segment === "commercial-farm")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.country})
                    </option>
                  ))}
              </optgroup>
            </select>
            <p className="mt-1 text-[10px] text-adisseo-muted">
              {poultryAudiences.find((a) => a.id === audienceId)?.approachNote}
            </p>
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
            Generate pack (email + carousel)
          </button>

          <StudioDeliverableOptions
            options={[
              {
                label: "Email blast",
                detail: "Live generator in this studio.",
                active: true,
              },
              {
                label: "LinkedIn carousel",
                detail: "Live 5-slide PDF + editable PowerPoint export.",
                active: true,
              },
              {
                label: "Manga-style brochure",
                detail: "Use the same CBI/persona frame in the ruminants format.",
                href: "/studio/ruminants",
              },
              {
                label: "Technical leaflet / article",
                detail: "Use the aqua leaflet flow for magazine-ready copy.",
                href: "/studio/aqua",
              },
              {
                label: "Video script",
                detail: "Use the swine short flow for storyboard + voiceover.",
                href: "/studio/swine",
              },
            ]}
          />

          {response && (
            <>
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  Email actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={copyHtml}
                    disabled={!emailHtml}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-adisseo-line px-2 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson disabled:opacity-40"
                  >
                    <Copy size={12} /> {copyOk ? "Copied!" : "Copy HTML"}
                  </button>
                  <button
                    onClick={downloadEmail}
                    disabled={!emailHtml}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-adisseo-line px-2 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson disabled:opacity-40"
                  >
                    <Download size={12} /> Download .html
                  </button>
                </div>
                <button
                  onClick={sendTest}
                  disabled={!response}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-adisseo-crimson px-2 py-2 text-xs font-semibold text-adisseo-crimson hover:bg-adisseo-crimson hover:text-white disabled:opacity-40"
                >
                  <Send size={12} /> Send a test (open mail client)
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  Carousel actions
                </p>
                <button
                  onClick={downloadCarousel}
                  disabled={!carouselUrl}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-adisseo-crimson px-3 py-2 text-xs font-semibold text-adisseo-crimson hover:bg-adisseo-crimson hover:text-white disabled:opacity-40"
                >
                  <Download size={12} /> Download 5-slide PDF
                </button>
                <button
                  onClick={() => void downloadPptx()}
                  disabled={pptxLoading}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-adisseo-line px-3 py-2 text-xs font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson hover:text-adisseo-crimson disabled:opacity-40"
                  title="Editable deck — species managers tweak slides in PowerPoint"
                >
                  {pptxLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Presentation size={12} />
                  )}{" "}
                  Download PowerPoint (.pptx)
                </button>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs">
                <p className="flex items-center gap-1.5 font-semibold uppercase tracking-widest text-amber-800">
                  <ShieldCheck size={11} /> Brand-guardrail audit
                </p>
                <ul className="mt-2 space-y-1 text-amber-900">
                  {response.pack.guardrailNotes.map((n, i) => (
                    <li key={i}>· {n}</li>
                  ))}
                </ul>
              </div>

              <AnchorInVault species="poultry" defaultQuery={response.pack.email.subject} compact />

              <ProseQualityCard
                text={collectPoultryProse(response.pack)}
                language="en"
                onGateChange={(passes, score) => {
                  setGatePasses(passes);
                  setGateScore(score);
                }}
                compact
              />

              <SendForRegionalReviewButton
                kind="poultry-pack"
                title={`Poultry pack · ${response.pack.email.subject}`}
                summary={`Audience ${response.pack.audienceId} · campaign ${response.pack.campaignId} · email + 5-slide carousel · trust ${gateScore}/100`}
                href="/studio/poultry"
                payload={{
                  campaign: response.pack.campaignId,
                  audience: response.pack.audienceId,
                  trustScore: gateScore,
                }}
                gateBlocked={!gatePasses}
                gateReason={gateScore < 60 ? `Trust score ${gateScore}/100 below 60.` : undefined}
              />


              <div className="border-t border-adisseo-line pt-3 text-[10px] text-adisseo-muted">
                Model:{" "}
                <span className="font-mono text-adisseo-ink-strong">
                  {response.meta.usedModel}
                </span>
              </div>
            </>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </p>
          )}
        </aside>

        <section className="adi-surface min-h-[600px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-adisseo-line bg-adisseo-tint px-2 py-1">
            <div className="flex">
              {(
                [
                  { key: "email", label: "Email blast", icon: Mail },
                  { key: "carousel", label: "LinkedIn carousel", icon: ImageIcon },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      tab === t.key
                        ? "bg-white text-adisseo-crimson shadow-adi-card"
                        : "text-adisseo-muted hover:text-adisseo-ink-strong"
                    }`}
                  >
                    <Icon size={12} /> {t.label}
                  </button>
                );
              })}
            </div>
            {response && (
              <button
                onClick={() => {
                  if (tab === "email") renderEmail(response, editedPack ?? undefined);
                  else renderCarousel(response, editedPack ?? undefined);
                }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-adisseo-muted hover:text-adisseo-crimson"
              >
                <RefreshCw size={10} /> Re-render
              </button>
            )}
          </div>

          {/* Phase 5 — Inline section editor strip */}
          {response && editedPack && (
            <div className="space-y-2 border-b border-adisseo-line bg-adisseo-warmth/30 px-3 py-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-adisseo-muted">
                <span className="font-bold">Edit before render</span>
                <span>Manual · AI rewrite · Translate (EN / VI / TH / ID / ZH)</span>
              </div>
              {tab === "email" ? (
                <div className="grid gap-2 md:grid-cols-2">
                  <InlineSectionEditor
                    sectionId={`email-subject-${response.pack.campaignId}`}
                    sectionLabel="Email subject"
                    value={editedPack.email.subject}
                    original={response.pack.email.subject}
                    onChange={(next) => {
                      const merged: PoultryDeliverablePack = {
                        ...editedPack,
                        email: { ...editedPack.email, subject: next },
                      };
                      setEditedPack(merged);
                      renderEmail(response, merged);
                    }}
                    compact
                  />
                  <InlineSectionEditor
                    sectionId={`email-intro-${response.pack.campaignId}`}
                    sectionLabel="Email intro"
                    value={editedPack.email.intro}
                    original={response.pack.email.intro}
                    onChange={(next) => {
                      const merged: PoultryDeliverablePack = {
                        ...editedPack,
                        email: { ...editedPack.email, intro: next },
                      };
                      setEditedPack(merged);
                      renderEmail(response, merged);
                    }}
                    compact
                  />
                </div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  <InlineSectionEditor
                    sectionId={`carousel-cover-${response.pack.campaignId}`}
                    sectionLabel="Carousel · Slide 1 (Hook)"
                    value={editedPack.carousel[0]?.headline ?? ""}
                    original={response.pack.carousel[0]?.headline ?? ""}
                    onChange={(next) => {
                      const merged: PoultryDeliverablePack = {
                        ...editedPack,
                        carousel: editedPack.carousel.map((s, i) =>
                          i === 0 ? { ...s, headline: next } : s
                        ),
                      };
                      setEditedPack(merged);
                      renderCarousel(response, merged);
                    }}
                    compact
                  />
                  <InlineSectionEditor
                    sectionId={`carousel-cta-${response.pack.campaignId}`}
                    sectionLabel="Carousel · Final CTA"
                    value={editedPack.carousel[editedPack.carousel.length - 1]?.headline ?? ""}
                    original={response.pack.carousel[response.pack.carousel.length - 1]?.headline ?? ""}
                    onChange={(next) => {
                      const merged: PoultryDeliverablePack = {
                        ...editedPack,
                        carousel: editedPack.carousel.map((s, i) =>
                          i === editedPack.carousel.length - 1 ? { ...s, headline: next } : s
                        ),
                      };
                      setEditedPack(merged);
                      renderCarousel(response, merged);
                    }}
                    compact
                  />
                </div>
              )}
            </div>
          )}

          {!response && !loading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-32 text-adisseo-muted">
              <Mail size={36} />
              <p className="text-sm">
                Pick a campaign + audience → generate the matched pack.
              </p>
              <p className="max-w-md text-center text-xs">
                Output: a brand-styled HTML email + a 5-slide square LinkedIn
                carousel PDF, both grounded in the same trial-data narrative.
              </p>
            </div>
          )}

          {(loading || (tab === "email" ? renderingEmail : renderingCarousel)) && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-32 text-adisseo-muted">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">
                {loading ? "Drafting pack…" : tab === "email" ? "Rendering email…" : "Rendering carousel PDF…"}
              </p>
            </div>
          )}

          {!loading && tab === "email" && emailHtml && (
            <iframe
              srcDoc={emailHtml}
              title="Email preview"
              className="h-[calc(100vh-200px)] w-full border-0 bg-adisseo-tint"
            />
          )}

          {!loading && tab === "carousel" && carouselUrl && (
            <iframe
              src={carouselUrl}
              title="Carousel preview"
              className="h-[calc(100vh-200px)] w-full border-0 bg-adisseo-tint"
            />
          )}
        </section>
      </div>
    </main>
    </WorkspaceShell>
  );
}
