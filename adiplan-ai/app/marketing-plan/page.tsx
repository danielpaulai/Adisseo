import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Grid3x3,
  Layers,
  Newspaper,
  PackageCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { COMPETITOR_WATCH_PATH, MARKET_WATCH_PATH } from "@/lib/routes";

const CARDS = [
  {
    href: "/personas-matrix",
    title: "Personas × CSF matrix",
    blurb:
      "Where buyer priority meets portfolio strength — the diagonal story regional sales can point to on a screen.",
    icon: Grid3x3,
  },
  {
    href: "/cbi-ladder",
    title: "CBI / CSF ladder",
    blurb:
      "Stakeholder outcomes laddered to value — the spine for message and campaign design.",
    icon: Layers,
  },
  {
    href: "/strategic-frame",
    title: "Total Value Solution composer",
    blurb:
      "Pain × promise × proof × proposition — exportable brief before creative execution.",
    icon: Target,
  },
  {
    href: "/plan-on-page",
    title: "Plan on a Page",
    blurb:
      "Single-sheet summary for the field: stakeholders, frames, and shipped work.",
    icon: ClipboardList,
  },
  {
    href: "/presentation",
    title: "Product narrative (deck)",
    blurb:
      "Walkthrough of the full pilot — for leadership context and training.",
    icon: BookOpen,
  },
] as const;

const CAMPAIGN_WATCH = [
  {
    source: "Competitor Watch",
    icon: Newspaper,
    input: "What competitors are pushing now",
    output: "Gap: where Adisseo can position services and proof differently",
  },
  {
    source: "Market Watch",
    icon: TrendingUp,
    input: "Region/country/species trend shifts",
    output: "Priority CBI / CSF for the monthly campaign cycle",
  },
  {
    source: "Adisseo material",
    icon: BookOpen,
    input: "Vault claims, trial data, product and service proof",
    output: "Regionally reviewable message frame",
  },
  {
    source: "Studio deliverables",
    icon: PackageCheck,
    input: "Persona, account, language, and format",
    output: "Leaflet, email, carousel, manga brochure, article, or video script",
  },
] as const;

export default function MarketingPlanPage() {
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
          Adisseo marketing plan
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-adisseo-ink-strong sm:text-[2.1rem] sm:leading-tight">
          Strategy spine — matrices, ladders, and frames
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-adisseo-ink">
          This hub holds the internal APAC marketing KPIs and frameworks: CSFs, CBIs, corporate
          personas, and composed strategy before channel execution. External signals flow in from{" "}
          <Link
            href={COMPETITOR_WATCH_PATH}
            className="font-semibold text-adisseo-crimson hover:underline"
          >
            Competitor Watch
          </Link>{" "}
          and{" "}
          <Link
            href={MARKET_WATCH_PATH}
            className="font-semibold text-adisseo-crimson hover:underline"
          >
            Market Watch
          </Link>
          .
        </p>

        <section className="adi-surface mt-10 rounded-3xl p-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
            Marketing Campaign Watch
          </p>
          <h2 className="font-display mt-2 text-xl font-semibold text-adisseo-ink-strong">
            From signals to campaign deliverables
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-adisseo-muted">
            This is the working bridge Ricardo described: competitor signals,
            market signals, and Adisseo proof become a campaign plan, then
            flow into the studio format the species manager needs.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {CAMPAIGN_WATCH.map(({ source, icon: Icon, input, output }) => (
              <article
                key={source}
                className="rounded-2xl border border-adisseo-line/80 bg-adisseo-bg/60 p-4 shadow-adi-card"
              >
                <p className="flex items-center gap-2 text-sm font-bold text-adisseo-ink-strong">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-adisseo-ink-strong text-white">
                    <Icon size={14} />
                  </span>
                  {source}
                </p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  Input
                </p>
                <p className="mt-1 text-xs text-adisseo-ink">{input}</p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  Output
                </p>
                <p className="mt-1 text-xs text-adisseo-ink">{output}</p>
              </article>
            ))}
          </div>
        </section>

        <ul className="mt-10 space-y-4">
          {CARDS.map(({ href, title, blurb, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="adi-surface group flex gap-4 p-5 transition hover:border-adisseo-crimson hover:shadow-adi-card-hover"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-adisseo-ink-strong text-white">
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
