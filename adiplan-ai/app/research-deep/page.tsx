"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Library,
  Loader2,
  Search,
  Sparkles,
  Telescope,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { vaultRegions, type VaultSpecies } from "@/lib/vault";
import type { DeepResearchResponse } from "@/app/api/research-deep/route";
import { ProseQualityCard } from "@/components/ProseQualityCard";

const SAMPLE_QUESTIONS = [
  "What is the FCR impact of replacing AGP with our eubiotic in Indonesian broiler trials?",
  "What's the right frame for the Cargill ASF webinar in Malaysia post-Q4 2025?",
  "How should we anchor a Hokkaido dairy heat-stress brochure for the J-credit framework?",
  "What does the Vault say about pangasius lecithin trials in Vietnam?",
];

export default function ResearchDeepPage() {
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
  const [species, setSpecies] = useState<VaultSpecies | "all">("all");
  const [region, setRegion] = useState<string | "all">("all");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<DeepResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const regions = useMemo(() => vaultRegions(), []);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research-deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, species, region }),
      });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      setResponse((await res.json()) as DeepResearchResponse);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  // Auto-run on mount
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="flex items-center gap-1 text-adisseo-muted hover:text-adisseo-crimson">
              <ArrowLeft size={11} /> Home
            </Link>
            <Link href="/vault" className="text-adisseo-muted hover:text-adisseo-crimson">
              Vault
            </Link>
            <Link href="/trust-layer" className="text-adisseo-muted hover:text-adisseo-crimson">
              Trust layer
            </Link>
            <Link href="/digest" className="text-adisseo-muted hover:text-adisseo-crimson">
              Daily digest
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <Telescope size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Research depth
            </p>
            <h1 className="font-display text-2xl font-semibold text-adisseo-ink-strong sm:text-3xl">
              Research-to-anchor agent
            </h1>
            <p className="text-sm text-adisseo-muted">
              Decomposes a question into 6 sub-queries (numbers, regulation,
              competitor, integrator-voice, mechanism, timing), runs each
              against the Vault, and composes a footnoted briefing. Studios
              call this before drafting.
            </p>
          </div>
        </div>

        {/* QUERY BAR */}
        <section className="adi-surface mb-6 p-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-adisseo-muted">
            <span>Sample:</span>
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="rounded-md border border-adisseo-line bg-white px-2 py-1 normal-case tracking-normal text-adisseo-ink-strong hover:border-adisseo-crimson"
              >
                {q.slice(0, 32)}…
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Search size={14} className="text-adisseo-muted" />
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question Adisseo would actually need answered…"
              className="flex-1 min-w-[280px] rounded-md border border-adisseo-line bg-white px-3 py-2 text-sm text-adisseo-ink-strong placeholder:text-adisseo-muted focus:border-adisseo-crimson focus:outline-none"
            />
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value as VaultSpecies | "all")}
              className="rounded-md border border-adisseo-line bg-white px-2 py-2 text-xs font-semibold text-adisseo-ink-strong"
            >
              <option value="all">All species</option>
              <option value="aqua">Aqua</option>
              <option value="poultry">Poultry</option>
              <option value="ruminants">Ruminants</option>
              <option value="swine">Swine</option>
              <option value="cross">Cross</option>
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-md border border-adisseo-line bg-white px-2 py-2 text-xs font-semibold text-adisseo-ink-strong"
            >
              <option value="all">All regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              onClick={run}
              disabled={loading || !question.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-adisseo-crimson px-3 py-2 text-xs font-semibold text-white shadow-adi-card transition hover:bg-adisseo-crimson/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Research
            </button>
          </div>
        </section>

        {error && (
          <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {error}
          </p>
        )}

        {response && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* BRIEFING */}
            <div className="lg:col-span-2">
              <div className="adi-surface p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                    Composed briefing
                  </p>
                  <p className="text-[10px] text-adisseo-muted">
                    {response.meta.sourceCount} citations · confidence{" "}
                    <strong className="text-adisseo-ink-strong">
                      {Math.round(response.confidence * 100)}%
                    </strong>{" "}
                    · {response.meta.usedModel}
                  </p>
                </div>
                <div className="space-y-3 whitespace-pre-wrap text-sm leading-relaxed text-adisseo-ink-strong">
                  {response.briefing.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{renderFootnotes(para)}</p>
                  ))}
                </div>

                {/* Citations footer */}
                <div className="mt-6 border-t border-adisseo-line pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                    References
                  </p>
                  <ol className="mt-3 space-y-2 text-[11px]">
                    {response.citations.map((c) => (
                      <li
                        key={c.entryId}
                        className="rounded-md border border-adisseo-line bg-adisseo-bg/40 p-3"
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-mono font-bold text-adisseo-crimson">
                            [^{c.index}]
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-adisseo-ink-strong">
                              {c.formatted}
                            </p>
                            <p className="mt-1 text-[10px] text-adisseo-muted">
                              {c.kind} · {c.region} · {c.date}{" "}
                              {c.verified && (
                                <span className="ml-1 inline-flex items-center gap-0.5 text-emerald-700">
                                  <CheckCircle2 size={9} /> verified
                                </span>
                              )}
                            </p>
                            <p className="mt-1 break-all font-mono text-[10px] text-adisseo-cyan">
                              {c.source.startsWith("http") ? (
                                <a href={c.source} target="_blank" rel="noreferrer" className="hover:underline">
                                  {c.source} <ExternalLink size={9} className="inline" />
                                </a>
                              ) : (
                                c.source
                              )}
                            </p>
                          </div>
                          <Link
                            href={`/vault?id=${c.entryId}`}
                            className="text-[10px] font-semibold text-adisseo-cyan hover:underline"
                          >
                            Open →
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Trust layer scoring of the composed briefing */}
              <div className="mt-4">
                <ProseQualityCard text={response.briefing} language="en" />
              </div>
            </div>

            {/* SUBQUERIES */}
            <aside className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                Sub-query trace
              </p>
              {response.subqueries.map((sq) => (
                <div
                  key={sq.id}
                  className="rounded-xl border border-adisseo-line/90 bg-white p-3 shadow-adi-card"
                >
                  <div className="flex items-baseline justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-ink-strong">
                      {sq.label}
                    </p>
                    <p className="text-[10px] text-adisseo-muted">
                      {sq.hits.length} hits
                    </p>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-adisseo-muted">
                    "{sq.query}"
                  </p>
                  <ul className="mt-2 space-y-1">
                    {sq.hits.length === 0 ? (
                      <li className="text-[10px] italic text-adisseo-muted">
                        no matching Vault entries — gap
                      </li>
                    ) : (
                      sq.hits.map((h) => (
                        <li key={h.entry.id} className="flex items-start gap-1.5">
                          <Library size={10} className="mt-0.5 text-adisseo-crimson" />
                          <Link
                            href={`/vault?id=${h.entry.id}`}
                            className="line-clamp-1 text-[11px] text-adisseo-ink-strong hover:text-adisseo-crimson"
                          >
                            {h.entry.title}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ))}

              <div className="rounded-xl border border-adisseo-line bg-adisseo-bg/40 p-3 text-[10px]">
                <p className="font-semibold uppercase tracking-widest text-adisseo-crimson">
                  Hand-off
                </p>
                <ul className="mt-2 space-y-1.5 text-adisseo-ink">
                  <li>
                    <Link href="/strategic-frame" className="inline-flex items-center gap-1 hover:text-adisseo-crimson">
                      Compose a strategic frame from this briefing <ArrowRight size={10} />
                    </Link>
                  </li>
                  <li>
                    <Link href="/competitor-watch" className="inline-flex items-center gap-1 hover:text-adisseo-crimson">
                      Analyze today&apos;s competitor news <ArrowRight size={10} />
                    </Link>
                  </li>
                  <li>
                    <Link href="/wwwk" className="inline-flex items-center gap-1 hover:text-adisseo-crimson">
                      Open WWWK questions for the gaps <ArrowRight size={10} />
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

/**
 * Render `[^N]` markers in the briefing as superscript references.
 */
function renderFootnotes(text: string): React.ReactNode {
  const parts = text.split(/(\[\^\d+\])/g);
  return parts.map((p, i) => {
    const m = p.match(/^\[\^(\d+)\]$/);
    if (m) {
      return (
        <sup
          key={i}
          className="ml-0.5 inline-block rounded-sm bg-adisseo-crimson/10 px-1 font-mono text-[10px] font-bold text-adisseo-crimson"
        >
          {m[1]}
        </sup>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
