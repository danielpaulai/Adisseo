"use client";

export const dynamic = "force-dynamic";

/**
 * APAC plan — Phase 3 (DEMO PRIORITY 2).
 * The "lightbulb" page from the Ricardo meeting:
 *
 *   1 article  +  N saved stakeholder maps  →  N persona-customised variants
 *
 * No magic — it's the existing studios stitched into a single flow:
 * pick an article (or paste one), pick the maps you want to fan out to,
 * and the page picks the right deliverable kind + persona for each map.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers as LayersIcon,
  Map as MapIcon,
  Newspaper,
  Sparkles,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAdiPlanStore } from "@/lib/store";
import { seededArticles, type ScrapedArticle } from "@/lib/scraper-api";
import { seededStakeholders } from "@/lib/stakeholders";
import {
  SEED_SAVED_MAPS,
  buildFanout,
  checkBalance,
  personaMix,
  topInfluenceNodes,
  type SavedStakeholderMap,
  type FanoutVariant,
} from "@/lib/saved-stakeholder-map";

const FORMAT_LABEL: Record<FanoutVariant["suggestedFormat"], string> = {
  carousel: "LinkedIn Carousel",
  leaflet: "Aqua Leaflet",
  manga: "Ruminants Manga",
  short: "Swine Short",
  "voice-memo": "Voice Memo",
};

const FORMAT_ROUTE: Record<FanoutVariant["suggestedFormat"], string> = {
  carousel: "/studio/poultry",
  leaflet: "/studio/aqua",
  manga: "/studio/ruminants",
  short: "/studio/swine",
  "voice-memo": "/studio/voice-memo",
};

const FORMAT_TINT: Record<FanoutVariant["suggestedFormat"], string> = {
  carousel: "#0F4C81",
  leaflet: "#1B7D52",
  manga: "#9C2A2A",
  short: "#C4262E",
  "voice-memo": "#3A3D45",
};

export default function StakeholderFanoutPage() {
  const savedMaps = useAdiPlanStore((s) => s.savedMaps);
  const saveMap = useAdiPlanStore((s) => s.saveMap);
  const setStudioPrefill = useAdiPlanStore((s) => s.setStudioPrefill);

  // Hydrate seed maps if empty
  useEffect(() => {
    if (savedMaps.length === 0) {
      SEED_SAVED_MAPS.forEach((m) =>
        saveMap({
          id: m.id,
          name: m.name,
          scope: m.scope,
          scopeLabel: m.scopeLabel,
          regions: m.regions,
          species: m.species,
          description: m.description,
          nodes: m.nodes,
          author: m.author,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [articleId, setArticleId] = useState<string>(seededArticles[0]?.id ?? "");
  const [selectedMapIds, setSelectedMapIds] = useState<string[]>(() =>
    SEED_SAVED_MAPS.map((m) => m.id)
  );
  const [generated, setGenerated] = useState<FanoutVariant[] | null>(null);

  const stakeholdersById = useMemo(
    () => new Map(seededStakeholders.map((s) => [s.id, s])),
    []
  );

  const article = useMemo<ScrapedArticle | undefined>(
    () => seededArticles.find((a) => a.id === articleId),
    [articleId]
  );

  const selectedMaps = useMemo(
    () => savedMaps.filter((m) => selectedMapIds.includes(m.id)),
    [savedMaps, selectedMapIds]
  );

  const toggleMap = (id: string) =>
    setSelectedMapIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const generate = () => {
    if (!article || selectedMaps.length === 0) return;
    setGenerated(buildFanout(selectedMaps, stakeholdersById));
  };

  const handPrefillToStudio = (variant: FanoutVariant) => {
    if (!article) return;
    setStudioPrefill({
      articleTitle: article.title,
      competitor: article.competitor,
      publishedAt: article.publishedAt,
      ...(variant.suggestedFormat === "leaflet" && {
        aquaLanguage:
          variant.regions.includes("ID")
            ? "id"
            : variant.regions.includes("VN")
              ? "vi"
              : variant.regions.includes("TH")
                ? "th"
                : "en",
      }),
      ...(variant.suggestedFormat === "manga" && {
        ruminantsLanguage: "ja",
      }),
      ...(variant.suggestedFormat === "short" && {
        swineLanguage:
          variant.regions.includes("VN")
            ? "vi"
            : variant.regions.includes("TH")
              ? "th"
              : variant.regions.includes("ID")
                ? "id"
                : "en",
      }),
    });
  };

  return (
    <main className="min-h-screen bg-adisseo-warmth">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-adisseo-line bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            href="/stakeholder-map"
            className="flex items-center gap-1 rounded-md border border-adisseo-line px-3 py-1.5 text-xs text-adisseo-muted hover:bg-adisseo-line/40"
          >
            <ArrowLeft size={13} />
            Stakeholder Map
          </Link>
          <Logo size="sm" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Demo priority 2 · APAC plan
            </p>
            <h1 className="text-xl font-bold leading-tight text-adisseo-ink">
              Stakeholder Fan-out
            </h1>
            <p className="text-xs text-adisseo-muted">
              One article · N saved maps · N persona-tuned deliverables
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-adisseo-muted">
          <span>{savedMaps.length} saved maps</span>
          <span>·</span>
          <span>{seededArticles.length} articles in feed</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* Step 1 — pick article */}
        <div className="rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-adisseo-crimson text-[11px] font-bold text-white">
              1
            </span>
            <Newspaper size={14} className="text-adisseo-muted" />
            <h2 className="text-sm font-bold text-adisseo-ink">Pick an article</h2>
          </div>
          <select
            value={articleId}
            onChange={(e) => {
              setArticleId(e.target.value);
              setGenerated(null);
            }}
            className="w-full rounded-md border border-adisseo-line bg-white px-3 py-2 text-sm outline-none focus:border-adisseo-crimson"
          >
            {seededArticles.map((a) => (
              <option key={a.id} value={a.id}>
                {a.competitor} — {a.title.slice(0, 80)}
              </option>
            ))}
          </select>
          {article && (
            <div className="mt-3 rounded-xl border border-adisseo-line bg-adisseo-warmth/40 p-3 text-xs text-adisseo-ink">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-adisseo-muted">
                {article.competitor} · {article.region} · {article.publishedAt}
              </p>
              <p className="mt-1 font-semibold leading-snug">{article.title}</p>
              <p className="mt-1 text-adisseo-muted">{article.summary}</p>
            </div>
          )}
        </div>

        {/* Step 2 — pick maps */}
        <div className="rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-adisseo-crimson text-[11px] font-bold text-white">
              2
            </span>
            <MapIcon size={14} className="text-adisseo-muted" />
            <h2 className="text-sm font-bold text-adisseo-ink">
              Pick saved maps to fan out to
            </h2>
            <span className="ml-auto text-[11px] text-adisseo-muted">
              {selectedMapIds.length} of {savedMaps.length} selected
            </span>
          </div>
          {savedMaps.length === 0 ? (
            <p className="rounded-md bg-adisseo-warmth/50 p-3 text-xs text-adisseo-muted">
              No saved maps yet. Open the Stakeholder Map, select 4-5 nodes, and
              hit "Save map".
            </p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-3">
              {savedMaps.map((m) => {
                const sel = selectedMapIds.includes(m.id);
                const bal = checkBalance(m, stakeholdersById);
                const top = topInfluenceNodes(m, stakeholdersById, 3);
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => {
                        toggleMap(m.id);
                        setGenerated(null);
                      }}
                      className={`block w-full rounded-xl border p-3 text-left transition ${
                        sel
                          ? "border-adisseo-crimson bg-adisseo-crimson/5 shadow-sm"
                          : "border-adisseo-line bg-white hover:border-adisseo-ink/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs font-bold text-adisseo-ink">
                          {m.name}
                        </p>
                        {sel && (
                          <CheckCircle2
                            size={14}
                            className="shrink-0 text-adisseo-crimson"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-adisseo-muted">
                        {m.scope} · {m.scopeLabel} · {m.nodes.length} nodes
                      </p>
                      {m.description && (
                        <p className="mt-1.5 text-[10px] leading-snug text-adisseo-muted">
                          {m.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {top.map((s) => (
                          <span
                            key={s.id}
                            className="rounded-full bg-adisseo-line/60 px-1.5 py-0.5 text-[9px] font-medium text-adisseo-ink"
                          >
                            {s.label}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                        {bal.ok ? (
                          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">
                            balanced
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-700">
                            <AlertTriangle size={9} />
                            unbalanced
                          </span>
                        )}
                        <span className="text-adisseo-muted">
                          +{bal.growing}/-{bal.shrinking}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Step 3 — generate */}
        <div className="rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-adisseo-crimson text-[11px] font-bold text-white">
              3
            </span>
            <Sparkles size={14} className="text-adisseo-muted" />
            <h2 className="text-sm font-bold text-adisseo-ink">
              Fan out into N persona-tuned variants
            </h2>
          </div>
          <button
            onClick={generate}
            disabled={!article || selectedMaps.length === 0}
            className="flex items-center gap-2 rounded-md bg-adisseo-crimson px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LayersIcon size={14} />
            Generate {selectedMaps.length} variants
            <ArrowRight size={14} />
          </button>

          {generated && generated.length > 0 && (
            <ul className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {generated.map((v) => {
                const tint = FORMAT_TINT[v.suggestedFormat];
                const map = savedMaps.find((m) => m.id === v.mapId);
                const mix = map ? personaMix(map, stakeholdersById) : [];
                return (
                  <li
                    key={v.mapId}
                    className="overflow-hidden rounded-xl border border-adisseo-line bg-white shadow-sm"
                  >
                    <div
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
                      style={{ backgroundColor: tint }}
                    >
                      {FORMAT_LABEL[v.suggestedFormat]}
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold text-adisseo-ink">
                        {v.mapName}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-adisseo-muted">
                        {v.scopeLabel}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                        <Users size={10} className="text-adisseo-muted" />
                        <span className="font-semibold text-adisseo-ink">
                          {v.dominantPersona}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {mix.slice(0, 3).map((m) => (
                          <div
                            key={m.persona}
                            className="flex items-center gap-2 text-[10px]"
                          >
                            <span className="w-32 shrink-0 truncate text-adisseo-muted">
                              {m.persona}
                            </span>
                            <div className="h-1.5 flex-1 rounded-full bg-adisseo-line/40">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${Math.round(m.share * 100)}%`,
                                  backgroundColor: tint,
                                }}
                              />
                            </div>
                            <span className="w-7 shrink-0 text-right font-mono text-adisseo-muted">
                              {Math.round(m.share * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {v.regions.map((r) => (
                          <span
                            key={r}
                            className="rounded-full bg-adisseo-line/50 px-1.5 py-0.5 text-[9px] font-medium text-adisseo-ink"
                          >
                            {r}
                          </span>
                        ))}
                        {v.species.map((sp) => (
                          <span
                            key={sp}
                            className="rounded-full border border-adisseo-line px-1.5 py-0.5 text-[9px] font-medium text-adisseo-muted"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={FORMAT_ROUTE[v.suggestedFormat]}
                        onClick={() => handPrefillToStudio(v)}
                        className="mt-4 flex items-center justify-between rounded-md border border-adisseo-ink-strong bg-adisseo-ink-strong px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90"
                      >
                        Open in {FORMAT_LABEL[v.suggestedFormat]}
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {generated && generated.length === 0 && (
            <p className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
              No variants generated — pick at least one saved map.
            </p>
          )}
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-adisseo-line bg-adisseo-warmth/40 p-5 text-xs text-adisseo-ink">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
            How fan-out works
          </p>
          <ol className="space-y-1.5 leading-relaxed text-adisseo-muted">
            <li>
              <span className="font-bold text-adisseo-ink">1.</span> Each saved
              map's <em>persona mix</em> is computed by weighting current
              influence (large = 3, medium = 2, small = 1).
            </li>
            <li>
              <span className="font-bold text-adisseo-ink">2.</span> The dominant
              persona maps to a default deliverable kind (Risk Reducer →
              carousel, Knowledge Builder → manga, etc.).
            </li>
            <li>
              <span className="font-bold text-adisseo-ink">3.</span> The variant
              opens in the matching studio with the article + region + language
              already prefilled. Inline editor (Phase 5) lets you tweak before
              the render-PDF button.
            </li>
            <li>
              <span className="font-bold text-adisseo-ink">4.</span> The balance
              rule is enforced when saving the map: too many growers or too
              many shrinkers triggers a warning, because real APAC markets
              never look all-up or all-down.
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
