import type { ScrapedArticle } from "@/lib/scraper-api";
import type { ThreeAxisScore } from "@/lib/news-scorer";

export const ARTICLE_ANALYSIS_PACK_SCHEMA = "adiplan.article-analysis-pack.v1" as const;

export function buildArticleAnalysisPack(
  article: ScrapedArticle,
  framework?: ThreeAxisScore
) {
  return {
    schema: ARTICLE_ANALYSIS_PACK_SCHEMA,
    exportedAt: new Date().toISOString(),
    intent:
      "Trend and positioning analysis: compare with Adisseo internal KPIs, CSFs, CBIs, corporate personas, and WWWK; pair with Copilot over Adisseo knowledge.",
    article: {
      id: article.id,
      competitor: article.competitor,
      title: article.title,
      summary: article.summary,
      url: article.url,
      publishedAt: article.publishedAt,
      region: article.region,
      language: article.language,
      species: article.species,
      tags: article.tags,
    },
    deterministicFrameworkScores: framework
      ? {
          composite: framework.composite,
          adisseoStrengthProxy: framework.adisseoStrength,
          topCbi: {
            id: framework.cbi.id,
            score: framework.cbi.score,
            evidence: framework.cbi.evidence,
          },
          topCsf: {
            id: framework.csf.id,
            score: framework.csf.score,
            evidence: framework.csf.evidence,
          },
          topPersona: {
            id: framework.persona.id,
            score: framework.persona.score,
            evidence: framework.persona.evidence,
          },
          rationale: framework.rationale,
        }
      : undefined,
  };
}

export function downloadArticleAnalysisPack(
  article: ScrapedArticle,
  framework?: ThreeAxisScore
): void {
  const json = JSON.stringify(buildArticleAnalysisPack(article, framework), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const safe = article.id.replace(/[^a-zA-Z0-9-_]+/g, "-");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `article-${safe}-analysis-pack.json`;
  a.click();
  URL.revokeObjectURL(url);
}
