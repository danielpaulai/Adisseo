"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  Newspaper,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { AnimatedBeam } from "./AnimatedBeam";
import { SpeciesIcon } from "./Logo";

const SOURCES = [
  { id: "evonik", name: "Evonik", tag: "AMINOTrack VN" },
  { id: "kemin", name: "Kemin", tag: "AGP-Free ID" },
  { id: "skretting", name: "Skretting", tag: "Pangasius VN" },
  { id: "basf", name: "BASF", tag: "Lutavit Vita-mix" },
];

const STUDIOS = [
  {
    id: "swine",
    href: "/studio/swine",
    label: "Swine",
    sub: "<60s vertical short",
    species: "swine" as const,
  },
  {
    id: "aqua",
    href: "/studio/aqua",
    label: "Aqua",
    sub: "Magazine PDF leaflet",
    species: "aqua" as const,
  },
  {
    id: "poultry",
    href: "/studio/poultry",
    label: "Poultry",
    sub: "Email + carousel",
    species: "poultry" as const,
  },
  {
    id: "ruminants",
    href: "/studio/ruminants",
    label: "Ruminants",
    sub: "Manga brochure (JP)",
    species: "ruminants" as const,
  },
];

export function PipelineVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const coreRef = useRef<HTMLDivElement>(null);
  const studioRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <div
      ref={containerRef}
      className="relative grid grid-cols-3 items-center gap-6 rounded-2xl border border-adisseo-line bg-white px-4 py-8 shadow-sm sm:px-8"
      style={{ minHeight: 360 }}
    >
      {/* ── LEFT: scraper sources ────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
          Competitor scraper
        </p>
        {SOURCES.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => {
              sourceRefs.current[i] = el;
            }}
            className="z-10 flex items-center gap-2 rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs shadow-sm"
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-slate-100 text-adisseo-muted">
              <Newspaper size={13} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-adisseo-ink-strong">
                {s.name}
              </p>
              <p className="truncate text-[10px] text-adisseo-muted">{s.tag}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CENTRE: APAC AI core ──────────────────────────────────── */}
      <div className="flex items-center justify-center">
        <div
          ref={coreRef}
          className="adiplan-pulse z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-adisseo-crimson text-white shadow-lg"
        >
          <Sparkles size={20} />
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest">
            APAC
          </p>
          <p className="text-[9px] uppercase tracking-widest opacity-80">AI</p>
        </div>
      </div>

      {/* ── RIGHT: species studios ───────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-right text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
          Studio deliverables
        </p>
        {STUDIOS.map((st, i) => (
          <Link
            key={st.id}
            href={st.href}
            ref={(el) => {
              studioRefs.current[i] = el as unknown as HTMLDivElement | null;
            }}
            className="group z-10 flex items-center gap-2 rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs shadow-sm transition hover:border-adisseo-crimson"
          >
            <SpeciesIcon
              species={st.species}
              size={26}
              className="opacity-80 group-hover:opacity-100"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-adisseo-ink-strong">
                {st.label}
              </p>
              <p className="truncate text-[10px] text-adisseo-muted">{st.sub}</p>
            </div>
            <ArrowRight
              size={12}
              className="flex-none text-adisseo-muted-soft transition group-hover:text-adisseo-crimson"
            />
          </Link>
        ))}
      </div>

      {/* ── BEAMS: scraper → APAC core ────────────────────────────── */}
      {SOURCES.map((s, i) => (
        <AnimatedBeam
          key={`in-${s.id}`}
          containerRef={containerRef}
          fromRef={{
            current: sourceRefs.current[i] ?? null,
          }}
          toRef={coreRef}
          color="#A70A2D"
          duration={2.6 + i * 0.25}
          delay={i * 0.4}
          curvature={(i - 1.5) * 18}
          beamWidth={1.8}
        />
      ))}

      {/* ── BEAMS: APAC core → studios (cyan/orange mix) ─────────── */}
      {STUDIOS.map((st, i) => (
        <AnimatedBeam
          key={`out-${st.id}`}
          containerRef={containerRef}
          fromRef={coreRef}
          toRef={{
            current: studioRefs.current[i] ?? null,
          }}
          color={i % 2 === 0 ? "#00A3C4" : "#D97641"}
          duration={2.4 + i * 0.3}
          delay={1.0 + i * 0.35}
          curvature={(i - 1.5) * 18}
          beamWidth={1.8}
        />
      ))}
    </div>
  );
}
