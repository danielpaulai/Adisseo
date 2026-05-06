"use client";

import type { WordCloudEntry } from "@/lib/article-analytics";

const PALETTE = [
  "#9C2A2A",
  "#0F4C81",
  "#0E7C46",
  "#B87333",
  "#4A4A68",
  "#C41E3A",
];

type Props = {
  words: WordCloudEntry[];
  className?: string;
};

/**
 * Lightweight word cloud (no canvas deps) — sizes scale with relative frequency.
 */
export function ArticleWordCloud({ words, className = "" }: Props) {
  if (words.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-adisseo-line bg-slate-50/80 px-4 py-6 text-center text-sm text-adisseo-muted">
        No terms yet — widen filters or refresh the feed.
      </p>
    );
  }

  const max = words[0]?.value ?? 1;
  const min = words[words.length - 1]?.value ?? 0;
  const span = Math.max(1, max - min);

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-adisseo-line bg-white px-4 py-4 ${className}`}
      aria-label="Word frequency from filtered articles"
    >
      {words.map((w, i) => {
        const t = (w.value - min) / span;
        const fontSize = 11 + Math.round(t * 15);
        const color = PALETTE[i % PALETTE.length];
        return (
          <span
            key={`${w.text}-${i}`}
            className="inline-block leading-tight transition hover:opacity-80"
            style={{
              fontSize,
              color,
              fontWeight: t > 0.65 ? 700 : 500,
              animation: `wordCloudPop 360ms ease ${Math.min(i * 26, 520)}ms both`,
            }}
            title={`${w.text}: ${w.value} mentions`}
          >
            {w.text}
          </span>
        );
      })}
      <style jsx>{`
        @keyframes wordCloudPop {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
