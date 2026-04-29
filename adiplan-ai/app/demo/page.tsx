import Link from "next/link";
import {
  ArrowRight,
  Newspaper,
  Target,
  Bookmark,
  BookOpen,
  Activity,
  Sparkles,
  Mic,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Logo } from "@/components/Logo";

/* =============================================================================
 * /demo — guided 5-step walkthrough.
 * The fastest path to "wow" — meant to be the click-by-click for the May 7
 * global-team demo and any future cold-start audience.
 * ============================================================================= */

const STEPS = [
  {
    n: "01",
    title: "Match a competitor article",
    body: "Open News Bridge. Pick any seeded article (Mintec, Kemin, Cargill\u2026). Click Match. The LLM returns the CBI it surfaces, the persona to target, and three deliverable formats grounded in the AdiPlan vocabulary.",
    href: "/news-bridge",
    cta: "Open News Bridge",
    icon: Newspaper,
    estTime: "~30s",
  },
  {
    n: "02",
    title: "Compose the strategic frame",
    body: "Hit Compose Strategic Frame. AdiPlan AI synthesises an Enterprise Persona, an Enterprise Insight, and a Pain × Promise × Proof × Proposition card pack — plus an activations row pointing into the species studios.",
    href: "/strategic-frame",
    cta: "Open the frame",
    icon: Target,
    estTime: "~20s",
  },
  {
    n: "03",
    title: "Ship a species deliverable",
    body: "Click any species in the activations row — Aqua leaflet, Poultry email + carousel, Ruminants manga, Swine vertical short. The studio pre-fills with the right language, audience, and topic. Generate. Download.",
    href: "/studio/ruminants",
    cta: "Open Ruminants studio",
    icon: BookOpen,
    estTime: "~30s",
  },
  {
    n: "04",
    title: "Stress-test the billboard",
    body: "Open Studio · Billboard. The composed frame auto-fills. Pick A2 booth, A1 convention, or square LinkedIn key visual. Get back the AdiPlan billboard — Headline + Differentiation + RTB — self-scored on Unique / Important / Believable.",
    href: "/studio/billboard",
    cta: "Open Billboard studio",
    icon: Bookmark,
    estTime: "~20s",
  },
  {
    n: "05",
    title: "Open the war room on the big screen",
    body: "Switch to /dashboard. The session’s articles matched, frames composed, and deliverables shipped are all there — with conversion ratios. This is what regional sales sees on Monday morning.",
    href: "/dashboard",
    cta: "Open the war room",
    icon: Activity,
    estTime: "~10s",
  },
];

const SHORTCUTS = [
  {
    icon: Sparkles,
    title: "Matrix → Frame",
    body: "Skip News Bridge entirely. Open the Personas × CSF matrix, click any diagonal-win cell, get back a synthesised Strategic Frame in one hop.",
    href: "/personas-matrix",
  },
  {
    icon: Mic,
    title: "Voice memo → Studio",
    body: "Antoine’s flow. Record 30s on the phone, Whisper transcribes, the transcript seeds whichever species studio you point it at.",
    href: "/studio/voice-memo",
  },
  {
    icon: BookOpen,
    title: "The deep deck",
    body: "If the audience asks 'why does this exist?' — open /presentation. The need, the gap, the architecture, what we built, what's missing, how it could be better.",
    href: "/presentation",
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <Link
            href="/"
            className="text-xs font-medium text-adisseo-muted hover:text-adisseo-crimson"
          >
            Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-14">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
          <Sparkles size={12} />
          Guided walkthrough
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-adisseo-ink-strong md:text-5xl">
          The fastest path to &ldquo;wow&rdquo;
        </h1>
        <p className="mt-3 max-w-2xl text-base text-adisseo-muted">
          Five clicks. About two minutes. From a scraped competitor headline
          all the way to a downloadable PDF — in the language of the
          country, in the voice of the species manager, on a war-room
          dashboard.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-adisseo-muted">
          <Clock size={12} />
          <span className="font-semibold text-adisseo-ink-strong">~2 minutes total</span>
          <span>·</span>
          <span>5 steps</span>
          <span>·</span>
          <span>1 demo path</span>
        </div>

        <ol className="mt-10 space-y-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <li
                key={s.n}
                className="rounded-3xl border border-adisseo-line bg-white p-6 shadow-sm md:p-8"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                  <div className="flex shrink-0 items-baseline gap-3">
                    <span className="font-serif text-5xl font-bold text-adisseo-crimson md:text-6xl">
                      {s.n}
                    </span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-adisseo-crimson/5 text-adisseo-crimson">
                      <Icon size={20} />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif text-2xl font-bold text-adisseo-ink-strong md:text-3xl">
                        {s.title}
                      </h2>
                      <span className="rounded-full bg-adisseo-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                        {s.estTime}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-adisseo-muted md:text-base">
                      {s.body}
                    </p>
                    <Link
                      href={s.href}
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-adisseo-ink-strong px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                      {s.cta} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <section className="mt-14">
          <h3 className="font-serif text-2xl font-bold text-adisseo-ink-strong">
            Or take a shortcut
          </h3>
          <p className="mt-1 text-sm text-adisseo-muted">
            Three other entry points if the audience wants something different.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {SHORTCUTS.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.title}
                  href={s.href}
                  className="group flex flex-col rounded-2xl border border-adisseo-line bg-white p-5 transition hover:border-adisseo-crimson hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-adisseo-crimson/5 text-adisseo-crimson">
                    <Icon size={18} />
                  </span>
                  <p className="mt-3 text-base font-bold text-adisseo-ink-strong group-hover:text-adisseo-crimson">
                    {s.title}
                  </p>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-adisseo-muted">
                    {s.body}
                  </p>
                  <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-adisseo-crimson">
                    Open <ArrowRight size={12} />
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-adisseo-ink-strong bg-adisseo-ink-strong p-8 text-white md:p-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
            Demo etiquette
          </p>
          <h3 className="mt-3 font-serif text-3xl font-bold leading-tight md:text-4xl">
            Don&apos;t click <span className="text-adisseo-orange">around</span>.
            Click <span className="text-adisseo-orange">through</span>.
          </h3>
          <ul className="mt-5 space-y-2 text-sm text-white/85 md:text-base">
            {[
              "Open one tab. The whole demo flows in a single tab.",
              "Don’t pre-warm. The first match call is also the demo — the audience sees it cold.",
              "Read aloud the strategic frame’s one-line summary before clicking into a studio.",
              "When the PDF renders, scroll to the stat panel. That’s the proof line.",
              "End on /dashboard. Empty at the start, full by the end. That’s the story.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-adisseo-orange"
                />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
