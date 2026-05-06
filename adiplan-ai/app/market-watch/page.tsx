import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Coffee,
  HelpCircle,
  Library,
  MapPin,
  Network,
  SlidersHorizontal,
  Telescope,
  TrendingUp,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { COMPETITOR_WATCH_PATH, MARKETING_PLAN_PATH } from "@/lib/routes";

const CARDS = [
  {
    href: "/digest",
    title: "Species-manager digest",
    blurb:
      "Overnight-style briefing: top stories per species with Vault-backed context — use as the market pulse before workshops.",
    icon: Coffee,
  },
  {
    href: "/wwwk",
    title: "We Wish We Knew",
    blurb:
      "Decision-critical unknowns by bucket (market, customer, competitor, our company) — what still needs evidence.",
    icon: HelpCircle,
  },
  {
    href: "/stakeholder-map",
    title: "Stakeholder influence map",
    blurb:
      "Who influences whom, by species and region — grounds Market Watch in account reality before you tune messaging.",
    icon: Network,
  },
  {
    href: "/research-deep",
    title: "Vault deep research",
    blurb:
      "Multi-step retrieval over internal trial data — footnoted answers for market and technical questions.",
    icon: Telescope,
  },
  {
    href: "/vault",
    title: "Adisseo Vault",
    blurb:
      "Trial archive and citations that back every claim — shared corpus with studios and digest.",
    icon: Library,
  },
] as const;

const TREND_SLICES = [
  {
    region: "SEA",
    country: "Indonesia",
    species: "Poultry",
    signal: "AGP-free pressure + feed-cost variance",
    implication: "Lead with TFIP margin protection and regulatory confidence.",
  },
  {
    region: "SEA",
    country: "Vietnam",
    species: "Aqua",
    signal: "Gut integrity, WSSV readiness, mycotoxin screening",
    implication: "Package pond-cycle resilience as a pre-season checklist.",
  },
  {
    region: "NEA",
    country: "Japan",
    species: "Ruminants",
    signal: "Heat stress, J-credit math, co-op proof needs",
    implication: "Use manga-style education plus a technical proof appendix.",
  },
  {
    region: "China",
    country: "China",
    species: "Swine",
    signal: "ASF recovery, nursery survivability, short-video education",
    implication: "Short-form scripts should pair risk reduction with local account tone.",
  },
] as const;

const MBR_TAKEAWAYS = [
  "Use the last 90 days as the default readout for monthly business reviews.",
  "Show shifts by region, country, and species before choosing the deliverable format.",
  "Pair Market Watch signals with Competitor Watch gaps to decide what Adisseo should say next.",
] as const;

const APAC_SIGNAL_POINTS = [
  {
    region: "SEA",
    country: "Indonesia",
    x: 33,
    y: 70,
    signal: "AGP-free pressure",
    momentum: "+8",
  },
  {
    region: "SEA",
    country: "Vietnam",
    x: 48,
    y: 62,
    signal: "Aqua disease readiness",
    momentum: "+10",
  },
  {
    region: "NEA",
    country: "Japan",
    x: 76,
    y: 36,
    signal: "Methane + heat stress",
    momentum: "+6",
  },
  {
    region: "China",
    country: "China",
    x: 67,
    y: 49,
    signal: "ASF nursery recovery",
    momentum: "+9",
  },
] as const;

const STAKEHOLDER_INFLUENCE = [
  {
    region: "SEA",
    primary: "Integrators",
    secondary: "Premixers",
    influence: 86,
    motion: "Rising",
  },
  {
    region: "NEA",
    primary: "Co-op technical boards",
    secondary: "Academic KOLs",
    influence: 78,
    motion: "Stable",
  },
  {
    region: "China",
    primary: "Vet-led platform groups",
    secondary: "Large farm systems",
    influence: 91,
    motion: "Rising",
  },
  {
    region: "Oceania",
    primary: "Feedlot operators",
    secondary: "Export processors",
    influence: 71,
    motion: "Watch",
  },
] as const;

export default function MarketWatchPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-adisseo-line/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="sm" />
          </Link>
          <TenantSwitcher compact />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
          Market Watch
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-adisseo-ink-strong sm:text-[2.1rem] sm:leading-tight">
          Market, customers, and evidence — not only competitors
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-adisseo-ink">
          Pair digest trends, open questions (We Wish We Knew), and stakeholder maps with the
          same CSF / CBI / persona frame you use in{" "}
          <Link
            href={MARKETING_PLAN_PATH}
            className="font-semibold text-adisseo-crimson hover:underline"
          >
            the marketing plan hub
          </Link>
          . Competitor narratives live in{" "}
          <Link
            href={COMPETITOR_WATCH_PATH}
            className="font-semibold text-adisseo-crimson hover:underline"
          >
            Competitor Watch
          </Link>
          .
        </p>
        <p className="adi-surface mt-4 max-w-2xl rounded-xl px-4 py-3 text-xs leading-relaxed text-adisseo-ink">
          <span className="font-semibold text-adisseo-ink-strong">Article exports: </span>
          Each story in the overnight digest and in Competitor Watch has an{" "}
          <span className="font-semibold">Analysis pack</span> button — JSON with
          article fields plus deterministic CBI / CSF / persona scores for
          Copilot, trend runs, and comparison with Adisseo internal context. Trend
          cards above are summaries only (no download).
        </p>

        <section className="adi-surface mt-10 rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                <SlidersHorizontal size={11} /> Regional filters
              </p>
              <h2 className="font-display mt-2 text-xl font-semibold text-adisseo-ink-strong">
                Market trend view
              </h2>
              <p className="mt-1 max-w-xl text-sm text-adisseo-muted">
                Demo slice for Ricardo&apos;s request: region, country, and
                species decide which trends enter the monthly business review.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-widest">
              {["Last 90 days", "APAC", "Country", "Species"].map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-adisseo-line bg-adisseo-bg px-3 py-1 text-adisseo-muted"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {TREND_SLICES.map((row) => (
              <article
                key={`${row.country}-${row.species}`}
                className="rounded-2xl border border-adisseo-line/80 bg-adisseo-bg/60 p-4 shadow-adi-card"
              >
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  <span>{row.region}</span>
                  <span>&middot;</span>
                  <span>{row.country}</span>
                  <span>&middot;</span>
                  <span>{row.species}</span>
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-adisseo-ink-strong">
                  <TrendingUp size={14} className="text-adisseo-crimson" />
                  {row.signal}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-adisseo-muted">
                  {row.implication}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="adi-surface mt-6 rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                <MapPin size={11} /> APAC signal map
              </p>
              <h2 className="font-display mt-2 text-xl font-semibold text-adisseo-ink-strong">
                Where narrative pressure is building
              </h2>
              <p className="mt-1 max-w-xl text-sm text-adisseo-muted">
                Stylized regional map for workshop conversations: each marker shows
                market momentum for the current quarter.
              </p>
            </div>
            <span className="rounded-full border border-adisseo-line bg-adisseo-bg px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Demo map layer
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr,1fr]">
            <div className="rounded-2xl border border-adisseo-line bg-[radial-gradient(circle_at_20%_20%,rgba(156,42,42,0.09),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(15,76,129,0.1),transparent_45%),#f8fafc] p-4">
              <svg viewBox="0 0 100 100" className="h-64 w-full" role="img" aria-label="APAC signal map">
                <path d="M8 62 L18 54 L29 56 L34 47 L45 49 L54 41 L64 43 L71 36 L81 39 L89 31 L93 37 L84 47 L76 56 L63 59 L53 66 L43 64 L31 71 L18 72 Z" fill="#F8E8E8" stroke="#D4B4B4" strokeWidth="1.2" />
                <path d="M56 74 L65 70 L72 74 L66 81 L57 79 Z" fill="#E6EEF5" stroke="#AFC2D8" strokeWidth="1" />
                {APAC_SIGNAL_POINTS.map((p) => (
                  <g key={p.country}>
                    <circle cx={p.x} cy={p.y} r="7" fill="rgba(156,42,42,0.15)" />
                    <circle cx={p.x} cy={p.y} r="4" fill="#9C2A2A" />
                  </g>
                ))}
              </svg>
            </div>

            <div className="space-y-2">
              {APAC_SIGNAL_POINTS.map((p) => (
                <article
                  key={p.country}
                  className="rounded-xl border border-adisseo-line bg-adisseo-bg/50 px-3 py-2.5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                    {p.region} · {p.country}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-adisseo-ink-strong">
                    {p.signal}
                  </p>
                  <p className="mt-1 text-[11px] text-adisseo-crimson">
                    Momentum {p.momentum} pts vs prior month
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="adi-surface mt-6 rounded-3xl p-6">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
            <Users size={11} /> Stakeholder influence by region
          </p>
          <h2 className="font-display mt-2 text-xl font-semibold text-adisseo-ink-strong">
            Decision shapers to target first
          </h2>
          <div className="mt-4 space-y-3">
            {STAKEHOLDER_INFLUENCE.map((row) => (
              <article
                key={row.region}
                className="rounded-2xl border border-adisseo-line bg-adisseo-bg/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-adisseo-ink-strong">
                    {row.region}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                    {row.motion}
                  </p>
                </div>
                <p className="mt-1 text-xs text-adisseo-muted">
                  Primary: <span className="font-semibold text-adisseo-ink">{row.primary}</span> · Secondary: <span className="font-semibold text-adisseo-ink">{row.secondary}</span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-adisseo-crimson"
                    style={{ width: `${row.influence}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-adisseo-muted">
                  Influence score: {row.influence}/100
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="adi-surface mt-6 rounded-3xl p-6">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
            <BarChart3 size={11} /> MBR-ready takeaways
          </p>
          <ul className="mt-3 space-y-2">
            {MBR_TAKEAWAYS.map((takeaway) => (
              <li
                key={takeaway}
                className="rounded-xl border border-adisseo-line bg-adisseo-bg/40 px-4 py-3 text-sm text-adisseo-ink"
              >
                {takeaway}
              </li>
            ))}
          </ul>
        </section>

        <ul className="mt-10 space-y-4">
          {CARDS.map(({ href, title, blurb, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="adi-surface group flex gap-4 p-5 transition hover:border-adisseo-crimson hover:shadow-adi-card-hover"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-adisseo-crimson text-white">
                  <Icon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold text-adisseo-ink-strong group-hover:text-adisseo-crimson">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-adisseo-ink">{blurb}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-adisseo-crimson">
                    Open <ArrowRight size={14} />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
