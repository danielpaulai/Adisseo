import type { ScrapedArticle } from "@/lib/scraper-api";

const STOP = new Set(
  [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "as",
    "by",
    "with",
    "from",
    "into",
    "via",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "it",
    "its",
    "we",
    "you",
    "they",
    "their",
    "our",
    "not",
    "no",
    "all",
    "any",
    "some",
    "more",
    "most",
    "such",
    "than",
    "then",
    "also",
    "only",
    "just",
    "about",
    "after",
    "before",
    "between",
    "over",
    "under",
    "again",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "what",
    "which",
    "who",
    "whom",
    "per",
    "new",
    "said",
    "says",
    "feed",
    "feeds",
  ].map((w) => w.toLowerCase())
);

export type WordCloudEntry = { text: string; value: number };

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .split(/[^a-z0-9%/+.-]+/g)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

/**
 * Deterministic word frequencies for scraped headlines + summaries + tags.
 * Ricardo / Vish demo: timeline + competitor filters reuse the same corpus.
 */
export function buildWordCloudEntries(
  articles: ScrapedArticle[],
  maxWords = 48
): WordCloudEntry[] {
  const counts = new Map<string, number>();
  for (const a of articles) {
    const blob = [a.title, a.summary, ...a.tags].join(" ");
    for (const tok of tokenize(blob)) {
      counts.set(tok, (counts.get(tok) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([text, value]) => ({ text, value }))
    .sort((x, y) => y.value - x.value)
    .slice(0, maxWords);
}

/** Heuristic: scraper truncates at 600 chars; feeds also use ellipsis. */
export function looksLikeTruncatedExcerpt(summary: string): boolean {
  const s = summary.trim();
  if (s.length >= 598) return true;
  return /\u2026$|\.{3}$/i.test(s);
}
