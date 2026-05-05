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
  LayoutDashboard,
} from "lucide-react";
import { Logo, SpeciesIcon } from "@/components/Logo";
import { PipelineVisual } from "@/components/PipelineVisual";
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

const CATEGORY_COPY: Record<
  CategoryId,
  { title: string; subtitle: string; whereInProduct: string }
> = {
  intelligence: {
    title: "Competitor intelligence",
    subtitle:
      "Turn scraped competitor signals into structured inputs for positioning and creative.",
    whereInProduct:
      "Start in Competitor Watch for the live feed, filters, and roll-ups — then use Digest and deep research from Market Watch when you need the broader market pulse.",
  },
  stakeholders: {
    title: "Stakeholder context",
    subtitle:
      "Map who influences whom, then fan messaging across buyers, regions, and campaigns.",
    whereInProduct:
      "Maps and fan-outs feed article matching and studio defaults, so creative stays tied to the stakeholders you selected.",
  },
  strategy: {
    title: "Strategy layer",
    subtitle:
      "Ladders, matrices, and composed frames before you open a species studio.",
    whereInProduct:
      "Outputs here become the brief behind Generate — persona, claims, and matrices carry straight into poultry / aqua / swine / ruminants flows.",
  },
  studios: {
    title: "Species studios",
    subtitle:
      "Channel-ready deliverables by vertical — poultry, aqua, swine, ruminants, plus voice intake.",
    whereInProduct:
      "After Generate, each studio shows prose trust scoring on the quality card and a regional brand review hand-off when needed — that is where governance meets the species manager.",
  },
  operations: {
    title: "Brand-safe shipping & visibility",
    subtitle:
      "Ground claims, pass gates, route regional brand approvals, ship to channels, and see engagement — plus controls for multi-tenant rollout.",
    whereInProduct:
      "Vault backs citations during drafting; trust checks run beside studio output; the approval queue receives regional submissions; distribution and engagement pick up after send. Tenant directory, channel credentials, and model traces are mainly for IT when wiring live channels — they unlock the same path at scale.",
  },
};

const CATEGORY_ORDER: CategoryId[] = [
  "intelligence",
  "stakeholders",
  "strategy",
  "studios",
  "operations",
];

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

function ModuleCard({ m }: { m: Module }) {
  const Icon = m.icon;
  return (
    <Link
      href={m.href}
      className={`group relative flex flex-col rounded-2xl border bg-white p-5 transition hover:shadow-lg sm:p-6 ${
        m.highlight
          ? "border-adisseo-crimson"
          : "border-adisseo-line hover:border-adisseo-crimson/60"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
          <Icon size={18} />
        </div>
        {m.species && (
          <SpeciesIcon
            species={m.species}
            size={32}
            className="opacity-70 transition group-hover:opacity-100"
          />
        )}
      </div>
      <h3 className="text-base font-semibold text-adisseo-ink-strong">{m.title}</h3>
      <p
        className="mt-2 flex-1 text-sm leading-relaxed text-adisseo-ink"
        dangerouslySetInnerHTML={{ __html: m.blurb }}
      />
      <p className="mt-4 flex items-center gap-1 text-sm font-medium text-adisseo-crimson group-hover:underline">
        {m.cta} <ArrowRight size={14} />
      </p>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
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

      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14">
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
            <Sparkles size={12} />
            APAC · Adisseo
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-adisseo-ink-strong sm:text-5xl">
            Competitor Watch, Market Watch, Adisseo marketing plan
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-adisseo-ink">
            Three entry points: scraped competitor narratives, market and stakeholder context, then
            the matrices and ladders that tie signals to CSFs, CBIs, and corporate personas —
            before species studios and channels (when you choose to go there).
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link
              href="/competitor-watch"
              className="group flex flex-col rounded-2xl border-2 border-adisseo-crimson/40 bg-white p-5 shadow-sm transition hover:border-adisseo-crimson hover:shadow-md"
            >
              <Newspaper size={22} className="text-adisseo-crimson" />
              <h2 className="mt-3 text-base font-bold text-adisseo-ink-strong">
                Competitor Watch
              </h2>
              <p className="mt-2 flex-1 text-sm text-adisseo-ink">
                Filters, word cloud, CBI / CSF / persona roll-ups, and deep article match.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-adisseo-crimson group-hover:underline">
                Open <ArrowRight size={14} />
              </span>
            </Link>
            <Link
              href="/market-watch"
              className="group flex flex-col rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm transition hover:border-adisseo-crimson hover:shadow-md"
            >
              <Globe2 size={22} className="text-adisseo-crimson" />
              <h2 className="mt-3 text-base font-bold text-adisseo-ink-strong">Market Watch</h2>
              <p className="mt-2 flex-1 text-sm text-adisseo-ink">
                Digest, We Wish We Knew, stakeholder map, Vault research — regional and customer lens.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-adisseo-crimson group-hover:underline">
                Open <ArrowRight size={14} />
              </span>
            </Link>
            <Link
              href="/marketing-plan"
              className="group flex flex-col rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm transition hover:border-adisseo-crimson hover:shadow-md"
            >
              <LayoutDashboard size={22} className="text-adisseo-ink-strong" />
              <h2 className="mt-3 text-base font-bold text-adisseo-ink-strong">
                Adisseo marketing plan
              </h2>
              <p className="mt-2 flex-1 text-sm text-adisseo-ink">
                Persona × CSF matrix, CBI ladder, strategic frame, plan on a page, narrative deck.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-adisseo-crimson group-hover:underline">
                Open <ArrowRight size={14} />
              </span>
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4 sm:gap-4">
            {(
              [
                { step: "1", title: "Monitor", detail: "Competitor Watch" },
                { step: "2", title: "Context", detail: "Market Watch" },
                { step: "3", title: "Position", detail: "Matrices & frames" },
                { step: "4", title: "Produce & ship", detail: "Studios · approvals" },
              ] as const
            ).map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-adisseo-line bg-white px-4 py-3 shadow-sm"
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
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/competitor-watch"
              className="group flex items-center gap-2 rounded-lg bg-adisseo-ink-strong px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Open Competitor Watch
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/presentation"
              className="flex items-center gap-2 rounded-lg border border-adisseo-line bg-white px-4 py-2.5 text-sm font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              <BookOpen size={14} />
              Product narrative deck
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg border border-adisseo-crimson/40 bg-white px-4 py-2.5 text-sm font-semibold text-adisseo-ink-strong shadow-sm transition hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              <KeyRound size={14} className="text-adisseo-crimson" />
              Sign in to APAC
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <PipelineVisual />
        </div>

        <div className="mt-14 space-y-14">
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_COPY[cat];
            const items = modules.filter((m) => m.category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat} className="scroll-mt-8">
                <div className="mb-5 max-w-3xl">
                  <h2 className="text-xl font-bold tracking-tight text-adisseo-ink-strong sm:text-2xl">
                    {meta.title}
                  </h2>
                  <p className="mt-1 text-sm text-adisseo-ink">{meta.subtitle}</p>
                  <p className="mt-4 rounded-xl border border-adisseo-line bg-white px-4 py-3 text-xs leading-relaxed text-adisseo-ink shadow-sm">
                    <span className="font-semibold text-adisseo-ink-strong">
                      In the app:{" "}
                    </span>
                    {meta.whereInProduct}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((m) => (
                    <ModuleCard key={m.href} m={m} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-16 flex flex-col gap-2 border-t border-adisseo-line pt-8 text-xs text-adisseo-muted sm:flex-row sm:items-center sm:justify-between">
          <span>APAC AI · Adisseo APAC</span>
          <span className="text-adisseo-muted-soft">
            Competitor Watch on the left, marketing plan in the middle, delivery rails on the right — same pilot.
          </span>
        </footer>
      </div>
    </main>
  );
}
