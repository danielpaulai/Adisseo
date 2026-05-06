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
  const size = sizeProp ?? (featured ? 500 : 340);
  const cx = size / 2;
  const cy = size / 2;
  // Leave more room for labels in featured mode
  const radius = size / 2 - (featured ? 52 : 40);

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
    startIdx: number;
  }[] = [];

  for (const h of cbiTop) {
    spokes.push({
      angle: i * stepRad - Math.PI / 2,
      length: (h.score / 100) * radius,
      label: shortenLabel(labelByCbi[h.id] ?? h.id),
      score: h.score,
      color: AXIS_TINT.cbi,
      axis: "cbi",
      startIdx: i,
    });
    i++;
  }
  const csfStart = i;
  for (const h of csfTop) {
    spokes.push({
      angle: i * stepRad - Math.PI / 2,
      length: (h.score / 100) * radius,
      label: shortenLabel(labelByCsf[h.id] ?? h.id),
      score: h.score,
      color: AXIS_TINT.csf,
      axis: "csf",
      startIdx: i,
    });
    i++;
  }
  const personaStart = i;
  for (const h of personaTop) {
    spokes.push({
      angle: i * stepRad - Math.PI / 2,
      length: (h.score / 100) * radius,
      label: shortenLabel(labelByPersona[h.id] ?? h.id),
      score: h.score,
      color: AXIS_TINT.persona,
      axis: "persona",
      startIdx: i,
    });
    i++;
  }

  const ringRadii = [0.25, 0.5, 0.75, 1].map((r) => r * radius);
  const ringLabels = ["25", "50", "75", "100"];

  const labelFs = featured ? 11 : 9;
  const scoreFs = featured ? 10 : 8;

  /* Helper: arc background sector path for an axis zone */
  function arcSectorPath(
    startIdx: number,
    count: number,
    r: number
  ): string {
    if (count === 0) return "";
    const a0 = startIdx * stepRad - Math.PI / 2 - stepRad * 0.5;
    const a1 = (startIdx + count) * stepRad - Math.PI / 2 - stepRad * 0.5;
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
  }

  /* Per-axis polygon (score dots connected) */
  function axisPolygonPoints(axisSpokes: typeof spokes): string {
    return axisSpokes
      .map((s) => {
        const x = cx + Math.cos(s.angle) * s.length;
        const y = cy + Math.sin(s.angle) * s.length;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  const cbiSpokes = spokes.filter((s) => s.axis === "cbi");
  const csfSpokes = spokes.filter((s) => s.axis === "csf");
  const personaSpokes = spokes.filter((s) => s.axis === "persona");

  /* Axis zone mid-angle for zone label placement */
  function zoneMidAngle(startIdx: number, count: number) {
    return (startIdx + count / 2) * stepRad - Math.PI / 2;
  }
  const zoneLabelRadius = radius + (featured ? 38 : 28);

  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
            Framework fit · CBI · CSF · Persona
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-adisseo-ink-strong">
            Composite{" "}
            <span className="font-bold text-adisseo-crimson">
              {score.composite}
            </span>
            /100 · Adisseo cell strength{" "}
            <span className="font-bold" style={{ color: AXIS_TINT.persona }}>
              {score.adisseoStrength}
            </span>
            /100
          </p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Legend tint={AXIS_TINT.cbi} label="CBI" />
          <Legend tint={AXIS_TINT.csf} label="CSF" />
          <Legend tint={AXIS_TINT.persona} label="Persona" />
        </div>
      </div>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto mt-4 block max-w-full"
        width={size}
        height={size}
      >
        {/* Axis zone background arcs (faint tinted sectors) */}
        <path
          d={arcSectorPath(0, cbiTop.length, radius)}
          fill={AXIS_TINT.cbi}
          fillOpacity={0.05}
        />
        <path
          d={arcSectorPath(csfStart, csfTop.length, radius)}
          fill={AXIS_TINT.csf}
          fillOpacity={0.05}
        />
        <path
          d={arcSectorPath(personaStart, personaTop.length, radius)}
          fill={AXIS_TINT.persona}
          fillOpacity={0.05}
        />

        {/* Concentric rings */}
        {ringRadii.map((r, idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={P.line}
            strokeWidth={idx === ringRadii.length - 1 ? 1.5 : 0.6}
            strokeDasharray={idx < ringRadii.length - 1 ? "3 3" : undefined}
          />
        ))}

        {/* Ring labels (score scale) */}
        {ringRadii.map((r, idx) => (
          <text
            key={`rl-${idx}`}
            x={cx + 3}
            y={cy - r + 3}
            fontSize={7}
            fill={P.muted ?? "#999"}
            dominantBaseline="auto"
            opacity={0.7}
          >
            {ringLabels[idx]}
          </text>
        ))}

        {/* Axis zone border arcs (outer ring edge) */}
        {[
          { start: 0, count: cbiTop.length, color: AXIS_TINT.cbi },
          { start: csfStart, count: csfTop.length, color: AXIS_TINT.csf },
          { start: personaStart, count: personaTop.length, color: AXIS_TINT.persona },
        ].map(({ start, count, color }, idx) => {
          if (count === 0) return null;
          const a0 = start * stepRad - Math.PI / 2 - stepRad * 0.5;
          const a1 = (start + count) * stepRad - Math.PI / 2 - stepRad * 0.5;
          const x0 = cx + Math.cos(a0) * radius;
          const y0 = cy + Math.sin(a0) * radius;
          const x1 = cx + Math.cos(a1) * radius;
          const y1 = cy + Math.sin(a1) * radius;
          const large = a1 - a0 > Math.PI ? 1 : 0;
          return (
            <path
              key={`arc-${idx}`}
              d={`M ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1}`}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              opacity={0.5}
            />
          );
        })}

        {/* Zone labels at outer rim */}
        {[
          { start: 0, count: cbiTop.length, color: AXIS_TINT.cbi, label: "CBI" },
          { start: csfStart, count: csfTop.length, color: AXIS_TINT.csf, label: "CSF" },
          { start: personaStart, count: personaTop.length, color: AXIS_TINT.persona, label: "Persona" },
        ].map(({ start, count, color, label }, idx) => {
          if (count === 0) return null;
          const angle = zoneMidAngle(start, count);
          const lx = cx + Math.cos(angle) * zoneLabelRadius;
          const ly = cy + Math.sin(angle) * zoneLabelRadius;
          return (
            <text
              key={`zone-${idx}`}
              x={lx}
              y={ly}
              fontSize={featured ? 11 : 9}
              fontWeight={800}
              fill={color}
              textAnchor="middle"
              dominantBaseline="middle"
              opacity={0.85}
            >
              {label}
            </text>
          );
        })}

        {/* Per-axis score polygons */}
        {cbiSpokes.length >= 2 && (
          <polygon
            points={axisPolygonPoints(cbiSpokes)}
            fill={AXIS_TINT.cbi}
            fillOpacity={0.15}
            stroke={AXIS_TINT.cbi}
            strokeWidth={1.5}
          />
        )}
        {csfSpokes.length >= 2 && (
          <polygon
            points={axisPolygonPoints(csfSpokes)}
            fill={AXIS_TINT.csf}
            fillOpacity={0.15}
            stroke={AXIS_TINT.csf}
            strokeWidth={1.5}
          />
        )}
        {personaSpokes.length >= 2 && (
          <polygon
            points={axisPolygonPoints(personaSpokes)}
            fill={AXIS_TINT.persona}
            fillOpacity={0.15}
            stroke={AXIS_TINT.persona}
            strokeWidth={1.5}
          />
        )}

        {/* Spoke lines (faint guide rails to outer ring) */}
        {spokes.map((s, idx) => {
          const ox = cx + Math.cos(s.angle) * radius;
          const oy = cy + Math.sin(s.angle) * radius;
          return (
            <line
              key={`guide-${idx}`}
              x1={cx}
              y1={cy}
              x2={ox}
              y2={oy}
              stroke={s.color}
              strokeWidth={0.4}
              opacity={0.2}
            />
          );
        })}

        {/* Spoke data lines + dots + labels */}
        {spokes.map((s, idx) => {
          const x = cx + Math.cos(s.angle) * s.length;
          const y = cy + Math.sin(s.angle) * s.length;
          const labelDist = radius + (featured ? 18 : 14);
          const lx = cx + Math.cos(s.angle) * labelDist;
          const ly = cy + Math.sin(s.angle) * labelDist;
          const anchor =
            Math.abs(lx - cx) < 4 ? "middle" : lx > cx ? "start" : "end";
          return (
            <g key={idx}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={s.color}
                strokeWidth={1.6}
                opacity={0.75}
              />
              <circle cx={x} cy={y} r={featured ? 4 : 3} fill={s.color} />
              <text
                x={lx}
                y={ly - (featured ? 6 : 5)}
                fontSize={labelFs}
                fontWeight={700}
                fill={P.ink}
                textAnchor={anchor}
                dominantBaseline="middle"
              >
                {s.label}
              </text>
              <text
                x={lx}
                y={ly + (featured ? 7 : 5)}
                fontSize={scoreFs}
                fontWeight={600}
                fill={s.color}
                textAnchor={anchor}
                dominantBaseline="middle"
              >
                {s.score}
              </text>
            </g>
          );
        })}

        {/* Centre dot */}
        <circle cx={cx} cy={cy} r={5} fill={P.ink} />
      </svg>

      {featured && (
        <div className="mt-4 rounded-xl border border-adisseo-line bg-adisseo-bg/60 px-4 py-3">
          <p className="text-xs font-semibold text-adisseo-ink-strong">How to read this</p>
          <ul className="mt-2 space-y-1.5 text-xs text-adisseo-ink">
            <li className="flex gap-2">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: AXIS_TINT.cbi }} />
              <span>
                <span className="font-semibold" style={{ color: AXIS_TINT.cbi }}>CBI</span> — business issue at risk for the customer. Longer spoke = stronger keyword match.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: AXIS_TINT.csf }} />
              <span>
                <span className="font-semibold" style={{ color: AXIS_TINT.csf }}>CSF</span> — buyer KPI (margin, FCR, disease rate). Score 0–100 keyword fit.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: AXIS_TINT.persona }} />
              <span>
                <span className="font-semibold" style={{ color: AXIS_TINT.persona }}>Persona</span> — which corporate role cares most about this article.
              </span>
            </li>
          </ul>
        </div>
      )}
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
