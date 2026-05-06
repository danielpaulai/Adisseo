"use client";

/**
 * ThreeAxisRadar — Hérubel-style 3-column framework breakdown.
 *
 * Replaces the SVG spider chart with a clear, bold, typographic layout:
 *   • CBI      (Critical Business Issue)   → crimson column
 *   • CSF      (Customer Success Factor)   → navy column
 *   • Persona  (Buyer Role)                → emerald column
 *
 * Each column shows the axis name, a one-line definition, the top-ranked
 * #1 winner prominently, then remaining items as horizontal score bars.
 *
 * featured=true → full breakdown (used after Compare on Competitor Watch).
 * featured=false → compact 3-pill summary (used in article cards).
 */

import type { ThreeAxisScore } from "@/lib/news-scorer";
import { adiplanCBIs } from "@/lib/adiplan";
import { matrixCSFs, matrixPersonas } from "@/lib/personas-matrix";

interface Props {
  score: ThreeAxisScore;
  /** Kept for API compat — unused in new design. */
  size?: number;
  /** How many items to show per axis (default 5). */
  perAxis?: number;
  /** Full 3-column breakdown with definitions (used after Compare). */
  featured?: boolean;
}

const AXIS = [
  {
    key: "cbi" as const,
    short: "CBI",
    long: "Critical Business Issue",
    definition: "The risk the customer can't afford to ignore.",
    color: "#9C2A2A",
    pillBg: "rgba(156,42,42,0.10)",
  },
  {
    key: "csf" as const,
    short: "CSF",
    long: "Customer Success Factor",
    definition: "The KPI the buyer is measured on.",
    color: "#0F4C81",
    pillBg: "rgba(15,76,129,0.10)",
  },
  {
    key: "persona" as const,
    short: "Persona",
    long: "Buyer Role",
    definition: "The corporate role that cares most.",
    color: "#0E7C46",
    pillBg: "rgba(14,124,70,0.10)",
  },
] as const;

type AxisKey = (typeof AXIS)[number]["key"];

function shortenLabel(s: string): string {
  if (!s) return "";
  if (s.length <= 30) return s;
  return s.slice(0, 29) + "…";
}

function ScoreBar({
  label,
  score,
  color,
  isTop,
}: {
  label: string;
  score: number;
  color: string;
  isTop: boolean;
}) {
  if (isTop) {
    return (
      <div className="mb-3 overflow-hidden rounded-xl p-3.5" style={{ background: `${color}10` }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color }}>
              Top match
            </p>
            <p className="mt-0.5 text-[13px] font-bold leading-tight text-[#0E1014]">{label}</p>
          </div>
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-black text-white"
            style={{ background: color }}
          >
            {score}
          </div>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-black/8">
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between gap-1">
        <p className="truncate text-[11px] font-semibold text-[#0E1014]">{label}</p>
        <p className="shrink-0 text-[11px] font-bold tabular-nums" style={{ color }}>{score}</p>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#E2DFD7]">
        <div
          className="h-1 rounded-full"
          style={{ width: `${score}%`, background: color, opacity: 0.65 }}
        />
      </div>
    </div>
  );
}

export function ThreeAxisRadar({ score, perAxis = 5, featured = false }: Props) {
  const labelByCbi: Record<string, string> = Object.fromEntries(
    adiplanCBIs.map((c) => [c.id, c.label])
  );
  const labelByCsf: Record<string, string> = Object.fromEntries(
    matrixCSFs.map((c) => [c.id, c.shortLabel])
  );
  const labelByPersona: Record<string, string> = Object.fromEntries(
    matrixPersonas.map((p) => [p.id, p.label])
  );

  const ranked: Record<AxisKey, { id: string; label: string; score: number }[]> = {
    cbi: score.cbiRanked.slice(0, perAxis).map((h) => ({
      id: h.id,
      label: shortenLabel(labelByCbi[h.id] ?? h.id),
      score: h.score,
    })),
    csf: score.csfRanked.slice(0, perAxis).map((h) => ({
      id: h.id,
      label: shortenLabel(labelByCsf[h.id] ?? h.id),
      score: h.score,
    })),
    persona: score.personaRanked.slice(0, perAxis).map((h) => ({
      id: h.id,
      label: shortenLabel(labelByPersona[h.id] ?? h.id),
      score: h.score,
    })),
  };

  /* ── Compact pill summary (article list view) ──────────────────── */
  if (!featured) {
    return (
      <div className="rounded-xl border border-[#E2DFD7] bg-[#FBFAF6] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#888]">
            Framework Fit
          </p>
          <span className="rounded-full bg-[#0E1014]/8 px-2 py-0.5 text-[11px] font-bold text-[#0E1014]">
            {score.composite}/100
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AXIS.map((ax) => {
            const top = ranked[ax.key][0];
            if (!top) return null;
            return (
              <span
                key={ax.key}
                style={{ background: ax.pillBg, color: ax.color }}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              >
                <span className="font-black">{ax.short}</span>
                {top.label}
                <span className="opacity-60">· {top.score}</span>
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Featured 3-column breakdown ──────────────────────────────── */
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2DFD7] bg-white shadow-sm">
      {/* Dark header bar */}
      <div className="flex items-center justify-between gap-4 bg-[#0E1014] px-6 py-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
            APAC Framework Match
          </p>
          <p className="mt-0.5 text-base font-bold text-white">
            CBI · CSF · Persona Breakdown
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
            Composite Score
          </p>
          <p className="text-[32px] font-black leading-none text-white">
            {score.composite}
            <span className="text-[15px] font-semibold text-white/40">/100</span>
          </p>
        </div>
      </div>

      {/* 3 equal columns */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2DFD7]">
        {AXIS.map((ax) => {
          const items = ranked[ax.key];
          return (
            <div key={ax.key} className="flex flex-col p-5">
              {/* Column header */}
              <div className="mb-4 pb-3 border-b border-[#E2DFD7]">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white"
                    style={{ background: ax.color }}
                  >
                    {ax.short[0]}
                  </span>
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.14em]"
                    style={{ color: ax.color }}
                  >
                    {ax.short}
                  </p>
                </div>
                <p className="text-[14px] font-bold text-[#0E1014] leading-snug">
                  {ax.long}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-[#888]">
                  {ax.definition}
                </p>
              </div>

              {/* Score bars */}
              <div className="flex-1">
                {items.length === 0 ? (
                  <p className="text-[11px] text-[#bbb]">No data</p>
                ) : (
                  items.map((item, idx) => (
                    <ScoreBar
                      key={item.id}
                      label={item.label}
                      score={item.score}
                      color={ax.color}
                      isTop={idx === 0}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="border-t border-[#E2DFD7] bg-[#FBFAF6] px-6 py-3">
        <p className="text-[10px] text-[#aaa]">
          Score 0–100 = keyword proximity to Adisseo&rsquo;s APAC vocabulary.
          Longer bar = stronger semantic match — not a revenue forecast.
        </p>
      </div>
    </div>
  );
}
