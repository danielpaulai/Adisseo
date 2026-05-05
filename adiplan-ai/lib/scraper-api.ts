/**
 * Scraper API interface.
 *
 * For the May 7 demo this is seeded with realistic mock articles that mirror
 * what the existing Adisseo competitor news scraper produces. To wire the real
 * backend, replace `fetchArticles` with a fetch() call to your existing API.
 *
 * Shape is intentionally conservative — only fields we actually need downstream.
 */

export type Species = "aqua" | "poultry" | "ruminants" | "swine" | "cross";

export interface ScrapedArticle {
  id: string;
  competitor: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  species: Species[];
  tags: string[];
  region: string;
  language: string;
}

export const seededArticles: ScrapedArticle[] = [
  {
    id: "art-001",
    competitor: "Evonik",
    title: "Evonik launches AMINOTrack precision-fed swine trial program in Vietnam",
    summary:
      "Evonik announced a precision feeding trial across 12 Vietnamese integrators using AMINOTrack to reduce CP inclusion by 1.2pts while maintaining ADG. Marketed as 'sustainability without performance trade-off' — paired with carbon-footprint reporting service.",
    url: "https://example.com/evonik-aminotrack-vn",
    publishedAt: "2026-04-22",
    species: ["swine"],
    tags: ["precision-feeding", "sustainability", "amino-acids", "vietnam", "integrator"],
    region: "APAC",
    language: "en",
  },
  {
    id: "art-002",
    competitor: "DSM-Firmenich",
    title: "DSM publishes peer-reviewed PRRS-resilience nutrition paper",
    summary:
      "DSM-Firmenich co-authored a paper in J. Anim. Sci. linking specific organic-acid blends + selenium yeast to faster PRRS recovery in nursery pigs. Distributing executive summary via vet KOL channels in CN/TH.",
    url: "https://example.com/dsm-prrs-paper",
    publishedAt: "2026-04-20",
    species: ["swine"],
    tags: ["PRRS", "vet-channel", "research", "organic-acids", "China", "Thailand"],
    region: "APAC",
    language: "en",
  },
  {
    id: "art-003",
    competitor: "Cargill",
    title: "Cargill launches WeChat livestream series on ASF biosecurity",
    summary:
      "Cargill animal nutrition kicked off a 6-episode WeChat live-broadcast series featuring veterinary KOLs and integrator nutrition managers. First episode hit 18,000 viewers, 3,200 questions submitted. Recordings being repackaged as <60s shorts.",
    url: "https://example.com/cargill-wechat-asf",
    publishedAt: "2026-04-18",
    species: ["swine"],
    tags: ["ASF", "biosecurity", "wechat", "kol", "live-broadcast", "China"],
    region: "China",
    language: "zh",
  },
  {
    id: "art-004",
    competitor: "Alltech",
    title: "Alltech opens mycotoxin monitoring lab in Bangkok",
    summary:
      "Alltech opened a regional mycotoxin testing lab serving Thailand, Vietnam and Indonesia — 48-hour turnaround on lateral-flow + LC-MS panels. Free quarterly reports to opted-in feed mills.",
    url: "https://example.com/alltech-bangkok-lab",
    publishedAt: "2026-04-15",
    species: ["aqua", "poultry", "swine", "ruminants"],
    tags: ["mycotoxin", "lab-services", "thailand", "feed-mill"],
    region: "APAC",
    language: "en",
  },
  {
    id: "art-005",
    competitor: "BASF",
    title: "BASF Lutavit Vita-mix launches enhanced vitamin E formulation",
    summary:
      "Reformulated Lutavit Vita-mix targeting heat-stress markets — claims 22% improved bioavailability in pasture-system ruminants. NZ launch with on-farm demonstrators.",
    url: "https://example.com/basf-lutavit-nz",
    publishedAt: "2026-04-12",
    species: ["ruminants"],
    tags: ["vitamins", "heat-stress", "new-zealand", "pasture"],
    region: "Oceania",
    language: "en",
  },
  {
    id: "art-006",
    competitor: "Kemin",
    title: "Kemin partners with 3 premixers in Indonesia for AGP-free poultry",
    summary:
      "Kemin signed multi-year agreements with PT Sreeya, Charoen Pokphand Indonesia, and a third undisclosed premixer to co-develop AGP-free poultry premix lines. Marketing leans heavily on regulatory drivers (BPOM Indonesia direction).",
    url: "https://example.com/kemin-id-agp",
    publishedAt: "2026-04-10",
    species: ["poultry"],
    tags: ["AGP-free", "premixer", "indonesia", "regulatory", "poultry"],
    region: "APAC",
    language: "en",
  },
  {
    id: "art-007",
    competitor: "Adifo (BESTMIX)",
    title: "Adifo releases AI-assisted swine ration optimizer",
    summary:
      "Adifo's BESTMIX added an AI assistant that suggests least-cost ration adjustments based on real-time raw-material price feeds. Targeting nutrition managers and premixer formulators with a 30-day free trial across APAC.",
    url: "https://example.com/adifo-ai-bestmix",
    publishedAt: "2026-04-08",
    species: ["swine", "poultry"],
    tags: ["ai-tools", "ration-optimization", "premixer", "raw-material-prices"],
    region: "Global",
    language: "en",
  },
  {
    id: "art-008",
    competitor: "Skretting",
    title: "Skretting launches shrimp gut-health probiotic in Vietnam pangasius market",
    summary:
      "Skretting's new probiotic blend targets pangasius hepatopancreas health — Vietnamese-language technical leaflets distributed via local aqua magazines and on-farm trial program with 4 integrators.",
    url: "https://example.com/skretting-pangasius-vn",
    publishedAt: "2026-04-05",
    species: ["aqua"],
    tags: ["probiotics", "shrimp", "pangasius", "vietnam", "gut-health"],
    region: "APAC",
    language: "vi",
  },
];

/**
 * Source tag — surfaced in /api/articles so the UI can render a
 * "Live · N · X ago" or "Demo · 8 seeded" badge on Competitor Watch.
 */
export type ScraperSource = "live" | "live-cache" | "live-failed-fallback" | "demo";

export interface ScraperResult {
  articles: ScrapedArticle[];
  source: ScraperSource;
  count: number;
  fetchedAt: string;
  /** Set when the underlying call failed and we fell back to seeded data. */
  warning?: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

let cache: { result: ScraperResult; expiresAt: number } | null = null;

/**
 * Normalise a wild scraper-side payload into our ScrapedArticle shape.
 * Adisseo's existing competitor-news scraper isn't fully spec'd, so we
 * accept several common field names and coerce defensively.
 */
function normaliseRemoteArticle(raw: unknown, idx: number): ScrapedArticle | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const pick = (...keys: string[]): string => {
    for (const k of keys) {
      const v = r[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
  };
  const arr = (...keys: string[]): string[] => {
    for (const k of keys) {
      const v = r[k];
      if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
    }
    return [];
  };
  const title = pick("title", "headline", "name");
  if (!title) return null;
  const speciesRaw = arr("species", "categories", "topics", "tags").map((s) =>
    s.toLowerCase()
  );
  const species: Species[] = [];
  for (const want of ["aqua", "poultry", "ruminants", "swine"] as const) {
    if (speciesRaw.some((s) => s.includes(want))) species.push(want);
  }
  if (species.length === 0) species.push("cross");
  return {
    id: pick("id", "uuid", "slug") || `live-${idx}`,
    competitor: pick("competitor", "company", "source", "publisher"),
    title,
    summary: pick("summary", "description", "excerpt", "content").slice(0, 600),
    url: pick("url", "link", "permalink"),
    publishedAt:
      pick("publishedAt", "published_at", "date", "pubDate") ||
      new Date().toISOString().slice(0, 10),
    species,
    tags: arr("tags", "keywords", "labels"),
    region: pick("region", "geo", "country") || "APAC",
    language: pick("language", "lang") || "en",
  };
}

async function fetchFromRemote(): Promise<ScrapedArticle[]> {
  const baseUrl = process.env.SCRAPER_API_URL;
  if (!baseUrl) throw new Error("SCRAPER_API_URL not set");
  const apiKey = process.env.SCRAPER_API_KEY;
  // Common scraper layouts: GET <base>/articles or GET <base>?path=articles.
  const url = baseUrl.endsWith("/articles") || baseUrl.includes("?")
    ? baseUrl
    : `${baseUrl.replace(/\/+$/, "")}/articles`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    // Next 15: opt out of fetch cache; we cache at our layer.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Scraper API ${res.status}`);
  const payload = await res.json();
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown>).articles)
      ? ((payload as Record<string, unknown>).articles as unknown[])
      : Array.isArray((payload as Record<string, unknown>).items)
        ? ((payload as Record<string, unknown>).items as unknown[])
        : null;
  if (!list) throw new Error("Scraper API returned unexpected shape");
  const normalised = list
    .map((raw, i) => normaliseRemoteArticle(raw, i))
    .filter((x): x is ScrapedArticle => x !== null);
  if (normalised.length === 0) throw new Error("Scraper returned 0 valid articles");
  return normalised;
}

export async function fetchArticles(opts?: { force?: boolean }): Promise<ScraperResult> {
  const now = Date.now();
  if (!opts?.force && cache && cache.expiresAt > now) {
    // Only switch to "live-cache" when the cached payload was actually live.
    // Demo / fallback responses keep their original source label.
    const cachedSource = cache.result.source;
    return {
      ...cache.result,
      source: cachedSource === "live" ? "live-cache" : cachedSource,
    };
  }

  if (process.env.SCRAPER_API_URL) {
    try {
      const live = await fetchFromRemote();
      const result: ScraperResult = {
        articles: live,
        source: "live",
        count: live.length,
        fetchedAt: new Date().toISOString(),
      };
      cache = { result, expiresAt: now + CACHE_TTL_MS };
      return result;
    } catch (err) {
      // Don't break the demo — fall back, but surface a warning so the UI
      // can show the user what happened.
      const message = err instanceof Error ? err.message : String(err);
      const result: ScraperResult = {
        articles: seededArticles,
        source: "live-failed-fallback",
        count: seededArticles.length,
        fetchedAt: new Date().toISOString(),
        warning: `Live scraper failed (${message}); using seeded articles.`,
      };
      // Cache the fallback too, but for a shorter window so we retry sooner.
      cache = { result, expiresAt: now + 60_000 };
      return result;
    }
  }

  // No live URL configured -> demo mode.
  const result: ScraperResult = {
    articles: seededArticles,
    source: "demo",
    count: seededArticles.length,
    fetchedAt: new Date().toISOString(),
  };
  cache = { result, expiresAt: now + CACHE_TTL_MS };
  return result;
}

export async function fetchArticleById(id: string): Promise<ScrapedArticle | undefined> {
  const result = await fetchArticles();
  return result.articles.find((a) => a.id === id);
}
