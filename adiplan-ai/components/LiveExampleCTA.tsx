"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import { deriveStudioContext } from "@/lib/studio-context";
import type { ScrapedArticle } from "@/lib/scraper-api";

const EXAMPLES: {
  id: string;
  articleId: string;
  label: string;
  preview: string;
  destination: string;
}[] = [
  {
    id: "kemin-agp",
    articleId: "art-006",
    label: "Kemin × AGP-Free Indonesia → Poultry email + carousel",
    preview:
      "Kemin signs 3 ID premixers for AGP-free poultry — BPOM regulatory tailwind",
    destination: "/studio/poultry",
  },
  {
    id: "skretting-pangasius",
    articleId: "art-008",
    label: "Skretting × pangasius VN → Aqua leaflet (Vietnamese)",
    preview:
      "Skretting launches shrimp gut-health probiotic in VN pangasius market",
    destination: "/studio/aqua",
  },
  {
    id: "basf-heat",
    articleId: "art-005",
    label: "BASF × heat-stress NZ → Ruminants manga brochure (JP)",
    preview:
      "BASF Lutavit Vita-mix for heat-stress ruminants — pasture demonstrators",
    destination: "/studio/ruminants",
  },
  {
    id: "cargill-wechat",
    articleId: "art-003",
    label: "Cargill × WeChat ASF → Swine vertical short (Mandarin)",
    preview:
      "Cargill 6-episode WeChat livestream on ASF biosecurity — 18k viewers",
    destination: "/studio/swine",
  },
];

export function LiveExampleCTA() {
  const router = useRouter();
  const setMatch = useAdiPlanStore((s) => s.setMatch);
  const setSelectedArticle = useAdiPlanStore((s) => s.setSelectedArticle);
  const setStudioTopic = useAdiPlanStore((s) => s.setStudioTopic);
  const setStudioPrefill = useAdiPlanStore((s) => s.setStudioPrefill);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runExample = async (ex: (typeof EXAMPLES)[number]) => {
    setLoadingId(ex.id);
    setError(null);
    try {
      const articleRes = await fetch(`/api/articles`);
      const articleData = (await articleRes.json()) as { articles: ScrapedArticle[] };
      const article = articleData.articles.find((a) => a.id === ex.articleId);
      if (!article) throw new Error(`Article ${ex.articleId} not found`);

      const matchRes = await fetch("/api/match-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: ex.articleId }),
      });
      if (!matchRes.ok) throw new Error("Match failed");
      const matchData = await matchRes.json();

      setSelectedArticle(article.id);
      setMatch(matchData.match);
      setStudioTopic(article.title);

      const hints = deriveStudioContext(article, matchData.match);
      setStudioPrefill({
        articleTitle: article.title,
        competitor: article.competitor,
        publishedAt: article.publishedAt,
        aquaLanguage: hints.aquaLanguage,
        aquaMagazineId: hints.aquaMagazineId,
        poultryCampaignId: hints.poultryCampaignId,
        poultryAudienceId: hints.poultryAudienceId,
        ruminantsLanguage: hints.ruminantsLanguage,
        ruminantsCampaignId: hints.ruminantsCampaignId,
        ruminantsAudienceId: hints.ruminantsAudienceId,
        swineLanguage: hints.swineLanguage,
        swineAccountId: hints.swineAccountId,
      });

      router.push(ex.destination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run example");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-adisseo-crimson/30 bg-adisseo-crimson/5 p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
        <Play size={12} /> Run a live example
      </p>
      <p className="mt-1 text-sm text-adisseo-ink">
        One click runs the full pipeline against a seeded competitor article — match,
        derive CBI &amp; persona, route to the right Studio with the campaign and
        audience pre-selected. The Studio just needs &ldquo;Generate.&rdquo;
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {EXAMPLES.map((ex) => {
          const loading = loadingId === ex.id;
          return (
            <button
              key={ex.id}
              onClick={() => runExample(ex)}
              disabled={loadingId !== null}
              className="group flex items-start gap-3 rounded-xl border border-adisseo-line bg-white p-3 text-left transition hover:border-adisseo-crimson hover:shadow disabled:opacity-50"
            >
              <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-adisseo-crimson text-white">
                {loading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Play size={11} className="ml-0.5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-adisseo-ink-strong">
                  {ex.label}
                </span>
                <span className="block truncate text-[10px] text-adisseo-muted">
                  {ex.preview}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
