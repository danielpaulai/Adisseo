import Link from "next/link";
import {
  Network,
  Layers,
  Newspaper,
  Clapperboard,
  FileText,
  Mail,
  BookOpen,
  Target,
  ArrowRight,
  Sparkles,
  Grid3x3,
  Mic,
  Activity,
  ShieldCheck,
  HelpCircle,
  ClipboardList,
  Library,
  Telescope,
  Coffee,
  Fingerprint,
  Image as ImageIcon,
  Eye,
  Building2,
  Share2,
  KeyRound,
  Bird,
  Globe2,
} from "lucide-react";
import { Logo, SpeciesIcon } from "@/components/Logo";
import { TenantSwitcher } from "@/components/TenantSwitcher";

type CategoryId =
  | "intelligence"
  | "stakeholders"
  | "strategy"
  | "studios"
  | "operations";

type Module = {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  species?: "aqua" | "poultry" | "ruminants" | "swine";
  category: CategoryId;
  title: string;
  blurb: string;
  cta: string;
  ready: boolean;
  highlight?: boolean;
};

const CATEGORY_COPY: Record<CategoryId, { title: string; subtitle: string }> = {
  intelligence: {
    title: "Competitor intelligence",
    subtitle: "Feeds, digest, deep research.",
  },
  stakeholders: {
    title: "Stakeholder context",
    subtitle: "Fan-out, ladders, WWWK.",
  },
  strategy: {
    title: "Strategy layer",
    subtitle: "Frames, plan on a page, marketing plan hub.",
  },
  studios: {
    title: "Species studios",
    subtitle: "Deliverable generation — use when you are ready.",
  },
  operations: {
    title: "Shipping & controls",
    subtitle: "Vault, trust, approvals, tenants, traces.",
  },
};

const CATEGORY_ORDER: CategoryId[] = [
  "intelligence",
  "stakeholders",
  "strategy",
  "studios",
  "operations",
];

/** Thursday walkthrough — keep the home surface calm; everything else lives in the sidebar. */
const FOCUS_HREFS = new Set<string>([
  "/competitor-watch",
  "/market-watch",
  "/stakeholder-map",
  "/personas-matrix",
]);

const modules: Module[] = [
  {
    href: "/competitor-watch",
    icon: Newspaper,
    category: "intelligence",
    title: "Competitor Watch",
    blurb:
      "Filtered competitor news with CSF / CBI / persona word cloud and roll-ups — deep-match any headline to the APAC framework.",
    cta: "Open Competitor Watch",
    ready: true,
    highlight: true,
  },
  {
    href: "/digest",
    icon: Coffee,
    category: "intelligence",
    title: "Species-manager digest",
    blurb:
      "Overnight briefing: top competitor stories per species, Vault-backed context, and suggested deliverable types.",
    cta: "Preview digest",
    ready: true,
  },
  {
    href: "/research-deep",
    icon: Telescope,
    category: "intelligence",
    title: "Deep-research agent",
    blurb:
      "Multi-step retrieval over the Vault — footnoted briefings studios can draft against.",
    cta: "Run research",
    ready: true,
    highlight: true,
  },
  {
    href: "/stakeholder-map",
    icon: Network,
    category: "stakeholders",
    title: "Stakeholder influence map",
    blurb:
      "Interactive influence graph: stakeholders, future rings, and decision arrows. Feed the CBI ladder and downstream work.",
    cta: "Open map",
    ready: true,
  },
  {
    href: "/stakeholder-fanout",
    icon: Network,
    category: "stakeholders",
    title: "Stakeholder fan-out",
    blurb:
      "One article plus saved maps → persona-tuned variants across formats and channels.",
    cta: "Open fan-out",
    ready: true,
    highlight: true,
  },
  {
    href: "/campaign-fanout",
    icon: Bird,
    species: "poultry",
    category: "stakeholders",
    title: "Campaign fan-out · TFIP",
    blurb:
      "One campaign narrative → multiple buyer × channel variants wired into poultry studio flows.",
    cta: "Open campaign fan-out",
    ready: true,
    highlight: true,
  },
  {
    href: "/poultry-workshop",
    icon: BookOpen,
    species: "poultry",
    category: "stakeholders",
    title: "Poultry workshop reference",
    blurb:
      "Structured HTML reference: personas, ladders, value props, and measurement framing for poultry campaigns.",
    cta: "Open reference deck",
    ready: true,
  },
  {
    href: "/cbi-ladder",
    icon: Layers,
    category: "stakeholders",
    title: "CBI / CSF ladder",
    blurb:
      "Generate and edit &ldquo;Help me to…&rdquo; outcomes per stakeholder, laddered to underlying value.",
    cta: "Open ladder",
    ready: true,
  },
  {
    href: "/wwwk",
    icon: HelpCircle,
    category: "stakeholders",
    title: "We Wish We Knew board",
    blurb:
      "Decision-critical unknowns per stakeholder and CBI — capture hypotheses, methods, and answers.",
    cta: "Open board",
    ready: true,
  },
  {
    href: "/strategic-frame",
    icon: Target,
    category: "strategy",
    title: "Total Value Solution composer",
    blurb:
      "Pain × promise × proof × proposition — exportable strategic frame brief for alignment before creative.",
    cta: "Compose frame",
    ready: true,
  },
  {
    href: "/personas-matrix",
    icon: Grid3x3,
    category: "strategy",
    title: "Enterprise personas × CSF matrix",
    blurb:
      "Prioritise where persona need meets product strength — jump into frames and studios from each cell.",
    cta: "Open matrix",
    ready: true,
  },
  {
    href: "/plan-on-page",
    icon: ClipboardList,
    category: "strategy",
    title: "Plan on a Page",
    blurb:
      "Single-sheet summary of stakeholders, frames, and shipped work — printable for field teams.",
    cta: "Generate plan",
    ready: true,
  },
  {
    href: "/studio/poultry",
    icon: Mail,
    species: "poultry",
    category: "studios",
    title: "Poultry studio",
    blurb:
      "Coordinated email and LinkedIn carousel from one narrative — HTML and PDF outputs.",
    cta: "Open poultry studio",
    ready: true,
  },
  {
    href: "/studio/aqua",
    icon: FileText,
    species: "aqua",
    category: "studios",
    title: "Aqua studio",
    blurb:
      "Magazine-style technical leaflet — brand-checked PDF for regional trade and digital use.",
    cta: "Open aqua studio",
    ready: true,
  },
  {
    href: "/studio/swine",
    icon: Clapperboard,
    species: "swine",
    category: "studios",
    title: "Swine studio",
    blurb:
      "Short-form vertical script and storyboard — multi-language voiceover where configured.",
    cta: "Open swine studio",
    ready: true,
  },
  {
    href: "/studio/ruminants",
    icon: BookOpen,
    species: "ruminants",
    category: "studios",
    title: "Ruminants studio",
    blurb:
      "Manga-format brochure layout with technical tone — Japanese-market oriented defaults.",
    cta: "Open ruminants studio",
    ready: true,
  },
  {
    href: "/studio/voice-memo",
    icon: Mic,
    category: "studios",
    title: "Voice memo intake",
    blurb:
      "Transcribe a short memo and route the text into the studio you choose.",
    cta: "Open voice memo",
    ready: false,
  },
  {
    href: "/vault",
    icon: Library,
    category: "operations",
    title: "Adisseo Vault",
    blurb:
      "Trial data, specs, and citations studios pull from — anchors trust scoring and claims.",
    cta: "Browse Vault",
    ready: true,
  },
  {
    href: "/trust-layer",
    icon: ShieldCheck,
    category: "operations",
    title: "Prose quality & brand gate",
    blurb:
      "Automated checks on voice, citations, and grammar before regional sign-off or external send.",
    cta: "Open trust layer",
    ready: true,
    highlight: true,
  },
  {
    href: "/approval-queue",
    icon: ShieldCheck,
    category: "operations",
    title: "Approval queue",
    blurb:
      "Brand-guardrail reviews with comments and audit trail tied to each deliverable.",
    cta: "Open queue",
    ready: true,
  },
  {
    href: "/dashboard",
    icon: Activity,
    category: "operations",
    title: "Session war room",
    blurb:
      "What shipped this cycle — frames, studios, and ratios for regional reviews.",
    cta: "Open dashboard",
    ready: true,
  },
  {
    href: "/engagement-tracker",
    icon: Target,
    category: "operations",
    title: "Engagement tracker",
    blurb:
      "Channel metrics per deliverable — opens, clicks, qualified views, and benchmarks.",
    cta: "Open tracker",
    ready: true,
  },
  {
    href: "/distribution",
    icon: Share2,
    category: "operations",
    title: "Distribution rails",
    blurb:
      "Preview, ship, or schedule per channel — adapters for email, social, and messaging surfaces.",
    cta: "Open distribution",
    ready: true,
  },
  {
    href: "/credentials",
    icon: KeyRound,
    category: "operations",
    title: "Channel credentials",
    blurb:
      "Env-driven flip from mock to live sends — webhooks with signed verification.",
    cta: "Open credentials",
    ready: true,
  },
  {
    href: "/tenants",
    icon: Building2,
    category: "operations",
    title: "Tenant directory",
    blurb:
      "Workshop simulation for brand voice, Vault scope, trust floor, and reviewer routing.",
    cta: "Manage tenants",
    ready: true,
  },
  {
    href: "/voice-fingerprint",
    icon: Fingerprint,
    category: "operations",
    title: "Manager voice profiles",
    blurb:
      "Fingerprint writing style so drafts stay recognisably human per species lead.",
    cta: "Tune profiles",
    ready: true,
  },
  {
    href: "/og-cards",
    icon: ImageIcon,
    category: "operations",
    title: "OG card generator",
    blurb:
      "Social preview images from shipped URLs — quality signals embedded in the asset.",
    cta: "Preview cards",
    ready: true,
  },
  {
    href: "/observability",
    icon: Eye,
    category: "operations",
    title: "LLM observability",
    blurb:
      "Trace ring for model calls — latency, cost, and trust metadata for ops and compliance.",
    cta: "View traces",
    ready: true,
  },
];

function HomeSidebar() {
  return (
    <aside className="adi-surface p-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
        All other modules
      </p>
      <p className="mt-1 text-xs leading-relaxed text-adisseo-muted">
        Studios, approvals, and channel rails stay here until you want to show
        them. Full narrative deck is linked below.
      </p>
      <div className="mt-4 space-y-5">
        {CATEGORY_ORDER.map((cat) => {
          const meta = CATEGORY_COPY[cat];
          const items = modules.filter(
            (m) => m.category === cat && !FOCUS_HREFS.has(m.href)
          );
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-adisseo-ink-strong">
                {meta.title}
              </p>
              <p className="text-[10px] text-adisseo-muted">{meta.subtitle}</p>
              <ul className="mt-2 space-y-1 border-t border-adisseo-line/80 pt-2">
                {items.map((m) => {
                  const Icon = m.icon;
                  return (
                    <li key={m.href}>
                      <Link
                        href={m.href}
                        className={`group flex items-start gap-2 rounded-lg px-1.5 py-1 text-xs transition hover:bg-adisseo-bg ${
                          m.ready ? "text-adisseo-ink" : "text-adisseo-muted"
                        }`}
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-adisseo-crimson/10 text-adisseo-crimson">
                          <Icon size={12} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-medium text-adisseo-ink-strong group-hover:text-adisseo-crimson">
                            {m.title}
                          </span>
                          {!m.ready && (
                            <span className="ml-1 text-[10px] text-amber-700">
                              (soon)
                            </span>
                          )}
                        </span>
                        {m.species && (
                          <SpeciesIcon species={m.species} size={18} className="shrink-0 opacity-50" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="mt-5 space-y-2 border-t border-adisseo-line pt-4 text-[10px]">
        <Link
          href="/marketing-plan"
          className="flex items-center gap-1 font-semibold text-adisseo-cyan hover:underline"
        >
          Adisseo marketing plan hub <ArrowRight size={10} />
        </Link>
        <Link
          href="/presentation"
          className="flex items-center gap-1 font-semibold text-adisseo-muted hover:text-adisseo-crimson"
        >
          Product narrative deck <ArrowRight size={10} />
        </Link>
      </div>
    </aside>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-adisseo-line/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
          <Logo size="md" />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <a
              href="/api/render-adisseo-onepager"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-md border border-adisseo-line bg-white px-2.5 py-1 text-[10px] font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson hover:text-adisseo-crimson md:inline-flex"
              title="One-page executive brief (PDF)."
            >
              PDF brief
            </a>
            <Link
              href="/design-system"
              className="hidden rounded-md border border-adisseo-line bg-white px-2.5 py-1 text-[10px] font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson hover:text-adisseo-crimson md:inline-flex"
            >
              Design system
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-md border border-adisseo-crimson/35 bg-adisseo-warmth/50 px-3 py-1.5 text-xs font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson hover:bg-white hover:text-adisseo-crimson"
            >
              <KeyRound size={14} className="text-adisseo-crimson" aria-hidden />
              Sign in
            </Link>
            <TenantSwitcher compact />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)] xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-6">
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
                <Sparkles size={12} />
                Thursday focus · APAC
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-adisseo-ink-strong sm:text-[2.35rem] sm:leading-tight">
                Competitor Watch, Market Watch, stakeholder map, and matrix
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-adisseo-ink sm:text-base">
                Lead with how scraped competitor signals roll into CSFs, CBIs,
                corporate personas, and{" "}
                <span className="whitespace-nowrap">We Wish We Knew</span> — then
                show the stakeholder influence map and the personas × CSF matrix.
                Species studios and delivery rails stay in the sidebar until you
                choose to open that conversation.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/competitor-watch"
                className="group flex flex-col rounded-2xl border-2 border-adisseo-crimson/45 bg-white p-5 shadow-adi-card transition hover:border-adisseo-crimson hover:shadow-adi-card-hover sm:p-6"
              >
                <Newspaper size={22} className="text-adisseo-crimson" />
                <h2 className="mt-3 text-base font-bold text-adisseo-ink-strong">
                  Competitor Watch
                </h2>
                <p className="mt-2 flex-1 text-sm text-adisseo-ink">
                  Scraped articles, filters, word cloud, roll-ups, and per-article
                  match — plus an{" "}
                  <span className="font-semibold">Analysis pack</span> download
                  for Copilot and trend work.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-adisseo-crimson group-hover:underline">
                  Open Competitor Watch <ArrowRight size={14} />
                </span>
              </Link>
              <Link
                href="/market-watch"
                className="group flex flex-col rounded-2xl border border-adisseo-line/90 bg-white p-5 shadow-adi-card transition hover:border-adisseo-crimson hover:shadow-adi-card-hover sm:p-6"
              >
                <Globe2 size={22} className="text-adisseo-crimson" />
                <h2 className="mt-3 text-base font-bold text-adisseo-ink-strong">
                  Market Watch
                </h2>
                <p className="mt-2 flex-1 text-sm text-adisseo-ink">
                  Market trend views, MBR-ready takeaways, and the bridge from
                  signals to internal marketing KPIs and planning.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-adisseo-crimson group-hover:underline">
                  Open Market Watch <ArrowRight size={14} />
                </span>
              </Link>
              <Link
                href="/stakeholder-map"
                className="group flex flex-col rounded-2xl border border-adisseo-line/90 bg-white p-5 shadow-adi-card transition hover:border-adisseo-crimson hover:shadow-adi-card-hover sm:p-6"
              >
                <Network size={22} className="text-adisseo-crimson" />
                <h2 className="mt-3 text-base font-bold text-adisseo-ink-strong">
                  Stakeholder map
                </h2>
                <p className="mt-2 flex-1 text-sm text-adisseo-ink">
                  Influence graph — who moves whom, future rings, and arrows into
                  the rest of the stack.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-adisseo-crimson group-hover:underline">
                  Open map <ArrowRight size={14} />
                </span>
              </Link>
              <Link
                href="/personas-matrix"
                className="group flex flex-col rounded-2xl border border-adisseo-line/90 bg-white p-5 shadow-adi-card transition hover:border-adisseo-crimson hover:shadow-adi-card-hover sm:p-6"
              >
                <Grid3x3 size={22} className="text-adisseo-crimson" />
                <h2 className="mt-3 text-base font-bold text-adisseo-ink-strong">
                  Personas × CSF matrix
                </h2>
                <p className="mt-2 flex-1 text-sm text-adisseo-ink">
                  Where persona need meets product strength — the matrix view
                  alongside Competitor Watch and Market Watch.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-adisseo-crimson group-hover:underline">
                  Open matrix <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { step: "1", title: "Scrape & score", detail: "Competitor Watch" },
                  { step: "2", title: "Market lens", detail: "KPIs · CSFs · personas · WWWK" },
                  { step: "3", title: "Map & matrix", detail: "Stakeholders × CSF grid" },
                ] as const
              ).map((s) => (
                <div
                  key={s.step}
                  className="rounded-xl border border-adisseo-line/90 bg-white px-4 py-3 shadow-adi-card"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-adisseo-crimson">
                    Step {s.step}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-adisseo-ink-strong">
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-xs text-adisseo-muted">{s.detail}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/competitor-watch"
                className="group inline-flex items-center gap-2 rounded-lg bg-adisseo-ink-strong px-4 py-2.5 text-sm font-semibold text-white shadow-adi-card transition hover:opacity-90"
              >
                Start with Competitor Watch
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-adisseo-crimson/40 bg-white px-4 py-2.5 text-sm font-semibold text-adisseo-ink-strong shadow-adi-card transition hover:border-adisseo-crimson hover:text-adisseo-crimson"
              >
                <KeyRound size={14} className="text-adisseo-crimson" />
                Sign in to APAC
              </Link>
            </div>

            <footer className="border-t border-adisseo-line pt-8 text-xs text-adisseo-muted">
              <span>APAC AI · Adisseo APAC</span>
            </footer>
          </div>

          <div className="min-w-0">
            <details className="group adi-surface lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-adisseo-ink-strong [&::-webkit-details-marker]:hidden">
                All other modules
                <ArrowRight
                  size={14}
                  className="text-adisseo-muted transition group-open:rotate-90"
                />
              </summary>
              <div className="border-t border-adisseo-line p-3 pt-0">
                <HomeSidebar />
              </div>
            </details>
            <div className="hidden lg:block">
              <HomeSidebar />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
