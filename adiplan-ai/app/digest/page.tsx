"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Coffee,
  ExternalLink,
  Library,
  Mail,
  Newspaper,
  Sparkles,
  Telescope,
} from "lucide-react";
import { Logo, SpeciesIcon } from "@/components/Logo";
import { seededArticles, type ScrapedArticle } from "@/lib/scraper-api";
import { searchVault, type VaultEntry, type VaultSpecies } from "@/lib/vault";

/**
 * Daily digest — gpt-newspaper-style overnight competitor briefing.
 *
 * For each species manager, we:
 *   1. Pick the 3 most-relevant scraped articles for their species/region
 *   2. Anchor each one to a Vault entry (the trial / quote / regulation
 *      that would back the response)
 *   3. Suggest a "today's play" — which deliverable kind to ship
 *
 * The page is deterministic so it always produces the same digest in demo.
 * In production this would run on a 04:00 cron and email each manager.
 */

interface ManagerProfile {
  id: string;
  name: string;
  speciesLabel: string;
  species: VaultSpecies;
  regions: string[];
  defaultDeliverable: string;
  studioHref: string;
  emoji?: string;
}

const MANAGERS: ManagerProfile[] = [
  {
    id: "vish",
    name: "Vish",
    speciesLabel: "Poultry",
    species: "poultry",
    regions: ["Indonesia", "Thailand", "Vietnam", "APAC"],
    defaultDeliverable: "Email + LinkedIn carousel",
    studioHref: "/studio/poultry",
  },
  {
    id: "aileen",
    name: "Aileen",
    speciesLabel: "Aqua",
    species: "aqua",
    regions: ["Indonesia", "Thailand", "Vietnam"],
    defaultDeliverable: "1-page technical leaflet",
    studioHref: "/studio/aqua",
  },
  {
    id: "antoine",
    name: "Antoine",
    speciesLabel: "Ruminants",
    species: "ruminants",
    regions: ["Japan"],
    defaultDeliverable: "Manga-style 2-page brochure",
    studioHref: "/studio/ruminants",
  },
  {
    id: "claire",
    name: "Claire",
    speciesLabel: "Swine",
    species: "swine",
    regions: ["Malaysia", "China", "Vietnam"],
    defaultDeliverable: "<60s short (TikTok / WeChat)",
    studioHref: "/studio/swine",
  },
];

const TODAY = (() => {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
})();

interface DigestItem {
  article: ScrapedArticle;
  vaultAnchors: VaultEntry[];
  play: string;
}

function buildDigest(manager: ManagerProfile): DigestItem[] {
  // Filter articles by species + region overlap
  const regionSet = new Set(manager.regions.map((r) => r.toLowerCase()));
  const candidates = seededArticles.filter((a) => {
    const speciesMatch = a.species.includes(manager.species as Species);
    const regionMatch =
      a.region === "APAC" || regionSet.has(a.region.toLowerCase());
    return speciesMatch && regionMatch;
  });
  const sorted = candidates.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const top = sorted.slice(0, 3);

  return top.map((article) => {
    // Anchor each article in the vault using its tags
    const queryText = [article.title, ...article.tags].join(" ");
    const hits = searchVault({
      text: queryText,
      species: manager.species,
      limit: 2,
    });
    return {
      article,
      vaultAnchors: hits.map((h) => h.entry),
      play: pickPlay(article, manager),
    };
  });
}

function pickPlay(article: ScrapedArticle, manager: ManagerProfile): string {
  // Heuristic — different content type per article tag
  const t = article.tags.join(" ").toLowerCase();
  if (manager.species === "swine") {
    if (t.includes("asf") || t.includes("recovery"))
      return `Vertical video (<60s): "${article.competitor} says X — here's our APAC trial" → Send to HQ today.`;
    return `Short + email digest, anchor on the Cargill / PRRS trial number.`;
  }
  if (manager.species === "poultry") {
    if (t.includes("agp") || t.includes("eubiotic"))
      return `Email blast + 5-slide LinkedIn carousel anchored on the AGP-Free trial. Lead with FCR delta.`;
    if (t.includes("methionine") || t.includes("price"))
      return `Carousel: "What the Mintec data means for your integrator margin." Lead with integrator quote.`;
    return `Email + carousel pair, anchor on the Vault trial entry.`;
  }
  if (manager.species === "aqua") {
    if (t.includes("mycotoxin"))
      return `Mill-QC leaflet (ID): acceptance-gate protocol. Drop on Trobos Aqua thread.`;
    return `1-page technical leaflet anchored on the regional Vault trial.`;
  }
  if (manager.species === "ruminants") {
    if (t.includes("methane") || t.includes("j-credit"))
      return `Manga brochure for procurement: "J-credit math, week 1." Lead with METI threshold.`;
    if (t.includes("heat"))
      return `Manga brochure: Hokkaido summer-yield / heat-stress nutrition pack. Quote co-op procurement.`;
    return `Manga brochure anchored on the Hokkaido Vault entry.`;
  }
  return `Compose a frame, then ship the standard deliverable for the species.`;
}

// re-export Species type from scraper-api
type Species = ScrapedArticle["species"][number];

export default function DigestPage() {
  const [active, setActive] = useState<string>("vish");
  const digestByManager = useMemo(() => {
    const map = new Map<string, DigestItem[]>();
    for (const m of MANAGERS) map.set(m.id, buildDigest(m));
    return map;
  }, []);

  const activeManager = MANAGERS.find((m) => m.id === active) ?? MANAGERS[0];
  const items = digestByManager.get(activeManager.id) ?? [];
  const totalItems = Array.from(digestByManager.values()).reduce(
    (acc, v) => acc + v.length,
    0
  );

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="flex items-center gap-1 text-adisseo-muted hover:text-adisseo-crimson">
              <ArrowLeft size={11} /> Home
            </Link>
            <Link href="/vault" className="text-adisseo-muted hover:text-adisseo-crimson">
              Vault
            </Link>
            <Link href="/research-deep" className="text-adisseo-muted hover:text-adisseo-crimson">
              Deep research
            </Link>
            <Link href="/news-bridge" className="text-adisseo-muted hover:text-adisseo-crimson">
              News bridge
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <Coffee size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Phase 2 · Overnight digest
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              The 04:00 species-manager briefing
            </h1>
            <p className="text-sm text-adisseo-muted">
              {TODAY} · {totalItems} stories pulled · {MANAGERS.length} species managers · each story Vault-anchored.
            </p>
          </div>
        </div>

        {/* MANAGER TABS */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {MANAGERS.map((m) => {
            const count = digestByManager.get(m.id)?.length ?? 0;
            const isActive = active === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-adisseo-crimson bg-white shadow"
                    : "border-adisseo-line bg-white hover:border-adisseo-crimson"
                }`}
              >
                <div className="flex items-center gap-2">
                  <SpeciesIcon
                    species={m.species === "cross" ? "swine" : m.species}
                    size={18}
                  />
                  <p className={`font-bold ${isActive ? "text-adisseo-crimson" : "text-adisseo-ink-strong"}`}>
                    {m.name}
                  </p>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-adisseo-muted">
                  {m.speciesLabel} · {m.regions.length} regions
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-adisseo-muted">
                  <span>Inbox</span>
                  <span className="rounded-full bg-adisseo-crimson/10 px-2 py-0.5 font-semibold text-adisseo-crimson">
                    {count} {count === 1 ? "story" : "stories"}
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        {/* MAIL HEADER */}
        <section className="mb-4 rounded-2xl border border-adisseo-line bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-adisseo-muted">
                <Mail size={11} className="inline" /> From: AdiPlan AI · digest@adiplan.ai
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-adisseo-muted">
                To: {activeManager.name} ({activeManager.speciesLabel} · APAC)
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-adisseo-muted">
                <Calendar size={11} className="inline" /> {TODAY} · 04:00 SGT
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-adisseo-muted">
                Subject
              </p>
              <p className="font-bold text-adisseo-ink-strong">
                {items.length === 0
                  ? "Quiet night — no priority moves."
                  : `${items.length} ${items.length === 1 ? "story" : "stories"} to act on today`}
              </p>
            </div>
          </div>
        </section>

        {/* DIGEST ITEMS */}
        {items.length === 0 ? (
          <p className="rounded-2xl border border-adisseo-line bg-white p-6 text-center text-sm text-adisseo-muted">
            No new competitor activity overnight in {activeManager.speciesLabel}'s regions.
          </p>
        ) : (
          <section className="space-y-4">
            {items.map((it, i) => (
              <article key={it.article.id} className="rounded-2xl border border-adisseo-line bg-white p-5">
                <div className="mb-2 flex items-baseline justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                    Story 0{i + 1}
                  </p>
                  <p className="text-[10px] text-adisseo-muted">
                    <Clock size={10} className="inline" /> Published{" "}
                    {it.article.publishedAt}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-adisseo-crimson/10 text-adisseo-crimson">
                    <Newspaper size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-adisseo-muted">
                      <span>{it.article.competitor}</span>
                      <span>·</span>
                      <span>{it.article.region}</span>
                      <span>·</span>
                      <span>{it.article.language.toUpperCase()}</span>
                    </div>
                    <p className="mt-1 font-bold text-adisseo-ink-strong">
                      {it.article.title}
                    </p>
                    <p className="mt-1 text-xs text-adisseo-ink">
                      {it.article.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {it.article.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-adisseo-bg px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-adisseo-muted"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vault anchors */}
                {it.vaultAnchors.length > 0 && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
                      <Library size={11} /> Vault anchor — what this story has been pre-paired with
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {it.vaultAnchors.map((v) => (
                        <li key={v.id} className="flex items-start gap-2 text-[11px]">
                          <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          <div>
                            <Link
                              href={`/vault?id=${v.id}`}
                              className="font-semibold text-adisseo-ink-strong hover:text-adisseo-crimson"
                            >
                              {v.title}
                            </Link>
                            <p className="text-[10px] text-adisseo-muted">
                              {v.kind} · {v.regions.join(", ")} · {v.date}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Today's play */}
                <div className="mt-3 rounded-xl border border-adisseo-cyan/40 bg-adisseo-cyan/5 p-3">
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-cyan">
                    <Sparkles size={11} /> Today's play
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-adisseo-ink-strong">
                    {it.play}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                  <Link
                    href={`/news-bridge?article=${it.article.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2 py-1 font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson"
                  >
                    Open in News Bridge <ArrowRight size={10} />
                  </Link>
                  <Link
                    href={`/research-deep?q=${encodeURIComponent(it.article.title)}`}
                    className="inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2 py-1 font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson"
                  >
                    <Telescope size={10} /> Research it deeper
                  </Link>
                  <Link
                    href={activeManager.studioHref}
                    className="inline-flex items-center gap-1 rounded-md bg-adisseo-crimson px-2 py-1 font-semibold text-white hover:bg-adisseo-crimson/90"
                  >
                    Open {activeManager.speciesLabel} studio <ArrowRight size={10} />
                  </Link>
                  <a
                    href={it.article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2 py-1 font-semibold text-adisseo-cyan hover:border-adisseo-cyan"
                  >
                    Source <ExternalLink size={10} />
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}

        <p className="mt-6 text-[10px] text-adisseo-muted">
          Phase 2 spec · 04:00 cron pending in production. Today's run uses
          the seeded competitor articles + the seeded Vault. Once
          SCRAPER_API_URL is wired, this becomes a live morning briefing.
        </p>
      </div>
    </main>
  );
}
