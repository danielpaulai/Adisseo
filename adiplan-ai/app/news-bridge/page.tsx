"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Newspaper, Sparkles, Target, Users, Layers } from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import type { ScrapedArticle } from "@/lib/scraper-api";
import { Logo } from "@/components/Logo";
import { deriveStudioContext } from "@/lib/studio-context";

type MatchResponse = {
  article: ScrapedArticle;
  match: {
    articleId: string;
    cbi: string;
    cbiId: string;
    cbiRationale: string;
    persona: string;
    personaId: string;
    personaRationale: string;
    recommendedFormats: string[];
    recommendedFormatIds: string[];
    speciesFit: ("aqua" | "poultry" | "ruminants" | "swine")[];
    matchedAt: string;
  };
  meta: { usedModel: string };
};

export default function NewsBridgePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ScrapedArticle[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [response, setResponse] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setSelectedArticle = useAdiPlanStore((s) => s.setSelectedArticle);
  const setMatch = useAdiPlanStore((s) => s.setMatch);
  const setStudioTopic = useAdiPlanStore((s) => s.setStudioTopic);
  const setStudioPrefill = useAdiPlanStore((s) => s.setStudioPrefill);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => setArticles(data.articles))
      .catch(() => setError("Could not load articles"));
  }, []);

  const matchArticle = async (article: ScrapedArticle) => {
    setLoadingMatch(true);
    setResponse(null);
    setError(null);
    setSelectedArticle(article.id);
    try {
      const res = await fetch("/api/match-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      });
      if (!res.ok) throw new Error("Match failed");
      const data: MatchResponse = await res.json();
      setResponse(data);
      setMatch(data.match);
      setStudioTopic(article.title);

      // Derive cross-module hand-off — every Studio will pre-fill from this.
      const hints = deriveStudioContext(article, data.match);
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
    } catch {
      setError("Match request failed. Check API keys or try again.");
    } finally {
      setLoadingMatch(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="h-6 w-px bg-adisseo-line" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              The Bridge &middot; News &rarr; Strategy
            </p>
            <h1 className="text-lg font-semibold text-adisseo-ink-strong">
              Match a competitor article to AdiPlan
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-adisseo-muted">
          {response?.meta.usedModel && (
            <span className="rounded-full bg-slate-100 px-2 py-1">
              model: {response.meta.usedModel}
            </span>
          )}
          <Link
            href="/studio/aqua"
            className="rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            Aqua
          </Link>
          <Link
            href="/studio/poultry"
            className="rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            Poultry
          </Link>
          <Link
            href="/studio/ruminants"
            className="rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
          >
            Ruminants
          </Link>
          <Link
            href="/studio/swine"
            className="flex items-center gap-2 rounded-md bg-adisseo-crimson px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Swine Studio
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr,1.2fr]">
        <section>
          <div className="mb-4 flex items-center gap-2 text-adisseo-muted">
            <Newspaper size={16} />
            <p className="text-sm font-medium">
              Latest from the competitor scraper
            </p>
            <span className="text-xs">({articles.length} articles)</span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <ul className="space-y-3">
            {articles.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-adisseo-line bg-white p-4 shadow-sm transition hover:border-adisseo-crimson"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold uppercase tracking-widest text-adisseo-crimson">
                        {a.competitor}
                      </span>
                      <span className="text-adisseo-muted">&middot;</span>
                      <span className="text-adisseo-muted">{a.publishedAt}</span>
                      <span className="text-adisseo-muted">&middot;</span>
                      <span className="text-adisseo-muted">{a.region}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-semibold leading-snug text-adisseo-ink">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-xs text-adisseo-muted">{a.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.species.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-adisseo-crimson/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-adisseo-crimson"
                        >
                          {s}
                        </span>
                      ))}
                      {a.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-adisseo-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => matchArticle(a)}
                    disabled={loadingMatch}
                    className="flex flex-none items-center gap-1.5 rounded-md bg-adisseo-crimson px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {loadingMatch ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Match
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-adisseo-line bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-adisseo-muted">
              <Sparkles size={16} />
              <p className="text-sm font-medium">AdiPlan match result</p>
            </div>

            {!response && !loadingMatch && (
              <p className="py-12 text-center text-sm text-adisseo-muted">
                Click <span className="font-semibold">Match</span> on any article &mdash;
                AdiPlan will return the CBI it surfaces, the persona to target, and three
                deliverable formats.
              </p>
            )}

            {loadingMatch && (
              <div className="flex flex-col items-center gap-3 py-12 text-adisseo-muted">
                <Loader2 size={28} className="animate-spin" />
                <p className="text-sm">Reasoning over the AdiPlan framework&hellip;</p>
              </div>
            )}

            {response && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                    Article
                  </p>
                  <h2 className="mt-1 text-base font-semibold leading-snug text-adisseo-ink">
                    {response.article.title}
                  </h2>
                  <p className="text-xs text-adisseo-muted">
                    {response.article.competitor} &middot; {response.article.publishedAt}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-adisseo-line p-4">
                    <div className="flex items-center gap-2 text-adisseo-crimson">
                      <Target size={14} />
                      <p className="text-[10px] font-semibold uppercase tracking-widest">
                        Critical Business Issue
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-adisseo-ink">
                      {response.match.cbi}
                    </p>
                    <p className="mt-1 text-xs text-adisseo-muted">
                      {response.match.cbiRationale}
                    </p>
                  </div>
                  <div className="rounded-xl border border-adisseo-line p-4">
                    <div className="flex items-center gap-2 text-adisseo-crimson">
                      <Users size={14} />
                      <p className="text-[10px] font-semibold uppercase tracking-widest">
                        Target Persona
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-adisseo-ink">
                      {response.match.persona}
                    </p>
                    <p className="mt-1 text-xs text-adisseo-muted">
                      {response.match.personaRationale}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-adisseo-line p-4">
                  <div className="flex items-center gap-2 text-adisseo-crimson">
                    <Layers size={14} />
                    <p className="text-[10px] font-semibold uppercase tracking-widest">
                      Recommended Deliverables
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {response.match.recommendedFormats.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-adisseo-ink"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-adisseo-crimson/10 text-[10px] font-bold text-adisseo-crimson">
                          {i + 1}
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strategic-frame composer hand-off */}
                <button
                  onClick={() => router.push("/strategic-frame")}
                  className="group flex w-full items-center justify-between rounded-xl border border-adisseo-crimson bg-adisseo-crimson/5 p-4 text-left transition hover:bg-adisseo-crimson hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson group-hover:text-white">
                        Strategic Frame · Total Value Solution
                      </p>
                      <p className="text-sm font-semibold text-adisseo-ink-strong group-hover:text-white">
                        Compose the AdiPlan answer before the species deliverables ship
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-adisseo-crimson group-hover:text-white" />
                </button>

                <div className="flex items-center justify-between border-t border-adisseo-line pt-4">
                  <div className="text-xs text-adisseo-muted">
                    Species fit: {response.match.speciesFit.join(", ") || "n/a"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {response.match.speciesFit.includes("aqua") && (
                      <button
                        onClick={() => router.push("/studio/aqua")}
                        className="flex items-center gap-2 rounded-md bg-adisseo-crimson px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                      >
                        Open Aqua Studio &rarr;
                      </button>
                    )}
                    {response.match.speciesFit.includes("poultry") && (
                      <button
                        onClick={() => router.push("/studio/poultry")}
                        className="flex items-center gap-2 rounded-md bg-adisseo-crimson px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                      >
                        Open Poultry Studio &rarr;
                      </button>
                    )}
                    {response.match.speciesFit.includes("ruminants") && (
                      <button
                        onClick={() => router.push("/studio/ruminants")}
                        className="flex items-center gap-2 rounded-md bg-adisseo-crimson px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                      >
                        Open Ruminants Studio &rarr;
                      </button>
                    )}
                    {response.match.speciesFit.includes("swine") && (
                      <button
                        onClick={() => router.push("/studio/swine")}
                        className="flex items-center gap-2 rounded-md bg-adisseo-crimson px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                      >
                        Open Swine Studio &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
