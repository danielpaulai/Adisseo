"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Hand,
  ShieldCheck,
  Target,
  Users,
  Copy,
  Printer,
  Newspaper,
} from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import type { ScrapedArticle } from "@/lib/scraper-api";
import type { StrategicFrame } from "@/lib/strategic-frame";
import type { SpeciesKey } from "@/lib/adiplan";
import { Logo, SpeciesIcon } from "@/components/Logo";

type ComposeResponse = {
  frame: StrategicFrame;
  meta: { usedModel: string };
};

const SPECIES_LABEL: Record<SpeciesKey, string> = {
  aqua: "Aqua (Aileen)",
  poultry: "Poultry (Vish)",
  ruminants: "Ruminants (Antoine)",
  swine: "Swine (Claire)",
};

const STUDIO_HREF: Record<SpeciesKey, string> = {
  aqua: "/studio/aqua",
  poultry: "/studio/poultry",
  ruminants: "/studio/ruminants",
  swine: "/studio/swine",
};

export default function StrategicFramePage() {
  const match = useAdiPlanStore((s) => s.match);
  const selectedArticleId = useAdiPlanStore((s) => s.selectedArticleId);

  const [article, setArticle] = useState<ScrapedArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ComposeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);

  // Pull the selected article so we can decorate the header.
  useEffect(() => {
    if (!selectedArticleId) return;
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data: { articles: ScrapedArticle[] }) => {
        const a = data.articles.find((x) => x.id === selectedArticleId);
        setArticle(a ?? null);
      })
      .catch(() => undefined);
  }, [selectedArticleId]);

  const compose = useCallback(async () => {
    if (!match || !article) {
      setError(
        "No matched article in state. Open the News Bridge, match an article, then come back."
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/compose-strategic-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: match.articleId,
          articleTitle: article.title,
          competitor: article.competitor,
          region: article.region,
          cbi: match.cbi,
          cbiId: match.cbiId,
          persona: match.persona,
          personaId: match.personaId,
          speciesFit: match.speciesFit,
        }),
      });
      if (!res.ok) throw new Error("Compose failed");
      const data = (await res.json()) as ComposeResponse;
      setResponse(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compose failed");
    } finally {
      setLoading(false);
    }
  }, [match, article]);

  // Auto-compose on first arrival when we already have a match.
  useEffect(() => {
    if (match && article && !response && !loading && !error) {
      compose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, article]);

  const copySummary = () => {
    if (!response) return;
    const f = response.frame;
    const text = [
      `STRATEGIC FRAME · ${f.competitor} · ${f.region}`,
      ``,
      `Article: ${f.articleTitle}`,
      `CBI: ${f.cbi}`,
      `Persona: ${f.persona}`,
      ``,
      `ONE-LINER`,
      f.oneLineSummary,
      ``,
      `ENTERPRISE PERSONA`,
      f.enterprisePersona,
      ``,
      `ENTERPRISE INSIGHT`,
      f.enterpriseInsight,
      ``,
      `PAIN — ${f.pain.headline}`,
      f.pain.body,
      ``,
      `PROMISE — ${f.promise.headline}`,
      f.promise.body,
      ``,
      `PROOF — ${f.proof.headline}`,
      f.proof.body,
      ...f.proof.evidence.map((e) => `· ${e}`),
      ``,
      `PROPOSITION — ${f.proposition.headline}`,
      f.proposition.body,
      `CTA: ${f.proposition.cta}`,
      ``,
      `ACTIVATIONS`,
      ...f.activations.map(
        (a) => `· ${SPECIES_LABEL[a.species]}: ${a.deliverable} — ${a.rationale}`
      ),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 1500);
  };

  return (
    <main className="min-h-screen bg-adisseo-bg print:bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4 print:hidden">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="h-6 w-px bg-adisseo-line" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              The Strategic Frame &middot; Total Value Solution
            </p>
            <h1 className="text-lg font-semibold text-adisseo-ink-strong">
              Compose the AdiPlan answer before the species deliverables ship
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-adisseo-muted">
          {response?.meta.usedModel && (
            <span className="rounded-full bg-slate-100 px-2 py-1">
              model: {response.meta.usedModel}
            </span>
          )}
          <Link
            href="/news-bridge"
            className="hover:text-adisseo-ink-strong"
          >
            &larr; News bridge
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8 print:max-w-full print:px-12 print:py-6">
        {/* === Source ribbon === */}
        {(article || match) && (
          <div className="mb-6 rounded-2xl border border-adisseo-crimson/30 bg-adisseo-crimson/5 p-4 print:border-adisseo-line">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              <Newspaper size={11} /> Source signal
            </p>
            {article && (
              <p className="mt-1 text-sm text-adisseo-ink-strong">
                <span className="font-semibold">{article.competitor}</span> ·{" "}
                {article.publishedAt} · {article.region} ·{" "}
                <span className="font-medium">{article.title}</span>
              </p>
            )}
            {match && (
              <p className="mt-1 text-xs text-adisseo-muted">
                CBI: <span className="font-medium text-adisseo-ink-strong">{match.cbi}</span>{" "}
                · Persona: <span className="font-medium text-adisseo-ink-strong">{match.persona}</span>
              </p>
            )}
          </div>
        )}

        {!match && !loading && (
          <div className="rounded-2xl border border-adisseo-line bg-white p-10 text-center text-adisseo-muted">
            <p className="mb-4 text-sm">
              No matched article in state. Open the News Bridge and match one
              first.
            </p>
            <Link
              href="/news-bridge"
              className="inline-flex items-center gap-2 rounded-md bg-adisseo-crimson px-4 py-2 text-sm font-semibold text-white"
            >
              Open News Bridge <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {(loading || (!response && match)) && !error && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-adisseo-muted">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Composing the strategic frame…</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {response && (
          <article className="space-y-6">
            {/* === One-liner === */}
            <div className="rounded-2xl border border-adisseo-line bg-gradient-to-br from-adisseo-crimson to-[#7d0822] p-6 text-white shadow-lg print:shadow-none">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest opacity-80">
                <Sparkles size={11} /> One-liner
              </p>
              <p className="mt-2 text-2xl font-bold leading-tight">
                {response.frame.oneLineSummary}
              </p>
            </div>

            {/* === Enterprise persona + insight === */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm print:shadow-none">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-cyan">
                  <Users size={11} /> Enterprise persona
                </p>
                <p className="mt-2 text-sm leading-relaxed text-adisseo-ink">
                  {response.frame.enterprisePersona}
                </p>
              </div>
              <div className="rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm print:shadow-none">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-orange">
                  <Sparkles size={11} /> Enterprise insight
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-adisseo-ink-strong">
                  {response.frame.enterpriseInsight}
                </p>
              </div>
            </div>

            {/* === TVS 4-card === */}
            <div className="rounded-2xl border border-adisseo-crimson/40 bg-white p-1.5 shadow-sm print:shadow-none">
              <div className="rounded-xl bg-adisseo-crimson/5 px-5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                  Total Value Solution · Pain × Promise × Proof × Proposition
                </p>
              </div>
              <div className="grid gap-px bg-adisseo-line p-px sm:grid-cols-2">
                <TvsCard
                  icon={<AlertTriangle size={14} />}
                  label="Pain"
                  accent="text-red-700"
                  headline={response.frame.pain.headline}
                  body={response.frame.pain.body}
                />
                <TvsCard
                  icon={<Hand size={14} />}
                  label="Promise"
                  accent="text-adisseo-cyan"
                  headline={response.frame.promise.headline}
                  body={response.frame.promise.body}
                />
                <TvsCard
                  icon={<ShieldCheck size={14} />}
                  label="Proof"
                  accent="text-emerald-700"
                  headline={response.frame.proof.headline}
                  body={response.frame.proof.body}
                  evidence={response.frame.proof.evidence}
                />
                <TvsCard
                  icon={<Target size={14} />}
                  label="Proposition"
                  accent="text-adisseo-orange"
                  headline={response.frame.proposition.headline}
                  body={response.frame.proposition.body}
                  cta={response.frame.proposition.cta}
                />
              </div>
            </div>

            {/* === Activations === */}
            <div className="rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm print:shadow-none">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                <Sparkles size={11} /> Activations · ship next
              </p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {response.frame.activations.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-adisseo-line bg-adisseo-bg p-3 text-xs"
                  >
                    <SpeciesIcon
                      species={a.species}
                      size={32}
                      className="mt-0.5 flex-none opacity-80"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-adisseo-ink-strong">
                        {SPECIES_LABEL[a.species]}
                      </p>
                      <p className="text-adisseo-ink">{a.deliverable}</p>
                      <p className="mt-1 text-[10px] text-adisseo-muted">
                        {a.rationale}
                      </p>
                      <Link
                        href={STUDIO_HREF[a.species]}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-adisseo-crimson hover:underline print:hidden"
                      >
                        Open Studio <ArrowRight size={11} />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* === Toolbar === */}
            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                onClick={compose}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson disabled:opacity-50"
              >
                <Sparkles size={12} /> Recompose
              </button>
              <button
                onClick={copySummary}
                className="flex items-center gap-2 rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson"
              >
                <Copy size={12} /> {copyOk ? "Copied" : "Copy as text"}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson"
              >
                <Printer size={12} /> Print / save as PDF
              </button>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}

function TvsCard({
  icon,
  label,
  accent,
  headline,
  body,
  evidence,
  cta,
}: {
  icon: React.ReactNode;
  label: string;
  accent: string;
  headline: string;
  body: string;
  evidence?: string[];
  cta?: string;
}) {
  return (
    <div className="bg-white p-5">
      <p
        className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest ${accent}`}
      >
        {icon} {label}
      </p>
      <p className="mt-2 text-base font-bold leading-snug text-adisseo-ink-strong">
        {headline}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-adisseo-ink">{body}</p>
      {evidence && evidence.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-adisseo-line pt-3 text-[11px] text-adisseo-ink">
          {evidence.map((e, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-adisseo-crimson">·</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      )}
      {cta && (
        <p className="mt-3 inline-block rounded-md bg-adisseo-orange/10 px-3 py-1.5 text-[11px] font-semibold text-adisseo-orange">
          → {cta}
        </p>
      )}
    </div>
  );
}
