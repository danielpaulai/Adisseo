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
} from "lucide-react";
import {
  poultryCampaigns,
  poultryAudiences,
  type PoultryDeliverablePack,
} from "@/lib/poultry-pack";
import { Logo, SpeciesIcon } from "@/components/Logo";
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
  const [emailHtml, setEmailHtml] = useState<string | null>(null);
  const [carouselUrl, setCarouselUrl] = useState<string | null>(null);
  const [renderingEmail, setRenderingEmail] = useState(false);
  const [renderingCarousel, setRenderingCarousel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);
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

  const renderEmail = useCallback(async (pack: PackResponse) => {
    setRenderingEmail(true);
    try {
      const res = await fetch("/api/render-poultry-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: pack.pack,
          campaignName: `AdiPlan AI · ${pack.campaign.name}`,
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

  const renderCarousel = useCallback(async (pack: PackResponse) => {
    setRenderingCarousel(true);
    try {
      const res = await fetch("/api/render-poultry-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: pack.pack,
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

  const sendTest = () => {
    if (!response) return;
    const subject = encodeURIComponent(response.pack.email.subject);
    const body = encodeURIComponent(
      `${response.pack.email.greeting}\n\n${response.pack.email.intro}\n\n— Generated by AdiPlan AI`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="h-6 w-px bg-adisseo-line" />
          <SpeciesIcon species="poultry" size={32} className="opacity-80" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              Content Studio · Poultry (Vish)
            </p>
            <h1 className="text-lg font-semibold text-adisseo-ink-strong">
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
          <Link href="/news-bridge" className="hover:text-adisseo-ink-strong">
            News bridge
          </Link>
        </div>
      </header>

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

        <section className="min-h-[600px] overflow-hidden rounded-2xl border border-adisseo-line bg-white shadow-sm">
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
                        ? "bg-white text-adisseo-crimson shadow-sm"
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
                  if (tab === "email") renderEmail(response);
                  else renderCarousel(response);
                }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-adisseo-muted hover:text-adisseo-crimson"
              >
                <RefreshCw size={10} /> Re-render
              </button>
            )}
          </div>

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
  );
}
