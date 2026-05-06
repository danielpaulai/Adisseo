"use client";

/**
 * ThreeAxisRadar — Phase 2 visualization (DEMO PRIORITY 1).
 *
 * Three concentric radar wheels, one per axis:
 *   • CBI ring (Critical Business Issues)  → rose
 *   • CSF ring (Customer Success Factors)  → indigo
 *   • Persona ring (Corporate Personas)    → emerald
 *
 * Each axis's top-N entries get a labelled spoke. The score (0–100)
 * sets the spoke length. The overall composite anchors the centre dot.
 *
 * The whole thing is pure SVG with no external chart lib — works inside
 * Next 15 RSC + react-pdf later if needed.
 */

import {
  herubelPalette as P,
} from "@/lib/design-system-herubel";
import type { ThreeAxisScore } from "@/lib/news-scorer";
import { adiplanCBIs } from "@/lib/adiplan";
import { matrixCSFs, matrixPersonas } from "@/lib/personas-matrix";

interface Props {
  score: ThreeAxisScore;
  /** Outer SVG side-length. */
  size?: number;
  /** How many items to show per axis (default 6 — matches matrixCSFs length). */
  perAxis?: number;
  /** Larger chart + plain-language guide (e.g. after Analyze on Competitor Watch). */
  featured?: boolean;
}

const AXIS_TINT = {
  cbi: "#9C2A2A",
  csf: "#0F4C81",
  persona: "#0E7C46",
};

export function ThreeAxisRadar({
  score,
  size: sizeProp,
  perAxis = 6,
  featured = false,
}: Props) {
  const size = sizeProp ?? (featured ? 420 : 320);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 32;

  const cbiTop = score.cbiRanked.slice(0, perAxis);
  const csfTop = score.csfRanked.slice(0, perAxis);
  const personaTop = score.personaRanked.slice(0, perAxis);

  const total = cbiTop.length + csfTop.length + personaTop.length;
  const stepRad = (Math.PI * 2) / total;

  const labelByCbi: Record<string, string> = Object.fromEntries(
    adiplanCBIs.map((c) => [c.id, c.label])
  );
  const labelByCsf: Record<string, string> = Object.fromEntries(
    matrixCSFs.map((c) => [c.id, c.shortLabel])
  );
  const labelByPersona: Record<string, string> = Object.fromEntries(
    matrixPersonas.map((p) => [p.id, p.label])
  );

  /* Place each spoke around the circle */
  let i = 0;
  const spokes: {
    angle: number;
    length: number;
    label: string;
    score: number;
    color: string;
    axis: "cbi" | "csf" | "persona";
  }[] = [];

  for (const h of cbiTop) {
    spokes.push({
      angle: i * stepRad - Math.PI / 2,
      length: (h.score / 100) * radius,
      label: shortenLabel(labelByCbi[h.id] ?? h.id),
      score: h.score,
      color: AXIS_TINT.cbi,
      axis: "cbi",
    });
    i++;
  }
  for (const h of csfTop) {
    spokes.push({
      angle: i * stepRad - Math.PI / 2,
      length: (h.score / 100) * radius,
      label: shortenLabel(labelByCsf[h.id] ?? h.id),
      score: h.score,
      color: AXIS_TINT.csf,
      axis: "csf",
    });
    i++;
  }
  for (const h of personaTop) {
    spokes.push({
      angle: i * stepRad - Math.PI / 2,
      length: (h.score / 100) * radius,
      label: shortenLabel(labelByPersona[h.id] ?? h.id),
      score: h.score,
      color: AXIS_TINT.persona,
      axis: "persona",
    });
    i++;
  }

  const ringRadii = [0.25, 0.5, 0.75, 1].map((r) => r * radius);

  const labelFs = featured ? 10 : 9;
  const scoreFs = featured ? 9 : 8;

  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
            Framework fit · CBI · CSF · Persona
          </p>
          <p className="mt-1 font-mono text-[11px] text-adisseo-ink-strong">
            Composite {score.composite}/100 · Adisseo strength (cell proxy){" "}
            {score.adisseoStrength}/100
          </p>
        </div>
      </div>

      {featured && (
        <div className="mt-4 rounded-xl border border-adisseo-line bg-adisseo-bg/60 px-4 py-3 text-sm leading-relaxed text-adisseo-ink">
          <p className="font-semibold text-adisseo-ink-strong">How to read this</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-xs text-adisseo-ink">
            <li>
              <span className="font-semibold" style={{ color: AXIS_TINT.cbi }}>
                CBI (Critical Business Issue)
              </span>{" "}
              — the competitor angle on what is at risk for the customer (rose
              spokes).
            </li>
            <li>
              <span className="font-semibold" style={{ color: AXIS_TINT.csf }}>
                CSF (Customer Success Factor)
              </span>{" "}
              — what the buyer is measured on (margin, FCR, disease, etc.; indigo
              spokes).
            </li>
            <li>
              <span className="font-semibold" style={{ color: AXIS_TINT.persona }}>
                Persona
              </span>{" "}
              — which corporate role cares most (emerald spokes).
            </li>
            <li>
              Spoke length is a 0–100 keyword fit vs our APAC vocabulary — not a
              revenue forecast. Longer = stronger semantic match on that axis.
            </li>
          </ul>
        </div>
      )}

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto mt-3 block max-w-full"
        width={size}
        height={size}
      >
        {/* Concentric rings */}
        {ringRadii.map((r, idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={P.line}
            strokeWidth={idx === ringRadii.length - 1 ? 1.2 : 0.5}
          />
        ))}
        {/* Spokes */}
        {spokes.map((s, idx) => {
          const x = cx + Math.cos(s.angle) * s.length;
          const y = cy + Math.sin(s.angle) * s.length;
          const lx = cx + Math.cos(s.angle) * (radius + 14);
          const ly = cy + Math.sin(s.angle) * (radius + 14);
          return (
            <g key={idx}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={s.color}
                strokeWidth={1.2}
                opacity={0.6}
              />
              <circle cx={x} cy={y} r={3.2} fill={s.color} />
              <text
                x={lx}
                y={ly}
                fontSize={labelFs}
                fontWeight={700}
                fill={P.ink}
                textAnchor={lx > cx ? "start" : lx < cx ? "end" : "middle"}
                dominantBaseline="middle"
              >
                {s.label}
              </text>
              <text
                x={lx}
                y={ly + (featured ? 12 : 10)}
                fontSize={scoreFs}
                fontWeight={600}
                fill={s.color}
                textAnchor={lx > cx ? "start" : lx < cx ? "end" : "middle"}
                dominantBaseline="middle"
              >
                {s.score}
              </text>
            </g>
          );
        })}
        {/* Connect the top-N polygon */}
        <polygon
          points={spokes
            .map((s) => {
              const x = cx + Math.cos(s.angle) * s.length;
              const y = cy + Math.sin(s.angle) * s.length;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ")}
          fill={P.accent}
          fillOpacity={0.12}
          stroke={P.accent}
          strokeWidth={1.4}
        />
        {/* Centre dot */}
        <circle cx={cx} cy={cy} r={4} fill={P.ink} />
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
        <Legend tint={AXIS_TINT.cbi} label="CBI · business issue" />
        <Legend tint={AXIS_TINT.csf} label="CSF · buyer KPI" />
        <Legend tint={AXIS_TINT.persona} label="Persona · buyer role" />
      </div>
    </div>
  );
}

function Legend({ tint, label }: { tint: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: tint }} />
      {label}
    </span>
  );
}

function shortenLabel(s: string): string {
  if (!s) return "";
  if (s.length <= 22) return s;
  return s.slice(0, 21) + "…";
}
