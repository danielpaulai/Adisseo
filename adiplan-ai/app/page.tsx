import Link from "next/link";
import {
  Network,
  Layers,
  Newspaper,
  Clapperboard,
  FileText,
  Mail,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Logo, SpeciesIcon } from "@/components/Logo";
import { PipelineVisual } from "@/components/PipelineVisual";
import { LiveExampleCTA } from "@/components/LiveExampleCTA";

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
];

const upcoming = [
  { species: null, text: "Module 03 — Enterprise Personas (CSF diagonal matrix)" },
  { species: null, text: "Module 04 — Total Value Solution composer" },
  { species: null, text: "Module 05 — Billboard Campaign generator" },
  { species: null, text: "Engagement tracker — Malaysia-ASF viewer-time funnel" },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size="md" />
          <span className="text-xs text-adisseo-muted">
            Demo target:{" "}
            <span className="font-medium text-adisseo-ink-strong">Thu May 7, 2026</span>
          </span>
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
          <div className="flex flex-wrap gap-2 pt-2 text-[11px]">
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
