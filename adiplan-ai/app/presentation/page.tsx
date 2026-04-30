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
  Telescope,
  Coffee,
  Library,
  Fingerprint,
  Image as ImageIcon,
  Eye,
  Building2,
  KeyRound,
  CalendarClock,
  Milestone,
  TrendingUp,
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
 *   04. What APAC AI ships today (9 live modules)
 *   05. The pipeline visual (reused from landing)
 *   06. By the numbers
 *   07. What's still missing (honest WIP list)
 *   08. How it could be better (roadmap)
 *   09. Phase 8 + Lane B horizons (pilot backbone → 12-month program)
 *   10. Open it live (full module grid)
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
  { id: "phase8-laneb", num: "09", title: "Phase 8 & Lane B" },
  { id: "live", num: "10", title: "Open it live" },
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
    moves: ["8 APAC CBIs encoded", "5 personas", "Per-stakeholder ladder"],
  },
  {
    href: "/news-bridge",
    icon: Newspaper,
    num: "03",
    layer: "The Bridge",
    title: "News → Strategy",
    blurb:
      "Pick a scraped competitor article, get back the CBI it surfaces, the persona to target, and three deliverable formats — grounded in the APAC vocabulary. Live scraper API plumbing wired in.",
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
      "5 personas × 6 customer success factors. The diagonal marks where persona priority and Adisseo strength meet. Click any cell to see the lead claim, flagship, recommended deliverable. Switchable to the Apr-30 poultry workshop overlay (6×6).",
    moves: ["30 cells encoded", "Click → strategic frame", "Diagonal-win callouts", "Generic / poultry view toggle"],
  },
  {
    href: "/campaign-fanout",
    icon: Layers,
    num: "05b",
    layer: "TFIP demo",
    title: "Campaign Fan-out · TFIP",
    blurb:
      "One campaign (Turning Feed Into Profit) → 6 stakeholder-tuned variants. Three buyers (Nutritionist · Vet · Purchaser) × two channels (email · 1-slide infographic). Anchored on 8 TFIP vault entries from the WeTransfer corpus.",
    moves: ["Workshop ladders wired", "Studio prefill", "Citation-checker resolves €/MT claims"],
    highlight: true,
  },
  {
    href: "/poultry-workshop",
    icon: BookOpen,
    num: "05c",
    layer: "TFIP reference",
    title: "Poultry workshop · 8 posters",
    blurb:
      "Read-only HTML rendering of the Apr-30 workshop output — six persona cards, the 6×6 priority heat-grid, three CBI ladders, six value-prop circles, the WWWK research backlog, and the seven ranked insights.",
    moves: ["Personas · matrix · ladders", "Value-prop circles", "WWWK + ranked insights"],
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
    href: "/studio/voice-memo",
    icon: Mic,
    num: "11",
    layer: "Studio · Voice Memo",
    title: "Voice memo → deliverable",
    blurb:
      "30-second phone memo. Whisper transcribes. The transcript seeds whichever species studio you point it at. Antoine keeps authorship; APAC AI keeps the production cycle.",
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
      "Four checks compose into one composite gate before anything reaches HQ: slop-detector (16 LLM-tic rule families, ported from slop-guard), brand-voice (Adisseo / DSM / Cargill / Kemin banned-terms + claim guardrails), citation depth (Vault-resolved references), and LanguageTool grammar in EN / ZH / VI / TH / JA / ID. Below 60 — blocked from Send-to-HQ. Below 80 — cannot be graded above benchmark in the engagement tracker.",
    moves: [
      "16 slop rules, 0–100 score, instant client-side",
      "Per-tenant brand-voice configs (4 customers seeded)",
      "Citation-depth scoring against the Vault",
      "Hard fail on regulatory claim language",
    ],
  },
  {
    href: "/vault",
    icon: Database,
    num: "18",
    layer: "Phase 2 · Research depth",
    title: "Adisseo Vault",
    blurb:
      "The customer knowledge base every studio anchors against. ~20 seeded entries spanning controlled trials, field observations, regulatory references, integrator quotes, peer-reviewed publications and product specs across all 4 species and 9 APAC regions. Studios pull a citation with one click; the trust layer scores how well each deliverable is anchored.",
    moves: [
      "6 vault kinds (trial / field / regulatory / publication / quote / spec)",
      "Verified-vs-external two-tier trust",
      "Canonical citation format with vault-id",
      "TF search + species/region/kind filters",
    ],
  },
  {
    href: "/research-deep",
    icon: Telescope,
    num: "19",
    layer: "Phase 2 · Research depth",
    title: "Deep-research agent",
    blurb:
      "gpt-researcher-style multi-step retrieval. Decomposes a question into 6 sub-queries (numbers, regulation, competitor, integrator-voice, mechanism, timing), runs each against the Vault, and composes a footnoted briefing with confidence scoring. Studios call this before drafting so claims start anchored.",
    moves: [
      "6-axis sub-query taxonomy",
      "Footnoted [^N]-style briefing composition",
      "Diversity + resolved-rate confidence score",
      "Trust-layer rescores its own briefing",
    ],
  },
  {
    href: "/digest",
    icon: Coffee,
    num: "20",
    layer: "Phase 2 · Distribution",
    title: "04:00 species-manager digest",
    blurb:
      "gpt-newspaper-style overnight competitor briefing. Per species manager: 3 stories pulled from APAC competitors, each pre-paired with the Vault entry that backs the response, plus the recommended deliverable kind for today. In production, a 04:00 cron lands this in their inbox.",
    moves: [
      "Per-manager filtered to species + region overlap",
      "Each story Vault-anchored automatically",
      "Today's-play recommendation per story",
      "Hand-off to News Bridge / Research Deep / Studio",
    ],
  },
  {
    href: "/voice-fingerprint",
    icon: Fingerprint,
    num: "21",
    layer: "Phase 3 · Voice fingerprint",
    title: "Per-manager voice profile",
    blurb:
      "DSPy-style fingerprint of how each species manager actually writes. Eight measurable axes — sentence length, variance, vocabulary richness, hedging rate, citation density, em-dash habits, first-person rate, punctuation rhythm — plus signature 3-grams and avoided-word lists. The trust layer adds a 'voice match' sub-score so a draft sounds like the human shipping it.",
    moves: [
      "5 species-manager profiles seeded (Vish, Aileen, Antoine, Claire, Ricardo)",
      "Paste 2–3 writing samples → derive a profile in one click",
      "Voice-match sub-score lights up in ProseQualityCard",
      "All scoring runs deterministically client-side — no LLM",
    ],
  },
  {
    href: "/og-cards",
    icon: ImageIcon,
    num: "22",
    layer: "Phase 3 · Distribution",
    title: "OG-card generator (Vercel Satori)",
    blurb:
      "Every shipped deliverable produces a 1200×630 LinkedIn card or 1200×1200 square — from URL params, no Photoshop. Trust score and citation count travel with the card so the quality signal is visible to the recipient before they click. Edge runtime, sub-second render.",
    moves: [
      "Title / deck / species / manager / trust / citations all URL-driven",
      "LinkedIn 1200×630 + square 1200×1200 variants",
      "Adisseo crimson + species tint baked into the design system",
      "Edge runtime — cacheable on the CDN",
    ],
  },
  {
    href: "/observability",
    icon: Eye,
    num: "23",
    layer: "Phase 3 · Trust",
    title: "LLM observability (Langfuse-style)",
    blurb:
      "Every model call — score-prose, research-deep, match-article, render-* — pushes a span to an in-memory trace ring. Latency, cost, model id, deterministic-vs-LLM flag, trust score, payload preview. Built so Adisseo's IT and legal team can see exactly which model is being called with what data. Swap for Langfuse / Helicone in production.",
    moves: [
      "200-span ring buffer keyed off globalThis (survives hot-reload)",
      "Auto-classifies deterministic vs. LLM calls",
      "p95 / mean latency, cost, error count rollup",
      "Per-span drill-down with payload preview",
    ],
  },
  {
    href: "/tenants",
    icon: Building2,
    num: "24",
    layer: "Phase 4 · Multi-tenant",
    title: "Tenant directory (Adisseo / DSM / Cargill / Kemin)",
    blurb:
      "APAC runs four tenants out of the box. Adisseo is live; DSM-Firmenich, Cargill, and Kemin are blueprinted with their own brand voice, Vault scope, trust floor, approved channels, and reviewer label. Switching the tenant in the top-bar rescopes ProseQualityCard, Vault, Distribution, Approval queue, and Engagement.",
    moves: [
      "TenantSwitcher chip in every top-bar — single source of truth",
      "Vault entries tagged by tenantId; cross-tenant entries stay invisible",
      "Per-tenant trust floors (Adisseo 60, DSM 70, Cargill 65, Kemin 65)",
      "Per-tenant approved-channel matrix surfaced on /distribution",
    ],
  },
  {
    href: "/distribution",
    icon: Radio,
    num: "25",
    layer: "Phase 5 · Closed loop",
    title: "Distribution rails — preview / ship / schedule / measure",
    blurb:
      "Each channel has a typed ChannelAdapter producing a channel-native preview (LinkedIn carousel + caption + hashtags + anchor footer, WeChat OA push card, WhatsApp message bubble with attachment chip, email with from/subject/preheader/body, trade-mag editorial submission). Ship now, queue for a scheduled time, or simulate the inbound engagement webhook. Every shipped deliverable auto-creates a DeliverableInstance and lights up the engagement tracker.",
    moves: [
      "ChannelAdapter pattern — one swap-point per channel for live API integration",
      "5 channel-native preview cards (LinkedIn / WeChat / WhatsApp / email / trade-mag)",
      "Scheduled-send queue with fire-now / cancel operator overrides",
      "/api/distribution-callback simulates inbound engagement webhooks",
      "Auto-creates DeliverableInstance on ship → engagement-tracker grades it",
      "Public URL + external id + audience reach surfaced on every row",
    ],
  },
  {
    href: "/credentials",
    icon: KeyRound,
    num: "26",
    layer: "Phase 6 · Production-readiness",
    title: "Channel credentials & HMAC-signed webhook inbox",
    blurb:
      "The production shell that turns Phase 5's mocks into a real integration story. Every tenant + channel declares the env vars it needs (LinkedIn org URN + OAuth, WeChat OA AppID + AppSecret, WhatsApp business number + access token, email provider + key, trade-mag portal token). The dispatcher checks presence per-request and routes through the live HTTP shell (with retry + rate-limit) or the mock — partial roll-outs are safe. Inbound webhooks at /api/webhook/[tenant]/[channel] verify Stripe-style HMAC-SHA256 signatures with a 5-minute replay window.",
    moves: [
      "Per-tenant credential matrix on /credentials with env-var presence indicators",
      "Token-bucket rate-limiter per tenant + channel (e.g. LinkedIn 25/min, email 240/min)",
      "Exponential-backoff retry around live dispatch (3 attempts, 250ms base)",
      "HMAC-SHA256 webhook verification with 5-minute replay protection",
      "Per-tenant webhook secret + copy-paste curl in /credentials",
      "Live / mock / hybrid chip in every top-bar — instant integration-state read-out",
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
    title: "Phase 2 · Research depth + Vault (LIVE)",
    body: "Vault, deep-research agent, citation-depth sub-score and the 04:00 digest all shipped. Studios now call /api/research-deep before drafting; every deliverable gets scored on how well it's anchored to a Vault entry. Production work-list: pgvector + BM25 hybrid retriever, Mistral OCR ingest of internal Adisseo PDFs, real cron for the 04:00 digest.",
    icon: Telescope,
  },
  {
    title: "Phase 3 · UI / UX upgrade + brand-voice fingerprinting (LIVE)",
    body: "Per-manager voice profiles with 8 measurable axes shipped at /voice-fingerprint, voice-match sub-score is live in the trust layer, Vercel Satori OG-card generator at /og-cards turns trust telemetry into a 1200×630 social asset, and a Langfuse-style observability ring at /observability captures every LLM and deterministic call. Production work-list: real DSPy training on actual writing samples, Magic UI polish across studios.",
    icon: Fingerprint,
  },
  {
    title: "Phase 4 · Multi-tenant + distribution rails (LIVE)",
    body: "Four tenants modelled (Adisseo live; DSM-Firmenich, Cargill, Kemin blueprinted). Tenant id flows through ProseQualityCard, Vault, Approval queue, and Distribution. Five distribution channels (LinkedIn / WeChat / WhatsApp / email / trade-mag) gated on tenant approval, trust floor, HQ approval, and species scope. Every dispatch logs to the distribution audit table + the observability ring.",
    icon: Radio,
  },
  {
    title: "Phase 5 · Closed-loop dispatch + measurement (LIVE)",
    body: "Per-channel ChannelAdapter pattern lets us swap mocks for live LinkedIn / WeChat / WhatsApp / email / trade-mag without touching the gate. Each adapter produces a channel-native preview (real-feeling LinkedIn carousel, WeChat push card, WhatsApp bubble, email, editorial submission). Scheduled-send queue with operator override. /api/distribution-callback simulates the inbound engagement webhook → patches the dispatch row + the engagement tracker (auto-created DeliverableInstance) so the demo's funnel grades a deliverable end-to-end in one click.",
    icon: Radio,
  },
  {
    title: "Phase 6 · Production-readiness shell (LIVE)",
    body: "The credential matrix, HMAC-signed webhooks, retry + rate-limit, and per-tenant webhook secrets are all in place. /credentials renders the env-var presence per tenant + channel; the dispatcher reads at request time and falls back to mock cleanly when anything's missing. /api/webhook/[tenant]/[channel] verifies Stripe-style HMAC-SHA256 signatures (5-minute replay window) and stores accepted events in the inbox. Going live for any tenant + channel is now an env-var change.",
    icon: KeyRound,
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
    label: "Phase 2 · Vault + deep-research agent + citation depth + 04:00 digest",
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
    status: "wired",
  },
  {
    label: "Phase 3 · Vercel Satori OG-card generator + LLM observability ring",
    status: "wired",
  },
  {
    label: "Phase 4 · Multi-tenant + distribution rails",
    status: "wired",
  },
  {
    label: "Phase 5 · Closed-loop dispatch + measurement",
    status: "wired",
  },
  {
    label: "Phase 6 · Production-readiness (credentials, HMAC webhooks, retry + rate-limit)",
    status: "wired",
  },
  {
    label: "Phase 7 · Swap dispatcher live-shells for actual LinkedIn UGC / WeChat OA / WhatsApp Cloud / Mailgun / editorial-portal HTTP calls",
    status: "deferred",
  },
  {
    label:
      "Phase 8 · Supabase persistence (maps, approvals, logs) + magic-link RBAC + Singapore-region pilot deploy",
    status: "in-progress",
  },
];

/** Ricardo masterplan backlog — explicit horizons so Phase 8 vs Lane B is not ambiguous. */
const PHASE8_LANE_B = [
  {
    title: "Phase 8 · Pilot backbone (now)",
    body:
      "Code today: Supabase client, SQL migration (RLS + tenant-scoped tables), /login with magic-link allowlist + demo fallback. Stakeholder maps + HQ approval queue: auto-merge from Postgres on sign-in; upsert after each save / approve / reject (stakeholder_maps + approval_requests). Definition of done: run scripts/supabase-migrate.sql on a Singapore project; wire env on Vercel; extend the same pattern to distribution audit rows + engagement; Ricardo + species managers sign in without shared demo passwords; rotate any key that lived in a public repo window.",
    icon: Database,
  },
  {
    title: "Lane B · ~90 days",
    body:
      "Four-species real corpora (poultry TFIP seeded — extend Aqua, Ruminants, Swine with the same citation discipline). Marketing calendar integration (CoSchedule-class OAuth or pragmatic ICS export first). APAC RBAC rollout beyond email allowlist: roles surfaced in UI, reviewer vs species-manager vs viewer. Optional: pgvector hybrid retrieval on the Vault.",
    icon: CalendarClock,
  },
  {
    title: "Lane B · ~6 months",
    body:
      "Self-serve tenant onboarding paths for blueprint customers (DSM-Firmenich, Cargill, Kemin): provisioning checklist, isolated Vault slice, pricing narrative packaged for procurement. SOC 2 Type 1 readiness — controls mapping and audit trail on LLM calls / exports — not a marketing claim until an auditor signs.",
    icon: Building2,
  },
  {
    title: "Lane B · ~9 month checkpoint",
    body:
      "Mid-horizon proof: second design-partner tier live on the rails, TFIP-class campaigns reproducible without Danny in the loop, Hérubel-style infographic outputs running on production templates with legal-approved asset locks. Leading indicators: shipped campaigns per quarter per species manager, vault citation coverage %.",
    icon: Milestone,
  },
  {
    title: "Lane B · ~12 months",
    body:
      "Productize the Hérubel infographic engine as its own SKU. Partner-facing read-only API (approved frames + deliverables + engagement aggregates) with SLA. Instrument revenue attribution toward a credible $1–2M ARR narrative — tied to tenant seat count + workflow automation savings, not vanity AI demos.",
    icon: TrendingUp,
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
            <a
              href="/api/render-adisseo-onepager"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-adisseo-line px-3 py-1.5 text-xs font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              Download leave-behind PDF
            </a>
            <a
              href="/api/render-demo-script"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-adisseo-line px-3 py-1.5 text-xs font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              90s shoot script
            </a>
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
            APAC AI · APAC Pilot · Built for Adisseo
          </div>
          <h1 className="font-serif text-5xl font-bold leading-[1.05] text-adisseo-ink-strong md:text-6xl">
            How APAC AI bridges <br className="hidden md:inline" />
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
              Adisseo&apos;s marketing strategy (the <em>APAC</em>{" "}
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
              icon={Target}
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
            body="The scraper produces 125+ websites of competitor news. The APAC framework lives in PowerPoint. Sales gets the news; nothing connects them. Each species manager rebuilds the link manually for every campaign."
          />
          <GapCard
            title="No multilingual content infrastructure"
            body="Aqua audiences read local trade magazines in Indonesian, Vietnamese, Thai. LinkedIn doesn&apos;t reach them. There&apos;s no production pipeline that ships culturally-localised PDFs in those languages."
          />
          <GapCard
            title="No structured Total Value Solution framing"
            body="The APAC framework defines the answer: Pain × Promise × Proof × Proposition, anchored on a CBI + persona. But composing that frame happens in conversations, not a system. It doesn&apos;t scale across 5 species × 8 countries."
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
          <ArchLayer num="3" name="Strategic Frame (the APAC engine)" body="Stakeholder Map · CBI / CSF Ladder · Personas · Total Value Solution" highlight />
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
        title="What APAC AI ships today"
        subtitle="26 live modules — every one runnable in the browser, no setup required"
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
          <Stat n="8" label="APAC CBIs" />
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

      {/* ============================== 09 · PHASE 8 + LANE B ============================== */}
      <Section
        id="phase8-laneb"
        num="09"
        title="Phase 8 & Lane B horizons"
        subtitle="What “missing” meant on the masterplan: pilot backbone first, then commercialisation milestones — not one undifferentiated backlog"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PHASE8_LANE_B.map((r, i) => (
            <RoadmapCard key={r.title} idx={i + 1} {...r} />
          ))}
        </div>
        <p className="mt-8 rounded-2xl border border-adisseo-line bg-adisseo-bg px-5 py-4 text-xs leading-relaxed text-adisseo-muted">
          <strong className="text-adisseo-ink-strong">How to read this.</strong> Phase 8 is
          engineering closure on persistence and identity for the pilot. Lane B is a{" "}
          <em>program</em>: content, integrations, compliance, pricing, and partnerships —
          ship it as vertical slices (one species corpus, one calendar spike) rather than as a
          single mega-release. Capabilities already live under{" "}
          <Link href="/login" className="font-semibold text-adisseo-crimson hover:underline">
            /login
          </Link>
          ,{" "}
          <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">
            scripts/supabase-migrate.sql
          </code>
          , and{" "}
          <Link href="/credentials" className="font-semibold text-adisseo-crimson hover:underline">
            /credentials
          </Link>{" "}
          continue to carry the integration surface while Postgres catches up.
        </p>
      </Section>

      {/* ============================== 10 · LIVE ============================== */}
      <Section
        id="live"
        num="10"
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
          APAC AI · APAC Pilot · Built for Adisseo by Danny ·
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
