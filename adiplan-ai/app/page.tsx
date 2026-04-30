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
  Bookmark,
  Mic,
  Activity,
  PlayCircle,
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
} from "lucide-react";
import { Logo, SpeciesIcon } from "@/components/Logo";
import { PipelineVisual } from "@/components/PipelineVisual";
import { LiveExampleCTA } from "@/components/LiveExampleCTA";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { LiveModeChip } from "@/components/LiveModeChip";

type Module = {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  species?: "aqua" | "poultry" | "ruminants" | "swine";
  stage: string;
  title: string;
  blurb: string;
  cta: string;
  ready: boolean;
  highlight?: boolean;
};

const modules: Module[] = [
  {
    href: "/stakeholder-map",
    icon: Network,
    stage: "01 · Assessing",
    title: "Stakeholder Influence Map",
    blurb:
      "Interactive bubbles, dotted future-rings, who-influences-whom arrows. 14 stakeholders pre-seeded. Click bubbles to feed the CBI Ladder. Workshop-mode multiplayer when Liveblocks key is set.",
    cta: "Open module",
    ready: true,
  },
  {
    href: "/cbi-ladder",
    icon: Layers,
    stage: "02 · Assessing",
    title: "CBI / CSF Ladder",
    blurb:
      "Auto-generates &ldquo;Help me to&hellip;&rdquo; outcomes per selected stakeholder, ladders up to underlying value (WITI). Editable rungs.",
    cta: "Open module",
    ready: true,
  },
  {
    href: "/news-bridge",
    icon: Newspaper,
    stage: "The Bridge",
    title: "News → Strategy",
    blurb:
      "Pick a scraped competitor article. Get back the CBI it surfaces, the persona to target, and three deliverable formats — grounded in the AdiPlan vocabulary.",
    cta: "Match an article",
    ready: true,
    highlight: true,
  },
  {
    href: "/strategic-frame",
    icon: Target,
    stage: "03 · Strategic Frame",
    title: "Total Value Solution composer",
    blurb:
      "Synthesises the matched CBI + persona into an Enterprise Persona, an Enterprise Insight, and a Pain × Promise × Proof × Proposition card pack. Now ships as a 1-page A4 PDF brief via @react-pdf/renderer — no browser print needed.",
    cta: "Compose a frame",
    ready: true,
  },
  {
    href: "/personas-matrix",
    icon: Grid3x3,
    stage: "04 · Upstream prioritisation",
    title: "Enterprise Personas × CSF matrix",
    blurb:
      "5 personas × 6 customer success factors. The diagonal marks where persona priority and Adisseo's strength meet — those are the cells you should always lead with. Click any cell to inspect the lead claim, flagship, and recommended deliverable, then jump straight into a Strategic Frame.",
    cta: "Open the matrix",
    ready: true,
  },
  {
    href: "/studio/swine",
    icon: Clapperboard,
    species: "swine",
    stage: "Studio · Swine (Claire)",
    title: "<60s vertical short",
    blurb:
      "TikTok / WeChat / Instagram script + storyboard. Five languages with cultural register. Account-based adaptation across CN/VN/TH/PH top-10. ElevenLabs voiceover playback.",
    cta: "Open Swine Studio",
    ready: true,
  },
  {
    href: "/studio/aqua",
    icon: FileText,
    species: "aqua",
    stage: "Studio · Aqua (Aileen)",
    title: "1-page technical leaflet",
    blurb:
      "Magazine-ready A4 PDF for Trobos Aqua (ID), Tap Chi Thuy San (VN), Aquaculture Asia (TH/EN). Real Adisseo brand styling, embedded logo, brand-guardrail audit. Output: download-ready PDF.",
    cta: "Open Aqua Studio",
    ready: true,
  },
  {
    href: "/studio/poultry",
    icon: Mail,
    species: "poultry",
    stage: "Studio · Poultry (Vish)",
    title: "AGP-Free emailer + LinkedIn carousel",
    blurb:
      "Two coordinated deliverables in one click — a technical email blast (HTML, integrator-ready) plus a 5-slide square LinkedIn carousel PDF, both anchored on the same trial-data narrative.",
    cta: "Open Poultry Studio",
    ready: true,
  },
  {
    href: "/studio/ruminants",
    icon: BookOpen,
    species: "ruminants",
    stage: "Studio · Ruminants (Antoine)",
    title: "Manga-style 2-page brochure (JP)",
    blurb:
      "Japanese-language A4 brochure with manga-cover panel, halftone-styled hero, speech bubbles + speed lines, then a 4-panel narrative spread with a stat panel and crimson CTA. Tone stays technical; layout reads like a comic issue.",
    cta: "Open Ruminants Studio",
    ready: true,
  },
  {
    href: "/studio/billboard",
    icon: Bookmark,
    stage: "05 · Creating",
    title: "Billboard Campaign generator",
    blurb:
      "AdiPlan billboard test in one button — Headline + Adisseo Differentiation + Reason to Believe + Visual brief, scored on Unique / Important / Believable. A2 portrait, A1 convention or square LinkedIn key visual.",
    cta: "Compose a billboard",
    ready: true,
  },
  {
    href: "/studio/voice-memo",
    icon: Mic,
    stage: "Studio · Voice Memo",
    title: "Voice memo → deliverable",
    blurb:
      "Antoine records 30s on his phone. Whisper transcribes. The transcript seeds whichever species studio you point it at — manga brochure, leaflet, vertical short, billboard. Authorship stays with the manager.",
    cta: "Open Voice Memo Studio",
    ready: true,
  },
  {
    href: "/dashboard",
    icon: Activity,
    stage: "Activation · Sales War Room",
    title: "What got shipped this session",
    blurb:
      "Every news match, composed strategic frame, and species deliverable — most-recent first, with conversion ratios. Open this on the big screen during the regional sales meeting.",
    cta: "Open the war room",
    ready: true,
  },
  {
    href: "/engagement-tracker",
    icon: Target,
    stage: "Activation · Engagement",
    title: "Malaysia-ASF engagement tracker",
    blurb:
      "The metric Ricardo named on the call: 7 qualified viewers (>2.5min) → 3 conversions on the swine asset. Institutionalised across every shipped deliverable, graded against the 43% benchmark.",
    cta: "Open the tracker",
    ready: true,
  },
  {
    href: "/wwwk",
    icon: HelpCircle,
    stage: "02 · Assessing",
    title: "We Wish We Knew (WWWK) board",
    blurb:
      "The questions that, if answered, would change a decision — not just inform one. Per-stakeholder, per-CBI, with hypothesis, method, priority, and an answer-capture textarea. CSV export feeds the regional research backlog.",
    cta: "Open the board",
    ready: true,
  },
  {
    href: "/plan-on-page",
    icon: ClipboardList,
    stage: "Executing",
    title: "Plan on a Page generator",
    blurb:
      "Single-sheet A4 strategy summary that pulls everything in your session — stakeholders moved, frame composed, deliverables shipped, KPI targets — into one printable PDF for regional sales / KAMs.",
    cta: "Generate the plan",
    ready: true,
  },
  {
    href: "/approval-queue",
    icon: ShieldCheck,
    stage: "HQ desk · Brand-guardrail",
    title: "Approval queue",
    blurb:
      "Vish's #1 blocker on Apr 28: HQ brand-guardrail compliance gates every poultry carousel. Every deliverable can be sent to HQ, reviewed by Ricardo with a comment, and audited — with the decision logged to the war room.",
    cta: "Open the queue",
    ready: true,
  },
  {
    href: "/trust-layer",
    icon: ShieldCheck,
    stage: "Phase 1 · Trust layer",
    title: "Prose-quality scorer + brand-voice gate",
    blurb:
      "Every studio deliverable runs through four checks before it can hit the HQ queue: slop-detector (16 LLM-tic rule families), brand-voice (per-customer banned-terms + claim guardrails), citation depth (Vault-resolved references), and LanguageTool grammar in EN / ZH / VI / TH / JA / ID. Below 60 — blocked. Below 80 — won't be graded above benchmark in the engagement tracker.",
    cta: "Score live prose",
    ready: true,
    highlight: true,
  },
  {
    href: "/vault",
    icon: Library,
    stage: "Phase 2 · Research depth",
    title: "Adisseo Vault",
    blurb:
      "The customer knowledge base every studio anchors against. Trial protocols, field observations, regulatory references, integrator quotes, peer-reviewed papers, product specs. Studios pull a citation with one click; trust layer measures how well each deliverable is anchored.",
    cta: "Browse the Vault",
    ready: true,
  },
  {
    href: "/research-deep",
    icon: Telescope,
    stage: "Phase 2 · Research depth",
    title: "Deep-research agent",
    blurb:
      "gpt-researcher-style multi-step retrieval. Decomposes a question into 6 sub-queries (numbers, regulation, competitor, integrator-voice, mechanism, timing), runs each against the Vault, and composes a footnoted briefing. Studios call this before drafting so claims start anchored.",
    cta: "Try the agent",
    ready: true,
    highlight: true,
  },
  {
    href: "/digest",
    icon: Coffee,
    stage: "Phase 2 · Distribution",
    title: "04:00 species-manager digest",
    blurb:
      "gpt-newspaper-style overnight competitor briefing. Per species manager: 3 stories pulled from APAC competitors, each pre-paired with the Vault entry that backs the response, plus the recommended deliverable kind for today. In production this fires on a 04:00 cron and lands in their inbox.",
    cta: "Preview the digest",
    ready: true,
  },
  {
    href: "/voice-fingerprint",
    icon: Fingerprint,
    stage: "Phase 3 · Voice fingerprint",
    title: "Per-manager voice profile",
    blurb:
      "DSPy-style fingerprint of how each species manager actually writes — sentence length, hedging rate, citation density, em-dash habits, signature 3-grams. The trust layer adds a 'voice match' sub-score so a draft sounds like the human shipping it. Vish, Aileen, Antoine, Claire, Ricardo all seeded.",
    cta: "Tune a profile",
    ready: true,
  },
  {
    href: "/og-cards",
    icon: ImageIcon,
    stage: "Phase 3 · Distribution",
    title: "OG-card generator (Vercel Satori)",
    blurb:
      "Every shipped deliverable produces a 1200×630 LinkedIn card or 1200×1200 square — from URL params, no Photoshop. The trust score and citation count travel with the card so the quality signal is visible to the recipient before they click.",
    cta: "Preview the cards",
    ready: true,
  },
  {
    href: "/observability",
    icon: Eye,
    stage: "Phase 3 · Trust",
    title: "LLM observability (Langfuse-style)",
    blurb:
      "Every model call — score-prose, research-deep, match-article, render-* — pushes a span to an in-memory ring. Latency, cost, model id, deterministic-vs-LLM flag, trust score. For Adisseo's IT/legal team. Swap for Langfuse / Helicone when shipping.",
    cta: "Open the trace ring",
    ready: true,
  },
  {
    href: "/tenants",
    icon: Building2,
    stage: "Phase 4 · Multi-tenant",
    title: "Tenant directory (Adisseo / DSM / Cargill / Kemin)",
    blurb:
      "AdiPlan is tenant-aware. Each tenant carries its own brand voice, Vault scope, trust floor, approved channels, and reviewer label. Switch the tenant in the top-bar and every consumer rescopes — ProseQualityCard, Vault, Distribution, Engagement, Approval queue.",
    cta: "Browse tenants",
    ready: true,
  },
  {
    href: "/distribution",
    icon: Share2,
    stage: "Phase 5 · Closed loop",
    title: "Distribution rails — preview / ship / schedule / measure",
    blurb:
      "Each channel has a typed adapter producing a channel-native preview (LinkedIn carousel, WeChat OA card, WhatsApp bubble, email, trade-mag submission). Ship now, queue for later, or simulate the inbound engagement webhook. Every shipped deliverable auto-creates a DeliverableInstance and the trackers light up in real time.",
    cta: "Open distribution rails",
    ready: true,
  },
  {
    href: "/credentials",
    icon: KeyRound,
    stage: "Phase 6 · Production-readiness",
    title: "Channel credentials & HMAC-signed webhooks",
    blurb:
      "Every tenant + channel declares the env vars it needs to flip from mock to live. The dispatcher detects presence at request time and falls back to mock when anything's missing. Inbound webhooks land at /api/webhook/[tenant]/[channel] with HMAC-SHA256 verification (Stripe-style headers), 5-minute replay guard, and a per-tenant secret. Per-channel rate-limits and exponential-backoff retry round out the production shell.",
    cta: "Open credentials matrix",
    ready: true,
  },
];

const upcoming = [
  {
    species: null,
    text: "Phase 7 · Swap dispatcher live-shells for actual LinkedIn UGC / WeChat OA Publish / WhatsApp Cloud / Mailgun / editorial-portal HTTP calls (Phase 6 ships the credential matrix, HMAC verify, retry, and rate-limit plumbing — only the fetch() bodies remain)",
  },
  {
    species: null,
    text: "Replace in-memory trace ring + webhook inbox with Langfuse / Helicone + a durable event store",
  },
  {
    species: null,
    text: "Voice profiles trained on actual manager writing samples (currently seeded with believable defaults)",
  },
  {
    species: null,
    text: "Per-tenant Vault ingestion pipeline (pgvector + Mistral OCR) — replace seeded entries with real customer R&D archive",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-adisseo-muted sm:inline">
              Demo target:{" "}
              <span className="font-medium text-adisseo-ink-strong">Thu May 7, 2026</span>
            </span>
            <LiveModeChip />
            <TenantSwitcher compact />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
            <Sparkles size={12} />
            AdiPlan AI &middot; APAC Pilot
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-adisseo-ink-strong sm:text-5xl">
            News &rarr; Strategy &rarr; Deliverable
          </h1>
          <p className="max-w-3xl text-base text-adisseo-ink">
            The bridge between Adisseo&apos;s competitor news scraper and the AdiPlan
            marketing framework. Built for Ricardo Communod (Adisseo APAC), demoing to
            the global team.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/presentation"
              className="group flex items-center gap-2 rounded-lg bg-adisseo-ink-strong px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <BookOpen size={14} />
              Open the deep deck
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-2 rounded-lg border border-adisseo-line bg-white px-4 py-2.5 text-sm font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              <PlayCircle size={14} /> Take the 2-min walkthrough{" "}
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/news-bridge"
              className="flex items-center gap-2 rounded-lg border border-dashed border-adisseo-line bg-white/60 px-4 py-2.5 text-sm font-semibold text-adisseo-muted transition hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              Or jump straight to News Bridge <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 pt-3 text-[11px]">
            <span className="rounded-full bg-adisseo-crimson/10 px-3 py-1 font-medium text-adisseo-crimson">
              xyflow + d3-force
            </span>
            <span className="rounded-full bg-adisseo-cyan/10 px-3 py-1 font-medium text-adisseo-cyan">
              Liveblocks workshop mode
            </span>
            <span className="rounded-full bg-adisseo-orange/10 px-3 py-1 font-medium text-adisseo-orange">
              ElevenLabs 5-language voiceover
            </span>
            <span className="rounded-full bg-adisseo-line-soft px-3 py-1 font-medium text-adisseo-ink">
              Vercel AI SDK
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
              Governance seam: external LLMs OK on public/scraped only
            </span>
          </div>
        </div>

        <div className="mt-10">
          <PipelineVisual />
        </div>

        <div className="mt-6">
          <LiveExampleCTA />
        </div>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`group relative flex flex-col rounded-2xl border bg-white p-6 transition hover:shadow-lg ${
                  m.highlight
                    ? "border-adisseo-crimson"
                    : "border-adisseo-line hover:border-adisseo-crimson/60"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
                    <Icon size={18} />
                  </div>
                  {m.species && (
                    <SpeciesIcon
                      species={m.species}
                      size={36}
                      className="opacity-70 transition group-hover:opacity-100"
                    />
                  )}
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
                  {m.stage}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-adisseo-ink-strong">
                  {m.title}
                </h2>
                <p
                  className="mt-2 flex-1 text-sm text-adisseo-ink"
                  dangerouslySetInnerHTML={{ __html: m.blurb }}
                />
                <p className="mt-4 flex items-center gap-1 text-sm font-medium text-adisseo-crimson group-hover:underline">
                  {m.cta} <ArrowRight size={14} />
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-adisseo-line bg-white/60 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-muted">
            Coming next (V1 + V2)
          </p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {upcoming.map((u) => (
              <li
                key={u.text}
                className="flex items-center gap-2 text-adisseo-ink"
              >
                {u.species ? (
                  <SpeciesIcon
                    species={u.species as "aqua" | "poultry" | "ruminants" | "swine"}
                    size={20}
                    className="opacity-60"
                  />
                ) : (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-adisseo-muted-soft" />
                )}
                {u.text}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-12 flex items-center justify-between border-t border-adisseo-line pt-6 text-xs text-adisseo-muted">
          <span>Built in Cursor · Apr 28, 2026</span>
          <span>
            Next call:{" "}
            <span className="font-medium text-adisseo-ink-strong">
              Thu Apr 30, 9:30 AM
            </span>
          </span>
        </footer>
      </div>
    </main>
  );
}
