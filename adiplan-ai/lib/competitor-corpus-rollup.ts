import { adiplanCBIs } from "@/lib/adiplan";
import { matrixCSFs, matrixPersonas } from "@/lib/personas-matrix";
import type { ScrapedArticle } from "@/lib/scraper-api";
import { scoreArticle, type LlmHints } from "@/lib/news-scorer";

export type AxisRollupRow = { id: string; label: string; count: number };

function speciesHint(a: ScrapedArticle): string | undefined {
  const s = a.species.find((x) => x !== "cross");
  return s;
}

/**
 * Counts top-1 CBI / CSF / persona per article in the filtered corpus (deterministic scores).
 */
export function rollupCompetitorCorpus(
  articles: ScrapedArticle[],
  llmHintsById: Record<string, LlmHints>
): {
  cbi: AxisRollupRow[];
  csf: AxisRollupRow[];
  persona: AxisRollupRow[];
} {
  const cbiN = new Map<string, number>();
  const csfN = new Map<string, number>();
  const perN = new Map<string, number>();

  for (const a of articles) {
    const s = scoreArticle(a, llmHintsById[a.id], {
      species: speciesHint(a),
    });
    cbiN.set(s.cbi.id, (cbiN.get(s.cbi.id) ?? 0) + 1);
    csfN.set(s.csf.id, (csfN.get(s.csf.id) ?? 0) + 1);
    perN.set(s.persona.id, (perN.get(s.persona.id) ?? 0) + 1);
  }

  const cbiLabel = (id: string) =>
    adiplanCBIs.find((c) => c.id === id)?.label ?? id;
  const csfLabel = (id: string) =>
    matrixCSFs.find((c) => c.id === id)?.shortLabel ?? id;
  const personaLabel = (id: string) =>
    matrixPersonas.find((p) => p.id === id)?.label ?? id;

  const sortRows = (map: Map<string, number>, labelFn: (id: string) => string) =>
    [...map.entries()]
      .map(([id, count]) => ({ id, label: labelFn(id), count }))
      .sort((x, y) => y.count - x.count);

  return {
    cbi: sortRows(cbiN, cbiLabel),
    csf: sortRows(csfN, csfLabel),
    persona: sortRows(perN, personaLabel),
  };
}
