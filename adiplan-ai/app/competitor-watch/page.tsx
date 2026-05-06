"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  ExternalLink,
  FileDown,
  Filter,
  Loader2,
  Newspaper,
  Sparkles,
  Target,
  Users,
  Layers,
  RefreshCw,
  Radio,
  AlertTriangle,
  Clapperboard,
} from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import type { ScrapedArticle, Species } from "@/lib/scraper-api";
import {
  deriveStudioContext,
  primaryStudioHrefFromSpeciesFit,
  studioLabelShort,
  primarySpeciesFromFit,
} from "@/lib/studio-context";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { WorkflowRibbon } from "@/components/workspace/WorkflowRibbon";
import { toast } from "sonner";
import {
  scoreArticle,
  buildComparisonGrid,
  type LlmHints,
} from "@/lib/news-scorer";
import { downloadArticleAnalysisPack } from "@/lib/article-analysis-pack";
import { ThreeAxisRadar } from "@/components/ThreeAxisRadar";
import { DecisionMatrixFlow } from "@/components/DecisionMatrixFlow";
import { ComparisonHeatGrid } from "@/components/ComparisonHeatGrid";
import type { PersonaId } from "@/lib/personas-matrix";
import { ArticleWordCloud } from "@/components/ArticleWordCloud";
import {
  buildWordCloudEntries,
  looksLikeTruncatedExcerpt,
} from "@/lib/article-analytics";
import { rollupCompetitorCorpus } from "@/lib/competitor-corpus-rollup";
import { COMPETITOR_WATCH_PATH, MARKETING_PLAN_PATH } from "@/lib/routes";

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

type FeedMeta = {
  source: "live" | "live-cache" | "live-failed-fallback" | "demo";
  count: number;
  fetchedAt: string;
  warning?: string;
};

type DayWindow = "30" | "90" | "365" | "all";

function parseArticleDate(publishedAt: string): number {
  const t = Date.parse(publishedAt);
  return Number.isFinite(t) ? t : Date.now();
}

function normalizeSourceHref(url: string): string {
  const raw = url.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^\/\//.test(raw)) return `https:${raw}`;
  return `https://${raw}`;
}

function downloadArticleTxt(a: ScrapedArticle) {
  const lines = [
    `TITLE: ${a.title}`,
    `SOURCE: ${a.competitor}`,
    `DATE: ${a.publishedAt}`,
    `REGION: ${a.region}`,
    `SPECIES: ${a.species.join(", ")}`,
    `URL: ${a.url || "(no url)"}`,
    "",
    "SUMMARY:",
    a.summary,
    "",
    "---",
    "Downloaded from AdiPlan AI · Competitor Watch",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = url;
  el.download = `${a.competitor.replace(/\s+/g, "-").toLowerCase()}-${a.id.slice(0, 8)}.txt`;
  el.click();
  URL.revokeObjectURL(url);
}

function CompetitorWatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<ScrapedArticle[]>([]);
  const [feedMeta, setFeedMeta] = useState<FeedMeta | null>(null);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [response, setResponse] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dayWindow, setDayWindow] = useState<DayWindow>("90");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [competitorFocus, setCompetitorFocus] = useState<Set<string>>(
    () => new Set()
  );

  const [compareOpen, setCompareOpen] = useState(false);

  const setSelectedArticle = useAdiPlanStore((s) => s.setSelectedArticle);
  const setMatch = useAdiPlanStore((s) => s.setMatch);
  const setStudioTopic = useAdiPlanStore((s) => s.setStudioTopic);
  const setStudioPrefill = useAdiPlanStore((s) => s.setStudioPrefill);

  const llmHintsById = useMemo<Record<string, LlmHints>>(() => {
    if (!response) return {};
    return {
      [response.match.articleId]: {
        cbiId: response.match.cbiId,
        personaId: response.match.personaId as PersonaId,
      },
    };
  }, [response]);

  const studioProduceHandoff = useMemo(() => {
    if (!response) return null;
    const species = primarySpeciesFromFit(response.match.speciesFit);
    return {
      href: primaryStudioHrefFromSpeciesFit(response.match.speciesFit),
      speciesLabel: studioLabelShort(species),
    };
  }, [response]);

  const scoreById = useMemo(() => {
    const map: Record<string, ReturnType<typeof scoreArticle>> = {};
    for (const a of articles) {
      const sp = a.species.find((x) => x !== "cross");
      map[a.id] = scoreArticle(a, llmHintsById[a.id], { species: sp });
    }
    return map;
  }, [articles, llmHintsById]);

  const regions = useMemo(() => {
    const u = new Set<string>();
    for (const a of articles) {
      if (a.region?.trim()) u.add(a.region.trim());
    }
    return [...u].sort((x, y) => x.localeCompare(y));
  }, [articles]);

  const topCompetitors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      const c = a.competitor?.trim() || "Unknown";
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 12)
      .map(([name]) => name);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const now = Date.now();
    const ms =
      dayWindow === "all"
        ? 0
        : dayWindow === "30"
          ? 30 * 86400000
          : dayWindow === "90"
            ? 90 * 86400000
            : 365 * 86400000;

    return articles.filter((a) => {
      if (ms > 0) {
        const d = parseArticleDate(a.publishedAt);
        if (now - d > ms) return false;
      }
      if (regionFilter !== "all") {
        if (
          !(a.region || "")
            .toLowerCase()
            .includes(regionFilter.toLowerCase())
        ) {
          return false;
        }
      }
      if (speciesFilter !== "all") {
        if (!a.species.includes(speciesFilter as Species)) return false;
      }
      if (competitorFocus.size > 0) {
        const c = a.competitor?.trim() || "Unknown";
        if (!competitorFocus.has(c)) return false;
      }
      return true;
    });
  }, [articles, dayWindow, regionFilter, speciesFilter, competitorFocus]);

  const wordCloud = useMemo(
    () => buildWordCloudEntries(filteredArticles, 42),
    [filteredArticles]
  );

  const rollup = useMemo(
    () => rollupCompetitorCorpus(filteredArticles, llmHintsById),
    [filteredArticles, llmHintsById]
  );

  const scoreByIdFiltered = useMemo(() => {
    const map: Record<string, ReturnType<typeof scoreArticle>> = {};
    for (const a of filteredArticles) {
      const sp = a.species.find((x) => x !== "cross");
      map[a.id] = scoreArticle(a, llmHintsById[a.id], { species: sp });
    }
    return map;
  }, [filteredArticles, llmHintsById]);

  const gridFiltered = useMemo(
    () => buildComparisonGrid(filteredArticles, llmHintsById),
    [filteredArticles, llmHintsById]
  );

  const corpusStats = useMemo(() => {
    const list = filteredArticles;
    const isOwn = (a: ScrapedArticle) =>
      /^adisseo\b/i.test((a.competitor || "").trim());
    const ownBrand = list.filter(isOwn);
    const competitorOnly = list.filter((a) => !isOwn(a));
    const mentionHits = competitorOnly.filter((a) =>
      /\badisseo\b/i.test(`${a.title} ${a.summary}`)
    ).length;
    const voicePct =
      competitorOnly.length > 0
        ? Math.round((mentionHits / competitorOnly.length) * 100)
        : 0;
    return {
      total: list.length,
      ownCount: ownBrand.length,
      competitorCount: competitorOnly.length,
      mentionHits,
      voicePct,
    };
  }, [filteredArticles]);

  const loadFeed = async (force = false) => {
    try {
      const r = await fetch(`/api/articles${force ? "?refresh=1" : ""}`);
      const data = await r.json();
      setArticles(data.articles);
      setFeedMeta({
        source: data.source,
        count: data.count,
        fetchedAt: data.fetchedAt,
        warning: data.warning,
      });
    } catch {
      setError("Could not load articles");
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const articleIdFromUrl = searchParams.get("article");

  useEffect(() => {
    if (!articleIdFromUrl || articles.length === 0) return;
    const t = window.setTimeout(() => {
      document
        .getElementById(`article-${articleIdFromUrl}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => window.clearTimeout(t);
  }, [articleIdFromUrl, articles]);

  const refreshFeed = async () => {
    setRefreshing(true);
    await loadFeed(true);
    setRefreshing(false);
  };

  const analyzeArticle = async (article: ScrapedArticle) => {
    setLoadingAnalyze(true);
    setResponse(null);
    setError(null);
    setSelectedArticle(article.id);
    try {
      const res = await fetch("/api/match-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      });
      if (!res.ok) throw new Error("Analyze failed");
      const data: MatchResponse = await res.json();
      setResponse(data);
      setMatch(data.match);
      setStudioTopic(article.title);

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
      useAdiPlanStore.getState().pushActivity({
        kind: "match",
        title: `Analyzed: ${article.title}`,
        detail: `${article.competitor} \u00b7 \u2192 ${data.match.cbi} / ${data.match.persona}`,
        href: COMPETITOR_WATCH_PATH,
        tone: "ink",
      });
      toast.success(`Analyzed \u2192 ${data.match.cbi}`, {
        description: `${data.match.persona} \u00b7 ${data.match.recommendedFormats[0] ?? "deliverable"}`,
      });
    } catch {
      setError("Analyze request failed. Check API keys or try again.");
      toast.error("Analyze request failed", {
        description: "Check the OpenAI / Anthropic key, or try a different article.",
      });
    } finally {
      setLoadingAnalyze(false);
    }
  };

  function toggleCompetitor(name: string) {
    setCompetitorFocus((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-white/70 backdrop-blur-sm">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line/80 bg-white/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
                Competitor Watch
              </p>
              <h1 className="font-display text-lg font-semibold text-adisseo-ink-strong sm:text-xl">
                Scraped news → APAC framework (CBI · CSF · persona)
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-adisseo-muted">
            {response?.meta.usedModel && (
              <span className="rounded-full bg-slate-100 px-2 py-1">
                model: {response.meta.usedModel}
              </span>
            )}
            <Link
              href={MARKETING_PLAN_PATH}
              className="rounded-md border border-adisseo-line px-3 py-2 text-xs font-medium text-adisseo-ink hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              Marketing plan hub
            </Link>
            <Link
              href="/studio/poultry"
              className="flex items-center gap-2 rounded-md bg-adisseo-ink-strong px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Studios (optional)
              <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 pt-4 lg:pt-5">
          <WorkflowRibbon />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-4">
          <section className="adi-surface p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Filter size={14} className="text-adisseo-muted" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
                Filters · word cloud & roll-ups follow this slice
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-adisseo-muted">
                Timeline
                <select
                  value={dayWindow}
                  onChange={(e) => setDayWindow(e.target.value as DayWindow)}
                  className="rounded-lg border border-adisseo-line bg-white px-2 py-1.5 text-xs font-medium text-adisseo-ink-strong"
                >
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last 12 months</option>
                  <option value="all">All ingested</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-adisseo-muted">
                Region contains
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="rounded-lg border border-adisseo-line bg-white px-2 py-1.5 text-xs font-medium text-adisseo-ink-strong"
                >
                  <option value="all">Any region</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-adisseo-muted">
                Species
                <select
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value)}
                  className="rounded-lg border border-adisseo-line bg-white px-2 py-1.5 text-xs font-medium text-adisseo-ink-strong"
                >
                  <option value="all">Any species</option>
                  <option value="aqua">Aqua</option>
                  <option value="poultry">Poultry</option>
                  <option value="ruminants">Ruminants</option>
                  <option value="swine">Swine</option>
                  <option value="cross">Cross</option>
                </select>
              </label>
            </div>
            <div className="mt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-adisseo-muted">
                Focus competitors (top sources — multi-select)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topCompetitors.map((name) => {
                  const on = competitorFocus.has(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleCompetitor(name)}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                        on
                          ? "border-adisseo-crimson bg-adisseo-crimson text-white"
                          : "border-adisseo-line bg-slate-50 text-adisseo-ink hover:border-adisseo-crimson/50"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
              {competitorFocus.size > 0 && (
                <button
                  type="button"
                  onClick={() => setCompetitorFocus(new Set())}
                  className="mt-2 text-[10px] font-semibold text-adisseo-crimson hover:underline"
                >
                  Clear competitor focus
                </button>
              )}
            </div>
          </section>

          {corpusStats.total > 0 && (
            <section className="adi-surface mt-4 p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-crimson">
                Corpus at a glance
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-adisseo-bg/80 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-adisseo-muted">
                    Articles in this view
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-adisseo-ink-strong">
                    {corpusStats.total}
                  </p>
                </div>
                <div className="rounded-xl bg-adisseo-bg/80 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-adisseo-muted">
                    Competitor-sourced
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-adisseo-ink-strong">
                    {corpusStats.competitorCount}
                  </p>
                  <p className="mt-0.5 text-[10px] text-adisseo-muted">
                    Third-party publishers only
                  </p>
                </div>
                <div className="rounded-xl bg-adisseo-bg/80 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-adisseo-muted">
                    Adisseo-owned items
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-adisseo-ink-strong">
                    {corpusStats.ownCount}
                  </p>
                  <p className="mt-0.5 text-[10px] text-adisseo-muted">
                    Same inbox — your releases and announcements
                  </p>
                </div>
                <div className="rounded-xl border border-adisseo-crimson/25 bg-adisseo-warmth/40 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-adisseo-crimson">
                    Brand vs. market coverage
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-adisseo-ink-strong">
                    {corpusStats.voicePct}%
                  </p>
                  <p className="mt-0.5 text-[10px] leading-snug text-adisseo-ink">
                    <span className="font-semibold">{corpusStats.mentionHits} of {corpusStats.competitorCount}</span> competitor articles mention{" "}
                    <span className="font-semibold">Adisseo</span> by name in the
                    title or summary. This shows how visible Adisseo is in the
                    market conversation — <em>not</em> revenue share.
                  </p>
                </div>
              </div>
            </section>
          )}

          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-adisseo-muted">
              <BarChart3 size={14} />
              <p className="text-xs font-semibold uppercase tracking-widest">
                Analytics · word cloud (filtered corpus)
              </p>
            </div>
            <ArticleWordCloud words={wordCloud} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <RollupCard title="Top CBIs (count)" rows={rollup.cbi.slice(0, 5)} />
            <RollupCard title="Top CSFs (count)" rows={rollup.csf.slice(0, 5)} />
            <RollupCard
              title="Top personas (count)"
              rows={rollup.persona.slice(0, 5)}
            />
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr,1.2fr]">
          <section>
            <div className="mb-2 flex items-center gap-2 text-adisseo-muted">
              <Newspaper size={16} />
              <p className="text-sm font-medium">News feed</p>
              <span className="text-xs">
                ({filteredArticles.length} of {articles.length})
              </span>
            </div>
            <p className="mb-3 text-[10px] leading-snug text-adisseo-muted">
              Competitor articles <span className="font-semibold">+ Adisseo&rsquo;s own content</span> — use the competitor focus filter above to isolate a single source.
            </p>

            <FeedStatusBadge
              meta={feedMeta}
              refreshing={refreshing}
              onRefresh={refreshFeed}
            />

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {filteredArticles.length >= 3 && (
              <div className="mb-3 flex items-center justify-between rounded-xl border border-adisseo-line bg-white px-3 py-2">
                <p className="text-[11px] text-adisseo-muted">
                  <span className="font-semibold text-adisseo-ink-strong">
                    {filteredArticles.length} articles in view.
                  </span>{" "}
                  Open the heat grid for CBI / CSF / Persona clustering on this slice.
                </p>
                <button
                  onClick={() => setCompareOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-adisseo-ink-strong px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-adisseo-crimson"
                >
                  <BarChart3 size={11} />
                  {compareOpen ? "Hide heat grid" : "Show heat grid"}
                </button>
              </div>
            )}

            {compareOpen && filteredArticles.length >= 3 && (
              <div className="mb-4">
                <ComparisonHeatGrid grid={gridFiltered} />
              </div>
            )}

            <ul className="space-y-3">
              {filteredArticles.map((a) => {
                const sc = scoreByIdFiltered[a.id];
                const truncated = looksLikeTruncatedExcerpt(a.summary);
                const href = normalizeSourceHref(a.url || "");
                return (
                  <li
                    key={a.id}
                    id={`article-${a.id}`}
                    className={`adi-surface p-4 transition hover:border-adisseo-crimson hover:shadow-adi-card-hover ${
                      articleIdFromUrl === a.id
                        ? "border-adisseo-crimson ring-2 ring-adisseo-crimson/25"
                        : "border-adisseo-line"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {/^adisseo\b/i.test((a.competitor || "").trim()) ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-adisseo-cyan/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-adisseo-cyan">
                              ★ Adisseo
                            </span>
                          ) : (
                            <span className="font-semibold uppercase tracking-widest text-adisseo-crimson">
                              {a.competitor}
                            </span>
                          )}
                          <span className="text-adisseo-muted">&middot;</span>
                          <span className="text-adisseo-muted">
                            {a.publishedAt}
                          </span>
                          <span className="text-adisseo-muted">&middot;</span>
                          <span className="text-adisseo-muted">{a.region}</span>
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-adisseo-crimson hover:underline"
                            >
                              Source <ExternalLink size={10} />
                            </a>
                          ) : null}
                        </div>
                        <h3 className="mt-1 text-sm font-semibold leading-snug text-adisseo-ink">
                          {a.title}
                        </h3>
                        <p className="mt-2 text-xs text-adisseo-muted">
                          {a.summary}
                        </p>
                        {truncated && href ? (
                          <p className="mt-1 text-[10px] text-amber-800">
                            Excerpt may be truncated by the feed — open the source
                            for the full article.
                          </p>
                        ) : null}
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

                        {sc && (
                          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-dashed border-adisseo-line pt-2 text-[10px]">
                            <ScoreChip
                              tint="#9C2A2A"
                              kind="CBI"
                              value={sc.cbi.score}
                              label={shortLabelFromCbi(sc.cbi.id)}
                            />
                            <ScoreChip
                              tint="#0F4C81"
                              kind="CSF"
                              value={sc.csf.score}
                              label={sc.csf.id.replace("csf-", "")}
                            />
                            <ScoreChip
                              tint="#0E7C46"
                              kind="Persona"
                              value={sc.persona.score}
                              label={sc.persona.id.replace("persona-", "")}
                            />
                            <span
                              className="ml-1 rounded-full bg-adisseo-ink-strong px-2 py-0.5 font-mono text-[10px] font-bold text-white"
                              title="Composite (mean of top CBI, CSF, Persona scores)"
                            >
                              {sc.composite}/100
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-none flex-col items-stretch gap-2 sm:flex-row sm:items-start">
                        <button
                          type="button"
                          onClick={() => {
                            downloadArticleTxt(a);
                            toast.success("Article downloaded", {
                              description:
                                "Open Copilot, upload this .txt, then paste your prompt.",
                            });
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-adisseo-line bg-white px-3 py-2 text-xs font-medium text-adisseo-ink-strong hover:border-adisseo-cyan hover:text-adisseo-cyan"
                          title="Download article as .txt — upload to Copilot for Adisseo-specific analysis"
                        >
                          <FileDown size={12} />
                          Download article
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            downloadArticleAnalysisPack(a, sc ?? undefined);
                            toast.success("Analysis pack downloaded", {
                              description:
                                "JSON for Copilot / internal trend workflows.",
                            });
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-adisseo-line bg-white px-3 py-2 text-xs font-medium text-adisseo-ink-strong hover:border-adisseo-cyan hover:text-adisseo-cyan"
                          title="JSON for trend analysis, Copilot, and comparison with Adisseo internal context"
                        >
                          <FileDown size={12} />
                          Analysis pack
                        </button>
                        <button
                          onClick={() => analyzeArticle(a)}
                          disabled={loadingAnalyze}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-adisseo-crimson px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                        >
                          {loadingAnalyze ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Sparkles size={12} />
                          )}
                          Analyze
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-4">
            <div className="adi-surface p-6">
              <div className="mb-3 flex items-center gap-2 text-adisseo-muted">
                <Sparkles size={16} />
                <p className="text-sm font-medium">APAC analysis</p>
              </div>

              {!response && !loadingAnalyze && (
                <p className="py-12 text-center text-sm text-adisseo-muted">
                  Click <span className="font-semibold">Analyze</span> on any
                  article — maps CBI, target persona, and suggested formats to
                  the APAC framework.
                </p>
              )}

              {loadingAnalyze && (
                <div className="flex flex-col items-center gap-3 py-12 text-adisseo-muted">
                  <Loader2 size={28} className="animate-spin" />
                  <p className="text-sm">Reasoning over the APAC framework&hellip;</p>
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
                      {response.article.competitor} &middot;{" "}
                      {response.article.publishedAt}
                    </p>
                  </div>

                  <DecisionMatrixFlow
                    active="output"
                    inputLabel={response.article.title}
                    inputSub={`${response.article.competitor} \u00B7 ${response.article.region}`}
                    synthesisLabel="APAC vault + Adisseo brand voice"
                    synthesisSub="CBI ladder, persona matrix, regional context"
                    branchLabel={`${response.match.persona} \u2192 ${response.match.recommendedFormats[0] ?? "carousel"}`}
                    branchSub={response.match.cbi}
                    outputLabel={
                      response.match.recommendedFormats[0] ?? "deliverable"
                    }
                    outputSub="Persona-tuned, region-localised, citation-anchored"
                  />

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

                  {scoreById[response.match.articleId] && (
                    <ThreeAxisRadar
                      featured
                      score={scoreById[response.match.articleId]}
                    />
                  )}

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

                  {studioProduceHandoff && (
                    <div className="rounded-xl border border-adisseo-cyan/50 bg-gradient-to-br from-adisseo-cyan/15 via-white to-white p-4 shadow-adi-card">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-3">
                          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-adisseo-cyan/25 text-adisseo-cyan">
                            <Clapperboard size={18} />
                          </span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-cyan">
                              Produce · Studio prefill ready (optional)
                            </p>
                            <p className="mt-1 text-xs text-adisseo-muted">
                              Topic line and locale hints carry into{" "}
                              <span className="font-semibold text-adisseo-ink-strong">
                                {studioProduceHandoff.speciesLabel}
                              </span>
                              .
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push(studioProduceHandoff.href)}
                          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-adisseo-cyan px-4 py-2.5 text-sm font-semibold text-white shadow-adi-card transition hover:opacity-90 sm:w-auto"
                        >
                          Open {studioProduceHandoff.speciesLabel} studio
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

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
                          Compose the APAC answer before species deliverables
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-adisseo-crimson group-hover:text-white"
                    />
                  </button>

                  <div className="flex items-center justify-between border-t border-adisseo-line pt-4">
                    <div className="text-xs text-adisseo-muted">
                      Species fit:{" "}
                      {response.match.speciesFit.join(", ") || "n/a"}
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
    </WorkspaceShell>
  );
}

function RollupCard({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; label: string; count: number }[];
}) {
  return (
    <div className="adi-surface rounded-xl p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
        {title}
      </p>
      <ul className="mt-2 space-y-1">
        {rows.length === 0 ? (
          <li className="text-xs text-adisseo-muted">No articles in this slice.</li>
        ) : (
          rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 text-[11px] text-adisseo-ink"
            >
              <span className="min-w-0 truncate" title={r.label}>
                {r.label}
              </span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-adisseo-ink-strong">
                {r.count}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default function CompetitorWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-adisseo-muted">
          Loading Competitor Watch&hellip;
        </div>
      }
    >
      <CompetitorWatchContent />
    </Suspense>
  );
}

function FeedStatusBadge({
  meta,
  refreshing,
  onRefresh,
}: {
  meta: FeedMeta | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  if (!meta) return null;
  const ago = (() => {
    const ms = Date.now() - new Date(meta.fetchedAt).getTime();
    if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s ago`;
    if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
    return `${Math.round(ms / 3_600_000)}h ago`;
  })();

  let label = "";
  let dotColor = "bg-emerald-500";
  let pillBg = "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (meta.source === "live") {
    label = `Live · ${meta.count} articles · fetched ${ago}`;
  } else if (meta.source === "live-cache") {
    label = `Live (cached) · ${meta.count} articles · ${ago}`;
    dotColor = "bg-emerald-400";
  } else if (meta.source === "live-failed-fallback") {
    label = `Live failed → seeded fallback · ${meta.count} articles`;
    dotColor = "bg-amber-500";
    pillBg = "bg-amber-50 border-amber-200 text-amber-900";
  } else {
    label = `Demo mode · ${meta.count} seeded articles`;
    dotColor = "bg-slate-400";
    pillBg = "bg-slate-50 border-slate-200 text-slate-700";
  }

  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <span
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${pillBg}`}
      >
        <span className={`relative flex h-2 w-2`}>
          {meta.source === "live" && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColor}`}
            />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
        </span>
        <Radio size={11} />
        {label}
      </span>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-1.5 rounded-md border border-adisseo-line bg-white px-2.5 py-1.5 text-[11px] font-medium text-adisseo-muted transition hover:border-adisseo-crimson hover:text-adisseo-crimson disabled:opacity-50"
      >
        {refreshing ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <RefreshCw size={11} />
        )}
        {refreshing ? "Refreshing" : "Refresh"}
      </button>
      {meta.warning && (
        <span className="flex items-center gap-1 text-[11px] text-amber-800">
          <AlertTriangle size={11} /> {meta.warning}
        </span>
      )}
    </div>
  );
}

function ScoreChip({
  tint,
  kind,
  value,
  label,
}: {
  tint: string;
  kind: string;
  value: number;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border bg-white px-1.5 py-0.5"
      style={{ borderColor: tint }}
      title={`${kind}: ${label} (${value}/100)`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tint }} />
      <span
        className="text-[9px] font-extrabold uppercase tracking-widest"
        style={{ color: tint }}
      >
        {kind}
      </span>
      <span className="text-[10px] font-semibold text-adisseo-ink-strong">
        {label}
      </span>
      <span className="font-mono text-[10px] text-adisseo-muted">{value}</span>
    </span>
  );
}

function shortLabelFromCbi(id: string): string {
  const tail = id.replace(/^cbi-/, "");
  if (tail.length <= 14) return tail;
  return tail.split("-")[0];
}
