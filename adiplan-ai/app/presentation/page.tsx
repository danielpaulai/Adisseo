import Link from "next/link";
import {
  ArrowRight,
  Network,
  Layers,
  Newspaper,
  Target,
  Grid3x3,
  FileText,
  Mail,
  Clapperboard,
  BookOpen,
  Quote,
  Sparkles,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Compass,
  Bookmark,
  Globe2,
  Database,
  Cpu,
  ShieldCheck,
  Languages,
  Radio,
  Mic,
  Activity,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PipelineVisual } from "@/components/PipelineVisual";

/* =============================================================================
 * /presentation — the deep deck.
 *
 * Long-scrolling editorial page Ricardo / global team can open before clicking
 * into any module. Tells the whole story:
 *   01. The need (situation, DC, "missing link" quote)
 *   02. The gap (what the current process leaves on the table)
 *   03. The 5-layer architecture
 *   04. What AdiPlan AI ships today (9 live modules)
 *   05. The pipeline visual (reused from landing)
 *   06. By the numbers
 *   07. What's still missing (honest WIP list)
 *   08. How it could be better (roadmap)
 *   09. Open it live (full module grid)
 * ============================================================================= */

const TOC = [
  { id: "need", num: "01", title: "The need" },
  { id: "gap", num: "02", title: "The gap" },
  { id: "architecture", num: "03", title: "The architecture" },
  { id: "shipped", num: "04", title: "What ships today" },
  { id: "pipeline", num: "05", title: "The pipeline" },
  { id: "numbers", num: "06", title: "By the numbers" },
  { id: "missing", num: "07", title: "What's still missing" },
  { id: "roadmap", num: "08", title: "How it could be better" },
  { id: "live", num: "09", title: "Open it live" },
];

const MODULES = [
  {
    href: "/stakeholder-map",
    icon: Network,
    num: "01",
    layer: "Assessing",
    title: "Stakeholder Influence Map",
    blurb:
      "14 seeded APAC stakeholders. Bubble size = current influence, dotted ring = future influence, directed arrows = who-influences-whom. Workshop-mode multi-player when Liveblocks is keyed.",
    moves: ["xyflow + d3-force", "Workshop multiplayer", "Auto-feeds CBI Ladder"],
  },
  {
    href: "/cbi-ladder",
    icon: Layers,
    num: "02",
    layer: "Assessing",
    title: "CBI / CSF Ladder",
    blurb:
      "Auto-generates “Help me to…” outcomes per selected stakeholder, ladders up to underlying value (WITI). Editable rungs.",
    moves: ["8 AdiPlan CBIs encoded", "5 personas", "Per-stakeholder ladder"],
  },
  {
    href: "/news-bridge",
    icon: Newspaper,
    num: "03",
    layer: "The Bridge",
    title: "News → Strategy",
    blurb:
      "Pick a scraped competitor article, get back the CBI it surfaces, the persona to target, and three deliverable formats — grounded in the AdiPlan vocabulary. Live scraper API plumbing wired in.",
    moves: [
      "vercel/ai · GPT-4o-mini fallback",
      "Live mode env-driven",
      "5-min cache + safe fallback",
    ],
    highlight: true,
  },
  {
    href: "/strategic-frame",
    icon: Target,
    num: "04",
    layer: "Strategic Frame",
    title: "Total Value Solution composer",
    blurb:
      "Synthesises the matched CBI + persona into an Enterprise Persona, an Enterprise Insight, and a Pain × Promise × Proof × Proposition card pack. Ships as a 1-page A4 PDF brief.",
    moves: ["Auto-compose on arrival", "Direct PDF export", "5 themed presets"],
  },
  {
    href: "/personas-matrix",
    icon: Grid3x3,
    num: "05",
    layer: "Upstream prioritisation",
    title: "Enterprise Personas × CSF matrix",
    blurb:
      "5 personas × 6 customer success factors. The diagonal marks where persona priority and Adisseo strength meet. Click any cell to see the lead claim, flagship, recommended deliverable.",
    moves: ["30 cells encoded", "Click → strategic frame", "Diagonal-win callouts"],
  },
  {
    href: "/studio/aqua",
    icon: FileText,
    num: "06",
    layer: "Studio · Aileen",
    title: "Aqua 1-page leaflet",
    blurb:
      "Magazine-ready A4 PDF for Trobos Aqua (ID), Tap Chi Thuy San (VN), Aquaculture Asia (TH/EN). Real Adisseo brand styling, embedded logo, brand-guardrail audit. Multi-script text rendering.",
    moves: ["EN · ID · VI · TH", "Noto Sans + Noto Sans Thai", "@react-pdf/renderer"],
  },
  {
    href: "/studio/poultry",
    icon: Mail,
    num: "07",
    layer: "Studio · Vish",
    title: "Poultry emailer + carousel",
    blurb:
      "Two coordinated deliverables — a technical email blast (HTML, integrator-ready) plus a 5-slide square LinkedIn carousel PDF, both anchored on the same trial-data narrative.",
    moves: [
      "@react-email/components",
      "Multi-page PDF carousel",
      "AGP-Free / heat-stress / uniformity",
    ],
  },
  {
    href: "/studio/ruminants",
    icon: BookOpen,
    num: "08",
    layer: "Studio · Antoine",
    title: "Ruminants manga brochure",
    blurb:
      "Japanese A4 brochure with manga cover panel — jagged shout / cloud thought / classic speech bubbles, real Ben-Day halftone, SFX onomatopoeia bleeding across panels, kuro-koma black-fill panels.",
    moves: [
      "JP + EN with Noto Sans JP",
      "3 bubble variants",
      "Asymmetric splash + 3-stack",
    ],
  },
  {
    href: "/studio/swine",
    icon: Clapperboard,
    num: "09",
    layer: "Studio · Claire",
    title: "Swine <60s vertical short",
    blurb:
      "TikTok / WeChat / Instagram script + storyboard, five languages with cultural register, account-based adaptation across CN/VN/TH/PH top-10 customers, ElevenLabs voiceover playback.",
    moves: ["EN · ZH · VI · TH · ID", "Per-account adaptation", "ElevenLabs TTS"],
  },
  {
    href: "/studio/billboard",
    icon: Bookmark,
    num: "10",
    layer: "05 · Creating",
    title: "Billboard Campaign generator",
    blurb:
      "AdiPlan billboard test in one button — Headline + Adisseo Differentiation + Reason to Believe + Visual brief, scored on Unique / Important / Believable. A2 / A1 portrait or square LinkedIn key visual.",
    moves: ["3 page formats", "Auto-fills from frame", "Self-test scorer"],
  },
  {
    href: "/studio/voice-memo",
    icon: Mic,
    num: "11",
    layer: "Studio · Voice Memo",
    title: "Voice memo → deliverable",
    blurb:
      "30-second phone memo. Whisper transcribes. The transcript seeds whichever species studio you point it at. Antoine keeps authorship; AdiPlan AI keeps the production cycle.",
    moves: ["MediaRecorder in-browser", "Whisper API + demo fallback", "Routes to all 5 studios"],
  },
  {
    href: "/dashboard",
    icon: Activity,
    num: "12",
    layer: "Activation · War Room",
    title: "Sales war-room dashboard",
    blurb:
      "Every news match, composed strategic frame, and species deliverable — most-recent first, with conversion ratios. Open it on the big screen during the regional sales meeting.",
    moves: ["Match → Frame → Ship funnel", "Per-kind counts", "Persisted across reload"],
  },
  {
    href: "/engagement-tracker",
    icon: Target,
    num: "13",
    layer: "Activation · Engagement",
    title: "Malaysia-ASF engagement tracker",
    blurb:
      "The metric Ricardo named on the call. 9 historical deliverables, 4-stage funnel (views → qualified → conversations → conversions), each row graded against the 43% Malaysia benchmark.",
    moves: ["Per-species + per-kind aggregates", "Above / At / Below grading", "Q4 2025 – Q1 2026 dataset"],
  },
  {
    href: "/wwwk",
    icon: HelpCircle,
    num: "14",
    layer: "Assessing · WWWK",
    title: "We Wish We Knew board",
    blurb:
      "Per stakeholder + CBI, 5–7 sharp research questions tied to specific decisions. Each question carries a hypothesis, recommended method, priority, and an answer-capture textarea. CSV export feeds the regional research backlog.",
    moves: ["Tied to a decision", "Disprovable hypotheses", "1:1 / focus / on-farm methods"],
  },
  {
    href: "/plan-on-page",
    icon: ClipboardList,
    num: "15",
    layer: "Executing",
    title: "Plan on a Page generator",
    blurb:
      "Single-sheet A4 PDF that pulls everything in this session — selected stakeholders, composed frame, deliverables shipped, KPI targets — onto one page for regional sales / KAMs.",
    moves: ["A4 portrait, 4-quadrant", "Live preview iframe", "Zero LLM calls — deterministic"],
  },
  {
    href: "/approval-queue",
    icon: ShieldCheck,
    num: "16",
    layer: "HQ desk · Brand-guardrail",
    title: "Approval queue",
    blurb:
      "Every species deliverable can be sent to Ricardo for brand review. Pending / approved / rejected with a comment, audited, and logged back into the war room. Closes Vish's #1 blocker.",
    moves: ["Send-to-HQ button on every studio", "Quick-comment templates", "Decisions → activity log"],
  },
  {
    href: "/trust-layer",
    icon: ShieldCheck,
    num: "17",
    layer: "Phase 1 · Trust layer",
    title: "Prose-quality scorer + brand-voice gate",
    blurb:
      "Three checks compose into one composite gate before anything reaches HQ: slop-detector (16 LLM-tic rule families, ported from slop-guard), brand-voice (Adisseo / DSM / Cargill / Kemin banned-terms + claim guardrails), and LanguageTool grammar in EN / ZH / VI / TH / JA / ID. Below 60 — blocked from Send-to-HQ. Below 80 — cannot be graded above benchmark in the engagement tracker. The platform now has measurable taste.",
    moves: [
      "16 slop rules, 0–100 score, instant client-side",
      "Per-tenant brand-voice configs (4 customers seeded)",
      "Hard fail on regulatory claim language",
      "Engagement tracker quality-gates the benchmark",
    ],
  },
];

const ROADMAP = [
  {
    title: "Phase 1 · Trust layer (LIVE)",
    body: "Slop-detector + brand-voice + LanguageTool grammar compose into a composite gate. Every studio output runs the gate before Send-to-HQ. Engagement tracker only grades 'above benchmark' if trust ≥ 80. The full pipeline runs at /trust-layer.",
    icon: ShieldCheck,
  },
  {
    title: "Phase 2 · Research depth + Vault (Weeks 4–7)",
    body: "GPT-Researcher / GPT-Newspaper agents that cite 5+ sources for every deliverable, plus a per-customer 'Vault' of approved trial protocols and anchor data so studios stop hallucinating numbers.",
    icon: Cpu,
  },
  {
    title: "Phase 3 · UI / UX upgrade + brand-voice fingerprinting (Weeks 8–13)",
    body: "DSPy + Langfuse to fingerprint each species manager's voice from their own writing samples. Magic UI / shadcn upgrade across studios. Vercel Satori OG-card generator for every shipped asset.",
    icon: Sparkles,
  },
  {
    title: "Phase 4 · Multi-tenant + distribution rails (Weeks 14–24)",
    body: "Tenant-aware (DSM / Cargill / Kemin) with per-tenant brand-voice configs. Auto-distribute approved deliverables to LinkedIn / WeChat / WhatsApp once the trust gate + HQ approval both clear.",
    icon: Radio,
  },
  {
    title: "Live measurement plumbing",
    body: "The engagement tracker is shipped with seed data. Next: hook real PDF-viewer scroll-depth, Swine-short watch-time, and LinkedIn-carousel scroll-depth APIs into the funnel — no more seed numbers.",
    icon: Database,
  },
  {
    title: "Live Adisseo scraper integration",
    body: "Plumbing is in (env-driven SCRAPER_API_URL with normaliser, cache, safe fallback). Set the env var → the 8 seeded articles get replaced by real APAC competitor news.",
    icon: Globe2,
  },
  {
    title: "Mistral OCR 3 ingestion",
    body: "Pull internal Adisseo trial PDFs through Mistral OCR 3 into the RAG layer so studios can cite real lab data, not deterministic stubs. Stays inside Microsoft Copilot for governance compliance.",
    icon: Cpu,
  },
  {
    title: "LangGraph long-running orchestration",
    body: "Daily competitor digest agent: scrape → match → compose frames overnight → ship a morning briefing email to each species manager with the day's top 3 plays.",
    icon: Sparkles,
  },
  {
    title: "Auto-distribute to LinkedIn / WeChat / WhatsApp",
    body: "Once HQ approves a deliverable in the queue, push it directly to the right channel — LinkedIn carousel API, WeChat OA push, WhatsApp distributor list. Right now the manager still copies the file out manually.",
    icon: Radio,
  },
];

const MISSING: { label: string; status: "wired" | "deferred" | "in-progress" }[] = [
  {
    label: "Phase 1 · Trust layer (slop-guard + vale-style + LanguageTool)",
    status: "wired",
  },
  {
    label: "Live competitor scraper feed (env-driven, awaiting SCRAPER_API_URL)",
    status: "wired",
  },
  {
    label: "Workshop multi-player presence (env-driven, awaiting Liveblocks key)",
    status: "wired",
  },
  {
    label: "Voice synthesis on Swine shorts (env-driven, awaiting ElevenLabs key)",
    status: "wired",
  },
  {
    label: "Live engagement measurement (real watch-time / scroll-depth APIs)",
    status: "in-progress",
  },
  {
    label: "Phase 2 · GPT-Researcher / GPT-Newspaper research-to-script agents",
    status: "deferred",
  },
  {
    label: "Phase 3 · DSPy brand-voice fingerprinting per species manager",
    status: "deferred",
  },
  {
    label: "Phase 4 · Multi-tenant + auto-distribution to LinkedIn / WeChat / WhatsApp",
    status: "deferred",
  },
];

export default function PresentationPage() {
  return (
    <main className="min-h-screen bg-adisseo-bg text-adisseo-ink">
      {/* ============================== HEADER ============================== */}
      <header className="sticky top-0 z-20 border-b border-adisseo-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="h-5 w-px bg-adisseo-line" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-adisseo-crimson">
              The deep deck
            </p>
          </div>
          <nav className="hidden items-center gap-3 md:flex">
            <Link
              href="/"
              className="text-xs font-medium text-adisseo-muted hover:text-adisseo-crimson"
            >
              Home
            </Link>
            <Link
              href="/news-bridge"
              className="text-xs font-medium text-adisseo-muted hover:text-adisseo-crimson"
            >
              Live demo
            </Link>
            <Link
              href="#live"
              className="rounded-full bg-adisseo-crimson px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              Open a module
            </Link>
          </nav>
        </div>
      </header>

      {/* ============================== HERO ============================== */}
      <section className="border-b border-adisseo-line bg-white">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-adisseo-line bg-adisseo-bg px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-adisseo-crimson">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-adisseo-crimson opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-adisseo-crimson" />
            </span>
            AdiPlan AI · APAC Pilot · Built for Adisseo
          </div>
          <h1 className="font-serif text-5xl font-bold leading-[1.05] text-adisseo-ink-strong md:text-6xl">
            How AdiPlan AI bridges <br className="hidden md:inline" />
            <span className="text-adisseo-crimson">competitor news</span> to
            species-specific deliverables.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-adisseo-muted md:text-lg">
            One platform. Five layers. Nine live modules. Five languages. The
            entire Adisseo APAC strategic-marketing pipeline — from a
            scraped Kemin or Evonik headline to a Japanese manga brochure or a
            Thai aqua leaflet — wired end to end and demo-ready.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="#need"
              className="flex items-center gap-2 rounded-lg bg-adisseo-ink-strong px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Read the deck <ArrowRight size={14} />
            </Link>
            <Link
              href="#live"
              className="flex items-center gap-2 rounded-lg border border-adisseo-line bg-white px-4 py-3 text-sm font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              Skip to the live modules <ArrowRight size={14} />
            </Link>
          </div>

          {/* TOC */}
          <ol className="mt-14 grid grid-cols-1 gap-x-8 gap-y-3 text-sm md:grid-cols-3">
            {TOC.map((t) => (
              <li key={t.id}>
                <Link
                  href={`#${t.id}`}
                  className="group flex items-baseline gap-3 border-b border-dashed border-adisseo-line pb-2 hover:border-adisseo-crimson"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-adisseo-crimson">
                    {t.num}
                  </span>
                  <span className="text-adisseo-ink-strong group-hover:text-adisseo-crimson">
                    {t.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================== 01 · NEED ============================== */}
      <Section id="need" num="01" title="The need" subtitle="DC · Definitive Customer & Demand Creation context">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-base leading-relaxed text-adisseo-ink-strong">
              Adisseo is a global feed-additive company. Ricardo runs marketing
              for APAC. Danny had already shipped Ricardo&apos;s internal{" "}
              <strong>competitor news web-scraper platform</strong> — 83
              competitors, 125+ websites, timeline filter, chat layer,
              analytics. On the Apr 28 call, Ricardo asked Danny to build the{" "}
              <strong>next layer</strong>: bridge the scraped news to
              Adisseo&apos;s marketing strategy (the <em>AdiPlan</em>{" "}
              framework) and auto-produce campaign-ready deliverables per
              species, country, persona, and language. APAC is the pilot;
              global rollout follows.
            </p>

            <Pull>
              <Quote
                size={20}
                className="text-adisseo-crimson"
                strokeWidth={2.5}
              />
              <p className="mt-3 font-serif text-2xl italic leading-snug text-adisseo-ink-strong md:text-3xl">
                &ldquo;We have all the news, we have our strategy. The missing
                link is putting them together with{" "}
                <span className="text-adisseo-crimson">RAG</span> to take the
                decision for us and tell us what to do.&rdquo;
              </p>
              <p className="mt-3 text-sm font-medium text-adisseo-muted">
                &mdash; Ricardo Communod, Adisseo APAC · Apr 28, 2026
              </p>
            </Pull>

            <h3 className="mt-12 text-lg font-bold text-adisseo-ink-strong">
              The four species managers — four audiences, four cultures, one platform
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <PersonaCard
                name="Aileen"
                species="Aqua"
                want="1–2 page leaflets in Indonesian, Vietnamese, Thai. Drawing-style explainer videos."
                quirk="LinkedIn is useless for Aqua. Local magazines only."
              />
              <PersonaCard
                name="Vish"
                species="Poultry"
                want="Campaign emailers (AGP-Free worked). LinkedIn carousels under HQ guardrails."
                quirk="Doesn&apos;t want to reach customers directly — wants to enable sales."
              />
              <PersonaCard
                name="Antoine"
                species="Ruminants"
                want="Bilingual JP+EN newsletter. Manga-style brochures for Japan."
                quirk="&ldquo;If AI does it for you, you don&apos;t own it in front of the customer.&rdquo;"
              />
              <PersonaCard
                name="Claire"
                species="Swine"
                want="<60s social videos for TikTok / WeChat / Instagram — NOT LinkedIn."
                quirk="Account-based adaptation across top-10 customers per country."
              />
            </div>
          </div>

          <aside className="space-y-4">
            <FactBox
              icon={ShieldCheck}
              label="Hard governance constraint"
              body="Internal proprietary data must stay inside Microsoft Copilot. Public / scraped / already-published content can flow into external LLMs. The architecture splits the pipeline at exactly that seam."
            />
            <FactBox
              icon={Languages}
              label="Languages required"
              body="EN · JP · VI · ID · TH · ZH. Plus cultural register variations — koon for Thai, park for Indonesian, manga voice for Japanese."
            />
            <FactBox
              icon={Bookmark}
              label="Timeline Ricardo offered"
              body="&ldquo;With you and I, we can go public in two weeks.&rdquo; APAC pilot first, global rollout after."
            />
          </aside>
        </div>
      </Section>

      {/* ============================== 02 · GAP ============================== */}
      <Section id="gap" num="02" title="The gap" subtitle="What the current process leaves on the table">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GapCard
            title="No bridge between news → strategy → deliverable"
            body="The scraper produces 125+ websites of competitor news. The AdiPlan framework lives in PowerPoint. Sales gets the news; nothing connects them. Each species manager rebuilds the link manually for every campaign."
          />
          <GapCard
            title="No multilingual content infrastructure"
            body="Aqua audiences read local trade magazines in Indonesian, Vietnamese, Thai. LinkedIn doesn&apos;t reach them. There&apos;s no production pipeline that ships culturally-localised PDFs in those languages."
          />
          <GapCard
            title="No structured Total Value Solution framing"
            body="The AdiPlan framework defines the answer: Pain × Promise × Proof × Proposition, anchored on a CBI + persona. But composing that frame happens in conversations, not a system. It doesn&apos;t scale across 5 species × 8 countries."
          />
          <GapCard
            title="No upstream prioritisation view"
            body="Which CSF matters most for which persona, and where is Adisseo&apos;s portfolio strongest? Today it&apos;s tribal knowledge. The diagonal of the persona × CSF matrix is where regional sales should always lead — but nobody can point to it on a screen."
          />
          <GapCard
            title="No fast deliverable infrastructure"
            body="Aileen wants a leaflet, Vish wants an emailer + carousel, Antoine wants a manga brochure, Claire wants a TikTok script. Each is a two-week design cycle today. The species managers each have one designer."
          />
          <GapCard
            title="No engagement attribution"
            body="The Malaysia-ASF case proved 7 qualified viewers (>2.5 min watch time) drove 3 conversions. That metric isn&apos;t institutionalised. We don&apos;t track which deliverable types convert which personas."
          />
        </div>
      </Section>

      {/* ============================== 03 · ARCHITECTURE ============================== */}
      <Section id="architecture" num="03" title="The architecture" subtitle="Five layers — with the AI governance seam between Layer 1 and Layer 2">
        <div className="space-y-3">
          <ArchLayer num="5" name="Activation" body="Account-Adaptation Engine · Sales Weekly Dashboard · Engagement Tracker (Malaysia-ASF model) · Publishing rails" />
          <ArchLayer num="4" name="Content Studio (per persona × country × language)" body="Aqua leaflets · Poultry emailers · Ruminants manga · Swine <60s shorts · explainer videos · podcast scripts. Brand-guardrail pack enforces HQ-approved style." />
          <ArchLayer num="3" name="Strategic Frame (the AdiPlan engine)" body="Stakeholder Map · CBI / CSF Ladder · Personas · TVS · Billboard" highlight />
          <ArchLayer num="2" name="Synthesis / RAG" body="Match scraped news ↔ strategy ↔ persona ↔ CBI" />
          <ArchLayer
            num="1"
            name="Intel"
            body="Existing scraper · Raw-material price feeds · Approved internal corpus (Copilot-only, never external LLM)"
            footnote="The seam between Layer 1 and Layer 2 is where AI governance is enforced."
          />
        </div>
      </Section>

      {/* ============================== 04 · SHIPPED ============================== */}
      <Section
        id="shipped"
        num="04"
        title="What AdiPlan AI ships today"
        subtitle="17 live modules — every one runnable in the browser, no setup required"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <ModuleCard key={m.href} {...m} />
          ))}
        </div>
      </Section>

      {/* ============================== 05 · PIPELINE ============================== */}
      <Section
        id="pipeline"
        num="05"
        title="The pipeline"
        subtitle="From a scraped headline to a deliverable in 4 stages"
      >
        <div className="rounded-3xl border border-adisseo-line bg-white p-8 shadow-sm">
          <PipelineVisual />
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-adisseo-muted">
          The competitor scraper feeds the News Bridge. The Bridge calls an LLM
          to pin the article to a CBI + persona + 3 deliverable formats. That
          match seeds the Strategic Frame (Pain × Promise × Proof
          × Proposition), and the Frame&apos;s Activations row hands off
          to the species Studios. Each Studio outputs a real downloadable
          asset — PDF, HTML email, carousel, video script with TTS.
        </p>
      </Section>

      {/* ============================== 06 · NUMBERS ============================== */}
      <Section id="numbers" num="06" title="By the numbers" subtitle="What's actually shipped, in figures">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat n="13" label="Live modules" />
          <Stat n="17" label="API routes" />
          <Stat n="6" label="Languages" sub="EN · JP · ZH · VI · ID · TH" />
          <Stat n="5" label="Deliverable formats" sub="leaflet · email · carousel · manga · short" />
          <Stat n="8" label="AdiPlan CBIs" />
          <Stat n="5" label="Personas" />
          <Stat n="14" label="Stakeholders seeded" />
          <Stat n="30" label="Persona × CSF cells" />
        </div>
      </Section>

      {/* ============================== 07 · MISSING ============================== */}
      <Section id="missing" num="07" title="What's still missing" subtitle="Honest WIP list — wired, in progress, or deferred">
        <ul className="space-y-2">
          {MISSING.map((m) => (
            <li
              key={m.label}
              className="flex items-start gap-3 rounded-xl border border-adisseo-line bg-white p-4"
            >
              {m.status === "wired" ? (
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
              ) : m.status === "in-progress" ? (
                <Circle
                  size={18}
                  className="mt-0.5 shrink-0 text-adisseo-crimson"
                />
              ) : (
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0 text-adisseo-orange"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-adisseo-ink-strong">
                  {m.label}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                  m.status === "wired"
                    ? "bg-emerald-50 text-emerald-700"
                    : m.status === "in-progress"
                      ? "bg-adisseo-crimson/10 text-adisseo-crimson"
                      : "bg-orange-50 text-adisseo-orange"
                }`}
              >
                {m.status === "wired"
                  ? "wired"
                  : m.status === "in-progress"
                    ? "in progress"
                    : "deferred"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs leading-relaxed text-adisseo-muted">
          <strong>Wired</strong> = the integration code is in, it&apos;s
          waiting on a credential or URL.{" "}
          <strong>In progress</strong> = next on the build queue.{" "}
          <strong>Deferred</strong> = explicitly v2.
        </p>
      </Section>

      {/* ============================== 08 · ROADMAP ============================== */}
      <Section
        id="roadmap"
        num="08"
        title="How it could be better"
        subtitle="Eight roadmap moves, ranked by demo impact for the global rollout"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ROADMAP.map((r, i) => (
            <RoadmapCard key={r.title} idx={i + 1} {...r} />
          ))}
        </div>
      </Section>

      {/* ============================== 09 · LIVE ============================== */}
      <Section
        id="live"
        num="09"
        title="Open it live"
        subtitle="Every module is one click away — no setup, no auth, no hand-waving"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group flex items-center gap-4 rounded-2xl border border-adisseo-line bg-white p-4 transition hover:border-adisseo-crimson hover:shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-adisseo-crimson/5 text-adisseo-crimson group-hover:bg-adisseo-crimson group-hover:text-white">
                  <Icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                    {m.layer}
                  </p>
                  <p className="truncate text-sm font-semibold text-adisseo-ink-strong group-hover:text-adisseo-crimson">
                    {m.title}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-adisseo-muted group-hover:text-adisseo-crimson"
                />
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl border border-adisseo-ink-strong bg-adisseo-ink-strong p-8 text-white md:p-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
            One last thing
          </p>
          <h3 className="mt-3 font-serif text-3xl font-bold leading-tight md:text-4xl">
            The fastest demo path: open <span className="text-adisseo-orange">News Bridge</span>,
            click any seeded article, follow the buttons all the way to a
            downloadable PDF.
          </h3>
          <p className="mt-4 max-w-2xl text-sm text-white/80 md:text-base">
            Two minutes, four clicks: News Bridge → Strategic Frame →
            Species Studio → Download. Everything in this deck is reachable
            from that one path.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/news-bridge"
              className="flex items-center gap-2 rounded-lg bg-adisseo-crimson px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Open News Bridge <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-white/30 bg-transparent px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Back to module index
            </Link>
          </div>
        </div>
      </Section>

      <footer className="mx-auto max-w-6xl px-6 pb-16 pt-8 text-xs text-adisseo-muted">
        <p>
          AdiPlan AI · APAC Pilot · Built for Adisseo by Danny ·
          Source: <code>context.md</code> + Apr 28 call notes
        </p>
      </footer>
    </main>
  );
}

/* ============================================================
 * Sub-components
 * ============================================================ */

function Section({
  id,
  num,
  title,
  subtitle,
  children,
}: {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-b border-adisseo-line">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-baseline gap-4">
          <span className="font-serif text-5xl font-bold text-adisseo-crimson md:text-6xl">
            {num}
          </span>
          <div className="border-l border-adisseo-line pl-4">
            <h2 className="font-serif text-3xl font-bold leading-tight text-adisseo-ink-strong md:text-4xl">
              {title}
            </h2>
            <p className="mt-1 text-sm font-medium text-adisseo-muted md:text-base">
              {subtitle}
            </p>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function Pull({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 border-l-4 border-adisseo-crimson bg-white px-6 py-6 shadow-sm">
      {children}
    </blockquote>
  );
}

function PersonaCard({
  name,
  species,
  want,
  quirk,
}: {
  name: string;
  species: string;
  want: string;
  quirk: string;
}) {
  return (
    <div className="rounded-xl border border-adisseo-line bg-white p-4">
      <div className="flex items-baseline gap-2">
        <p className="text-base font-bold text-adisseo-ink-strong">{name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
          {species}
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-adisseo-ink">{want}</p>
      <p className="mt-2 border-t border-dashed border-adisseo-line pt-2 text-[11px] italic text-adisseo-muted">
        {quirk}
      </p>
    </div>
  );
}

function FactBox({
  icon: Icon,
  label,
  body,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-adisseo-line bg-white p-4">
      <div className="flex items-center gap-2 text-adisseo-crimson">
        <Icon size={14} />
        <p className="text-[10px] font-semibold uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-adisseo-ink">{body}</p>
    </div>
  );
}

function GapCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-5">
      <p className="text-base font-bold leading-snug text-adisseo-ink-strong">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-adisseo-muted">{body}</p>
    </div>
  );
}

function ArchLayer({
  num,
  name,
  body,
  highlight,
  footnote,
}: {
  num: string;
  name: string;
  body: string;
  highlight?: boolean;
  footnote?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-adisseo-crimson bg-adisseo-crimson text-white shadow-md"
          : "border-adisseo-line bg-white text-adisseo-ink"
      }`}
    >
      <div className="flex items-baseline gap-3">
        <span
          className={`font-serif text-3xl font-bold ${
            highlight ? "text-white/90" : "text-adisseo-crimson"
          }`}
        >
          L{num}
        </span>
        <p
          className={`text-base font-bold ${
            highlight ? "text-white" : "text-adisseo-ink-strong"
          }`}
        >
          {name}
        </p>
      </div>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          highlight ? "text-white/90" : "text-adisseo-muted"
        }`}
      >
        {body}
      </p>
      {footnote && (
        <p
          className={`mt-3 border-t pt-3 text-[11px] italic ${
            highlight
              ? "border-white/20 text-white/70"
              : "border-adisseo-line text-adisseo-orange"
          }`}
        >
          {footnote}
        </p>
      )}
    </div>
  );
}

function ModuleCard({
  href,
  icon: Icon,
  num,
  layer,
  title,
  blurb,
  moves,
  highlight,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  num: string;
  layer: string;
  title: string;
  blurb: string;
  moves: string[];
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-2xl border bg-white p-5 transition ${
        highlight
          ? "border-adisseo-crimson shadow-md"
          : "border-adisseo-line hover:border-adisseo-crimson hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-adisseo-crimson/5 text-adisseo-crimson group-hover:bg-adisseo-crimson group-hover:text-white">
          <Icon size={18} />
        </span>
        <span className="font-serif text-2xl font-bold text-adisseo-crimson/40">
          {num}
        </span>
      </div>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
        {layer}
      </p>
      <p className="mt-1 text-base font-bold leading-snug text-adisseo-ink-strong group-hover:text-adisseo-crimson">
        {title}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-adisseo-muted">{blurb}</p>
      <ul className="mt-4 space-y-1 text-[10px] text-adisseo-muted">
        {moves.map((m) => (
          <li key={m} className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-adisseo-crimson" />
            <span>{m}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-end gap-1 pt-4 text-xs font-semibold text-adisseo-crimson">
        Open <ArrowRight size={12} />
      </div>
    </Link>
  );
}

function Stat({ n, label, sub }: { n: string; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-5">
      <p className="font-serif text-4xl font-bold text-adisseo-crimson md:text-5xl">
        {n}
      </p>
      <p className="mt-2 text-sm font-bold text-adisseo-ink-strong">{label}</p>
      {sub && (
        <p className="mt-1 text-[10px] text-adisseo-muted">{sub}</p>
      )}
    </div>
  );
}

function RoadmapCard({
  idx,
  icon: Icon,
  title,
  body,
}: {
  idx: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-adisseo-crimson/5 text-adisseo-crimson">
          <Icon size={16} />
        </span>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-semibold text-adisseo-crimson">
              {String(idx).padStart(2, "0")}
            </span>
            <p className="text-sm font-bold text-adisseo-ink-strong">{title}</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-adisseo-muted">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
