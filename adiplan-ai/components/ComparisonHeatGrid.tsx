"use client";

/**
 * ComparisonHeatGrid — Phase 2.
 *
 * When the operator has scored 3+ articles, this component renders a
 * dense matrix of articles × axis-columns. Tints get hotter where
 * competitor coverage is dense — the operator can spot at a glance
 * where Adisseo's APAC content needs to push.
 *
 * Three sections stack vertically: CBI grid, CSF grid, Persona grid.
 * Each row label is the article title; each column is the axis entry.
 */

import type { ComparisonGrid } from "@/lib/news-scorer";
import { heatTint } from "@/lib/news-scorer";

interface Props {
  grid: ComparisonGrid;
  /** Truncate row title labels to fit on a 220px label column. */
  titleMax?: number;
}

export function ComparisonHeatGrid({ grid, titleMax = 56 }: Props) {
  if (grid.rows.length === 0) return null;

  return (
    <div className="space-y-6">
      <Section
        title="CBI coverage"
        subtitle="Critical Business Issue keyword density. Hotter cells = competitor is hammering this CBI."
      >
        <Grid
          rows={grid.rows.map((r) => ({
            article: r.article,
            cells: grid.cbiCols.map((c) => {
              const hit = r.score.cbiRanked.find((h) => h.id === c.id);
              return { score: hit?.score ?? 0 };
            }),
            top: r.score.cbi.id,
            cols: grid.cbiCols.map((c) => c.id),
          }))}
          colLabels={grid.cbiCols.map((c) => c.label)}
          titleMax={titleMax}
          totals={grid.cbiCols.map((c) => grid.totals.cbi[c.id] ?? 0)}
        />
      </Section>

      <Section
        title="CSF coverage"
        subtitle="Customer Success Factor density — what the buyer measures themselves on."
      >
        <Grid
          rows={grid.rows.map((r) => ({
            article: r.article,
            cells: grid.csfCols.map((c) => {
              const hit = r.score.csfRanked.find((h) => h.id === c.id);
              return { score: hit?.score ?? 0 };
            }),
            top: r.score.csf.id,
            cols: grid.csfCols.map((c) => c.id),
          }))}
          colLabels={grid.csfCols.map((c) => c.label)}
          titleMax={titleMax}
          totals={grid.csfCols.map((c) => grid.totals.csf[c.id] ?? 0)}
        />
      </Section>

      <Section
        title="Persona coverage"
        subtitle="Which corporate persona inside the buyer is the competitor courting."
      >
        <Grid
          rows={grid.rows.map((r) => ({
            article: r.article,
            cells: grid.personaCols.map((c) => {
              const hit = r.score.personaRanked.find((h) => h.id === c.id);
              return { score: hit?.score ?? 0 };
            }),
            top: r.score.persona.id,
            cols: grid.personaCols.map((c) => c.id),
          }))}
          colLabels={grid.personaCols.map((c) => c.label)}
          titleMax={titleMax}
          totals={grid.personaCols.map((c) => grid.totals.persona[c.id] ?? 0)}
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-crimson">
        {title}
      </p>
      <p className="text-[11px] text-adisseo-muted">{subtitle}</p>
      <div className="mt-2 overflow-x-auto rounded-xl border border-adisseo-line bg-white">
        {children}
      </div>
    </div>
  );
}

function Grid({
  rows,
  colLabels,
  titleMax,
  totals,
}: {
  rows: {
    article: { id: string; title: string; competitor: string };
    cells: { score: number }[];
    top: string;
    cols: string[];
  }[];
  colLabels: string[];
  titleMax: number;
  totals: number[];
}) {
  return (
    <table className="w-full text-[10px]">
      <thead>
        <tr className="bg-stone-50 text-[9px] uppercase tracking-widest text-adisseo-muted">
          <th className="px-3 py-2 text-left font-bold" style={{ width: 220 }}>
            Article
          </th>
          {colLabels.map((label, i) => (
            <th
              key={i}
              className="px-2 py-2 text-center font-bold"
              title={label}
            >
              <span className="block max-w-[80px] truncate">{label}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.article.id} className="border-t border-adisseo-line align-top">
            <td className="px-3 py-2">
              <p className="font-bold text-adisseo-ink-strong">
                {r.article.competitor}
              </p>
              <p
                className="leading-snug text-adisseo-ink"
                style={{ maxWidth: 200 }}
              >
                {truncate(r.article.title, titleMax)}
              </p>
            </td>
            {r.cells.map((c, i) => {
              const isTop = r.cols[i] === r.top;
              return (
                <td
                  key={i}
                  className={`px-1.5 py-2 text-center font-mono font-bold ${heatTint(c.score)} ${
                    isTop ? "outline outline-2 outline-adisseo-ink" : ""
                  }`}
                >
                  {c.score > 0 ? c.score : "·"}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-adisseo-line bg-stone-50">
          <td className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-adisseo-muted">
            Column total
          </td>
          {totals.map((t, i) => (
            <td
              key={i}
              className="px-1.5 py-2 text-center font-mono font-bold text-adisseo-ink-strong"
            >
              {t}
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}
