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
}

const AXIS_TINT = {
  cbi: "#9C2A2A",
  csf: "#0F4C81",
  persona: "#0E7C46",
};

export function ThreeAxisRadar({ score, size = 320, perAxis = 6 }: Props) {
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

  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
          3-axis radar · CBI · CSF · Persona
        </p>
        <p className="font-mono text-[10px] text-adisseo-muted">
          composite {score.composite}/100 · strength {score.adisseoStrength}/100
        </p>
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto mt-2 block" width={size} height={size}>
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
                fontSize={9}
                fontWeight={700}
                fill={P.ink}
                textAnchor={lx > cx ? "start" : lx < cx ? "end" : "middle"}
                dominantBaseline="middle"
              >
                {s.label}
              </text>
              <text
                x={lx}
                y={ly + 10}
                fontSize={8}
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

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
        <Legend tint={AXIS_TINT.cbi} label="CBI" />
        <Legend tint={AXIS_TINT.csf} label="CSF" />
        <Legend tint={AXIS_TINT.persona} label="Persona" />
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
