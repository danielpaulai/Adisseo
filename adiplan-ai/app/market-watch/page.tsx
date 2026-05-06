import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Coffee,
  HelpCircle,
  Library,
  Network,
  SlidersHorizontal,
  Telescope,
  TrendingUp,
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
