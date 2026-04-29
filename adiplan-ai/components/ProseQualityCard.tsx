"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Languages,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ProseQualityResponse } from "@/app/api/score-prose/route";
import type { BrandVoiceId } from "@/lib/brand-voice";
import type { LtLanguage } from "@/lib/languagetool";
import {
  scoreSlop,
  scoreBand,
  SLOP_BAND_TONE,
  type SlopReport,
} from "@/lib/slop-detector";
import { scoreBrandVoice } from "@/lib/brand-voice";

interface Props {
  /** All the prose to score (concat all the text fields the studio produced). */
  text: string;
  brandVoice?: BrandVoiceId;
  language?: LtLanguage;
  /** Called whenever the gate flips so studios can disable Send-to-HQ. */
  onGateChange?: (passes: boolean, composite: number) => void;
  /** Compact mode for tight aside columns. */
  compact?: boolean;
}

/**
 * ProseQualityCard
 *
 * Live quality scorecard composed of:
 *   - Slop-detector score (instant, client-side, runs on every text change)
 *   - Brand-voice compliance (instant, client-side)
 *   - LanguageTool grammar pass (server, debounced 1.2s)
 *
 * The card always shows the slop + brand verdict instantly. The grammar
 * row updates when LT comes back. The composite gate is computed locally
 * so we don't wait on the server to disable the Send-to-HQ button.
 */
export function ProseQualityCard({
  text,
  brandVoice = "adisseo",
  language = "en",
  onGateChange,
  compact = false,
}: Props) {
  const [server, setServer] = useState<ProseQualityResponse | null>(null);
  const [serverLoading, setServerLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Instant client-side passes
  const slop: SlopReport = useMemo(() => scoreSlop(text), [text]);
  const brand = useMemo(() => scoreBrandVoice(text, brandVoice), [text, brandVoice]);

  // Composite when grammar isn't ready yet — weights renormalised to slop+brand.
  const compositeLocal = Math.round(slop.score * (5 / 8) + brand.compliance * 100 * (3 / 8));
  const composite = server?.composite ?? compositeLocal;
  const passesGate = server?.passesGate ?? (!brand.hasClaimBreach && compositeLocal >= 60);
  const summary = server?.summary ?? localSummary(compositeLocal, brand.hasClaimBreach);

  // Debounced server call for grammar
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().split(/\s+/).length < 8) {
      setServer(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setServerLoading(true);
      try {
        const res = await fetch("/api/score-prose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, brandVoice, language }),
        });
        if (res.ok) setServer((await res.json()) as ProseQualityResponse);
      } finally {
        setServerLoading(false);
      }
    }, 1_200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, brandVoice, language]);

  useEffect(() => {
    onGateChange?.(passesGate, composite);
  }, [passesGate, composite, onGateChange]);

  const band = scoreBand(composite);
  const tone = SLOP_BAND_TONE[band];

  const violations = [
    ...slop.violations.slice(0, 4).map((v) => ({
      kind: "slop" as const,
      label: v.ruleName,
      detail: `“${v.match}”`,
      advice: v.advice,
      severity: v.severity,
    })),
    ...brand.violations.slice(0, 4).map((v) => ({
      kind: "brand" as const,
      label: v.ruleName,
      detail: `“${v.match}”`,
      advice: v.fix,
      severity: v.severity,
    })),
    ...(server?.grammar.issues ?? []).slice(0, 3).map((g) => ({
      kind: "grammar" as const,
      label: g.shortMessage || g.category,
      detail: g.message,
      advice: g.replacements.length ? `Try: ${g.replacements.slice(0, 2).join(", ")}` : "Manual fix.",
      severity: g.severity,
    })),
  ];
  const visible = showAll ? violations : violations.slice(0, 3);

  return (
    <div
      className={`rounded-2xl border ${tone.border} ${tone.bg} p-4 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ${tone.text}`}
        >
          {brand.hasClaimBreach ? (
            <ShieldAlert size={16} />
          ) : passesGate ? (
            <ShieldCheck size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[10px] font-semibold uppercase tracking-widest ${tone.text}`}
          >
            Trust layer · Prose quality · {band}
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${tone.text}`}>{composite}</span>
            <span className={`text-xs font-semibold uppercase tracking-widest ${tone.text}`}>
              / 100
            </span>
            {serverLoading && (
              <Loader2 size={12} className={`animate-spin ${tone.text} opacity-60`} />
            )}
          </div>
          <p className={`mt-1 ${tone.text} opacity-90`}>{summary}</p>
        </div>
      </div>

      {/* Sub-scores strip */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <SubScore
          icon={<Sparkles size={12} />}
          label="Slop"
          score={slop.score}
          band={slop.band}
        />
        <SubScore
          icon={<ShieldCheck size={12} />}
          label="Brand"
          score={Math.round(brand.compliance * 100)}
          band={
            brand.compliance >= 0.95
              ? "Clean"
              : brand.compliance >= 0.8
                ? "Light"
                : brand.compliance >= 0.6
                  ? "Moderate"
                  : "Heavy"
          }
        />
        <SubScore
          icon={<Languages size={12} />}
          label="Grammar"
          score={Math.round((server?.grammar.compliance ?? 1) * 100)}
          band={
            !server || (server.grammar.compliance ?? 1) >= 0.95
              ? "Clean"
              : server.grammar.compliance >= 0.8
                ? "Light"
                : server.grammar.compliance >= 0.6
                  ? "Moderate"
                  : "Heavy"
          }
        />
      </div>

      {/* Violation list */}
      {violations.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
            Top fixes ({violations.length})
          </p>
          {visible.map((v, i) => (
            <div
              key={i}
              className="rounded-md border border-white/60 bg-white/70 p-2"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 inline-block h-1.5 w-1.5 rounded-full ${
                    v.severity === "high"
                      ? "bg-rose-500"
                      : v.severity === "medium"
                        ? "bg-amber-500"
                        : "bg-stone-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-adisseo-ink-strong">
                    <span className="mr-1.5 inline-block rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-stone-600">
                      {v.kind}
                    </span>
                    {v.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-adisseo-ink">
                    {v.detail}
                  </p>
                  <p className="mt-1 text-[10px] italic text-adisseo-muted">
                    {v.advice}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {violations.length > visible.length && (
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted hover:text-adisseo-crimson"
            >
              <ChevronDown size={10} /> Show {violations.length - visible.length} more
            </button>
          )}
          {showAll && violations.length > 3 && (
            <button
              onClick={() => setShowAll(false)}
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted hover:text-adisseo-crimson"
            >
              <ChevronUp size={10} /> Collapse
            </button>
          )}
        </div>
      )}

      {/* Gate verdict */}
      <div className="mt-3 flex items-center gap-2 border-t border-white/60 pt-2">
        {passesGate ? (
          <CheckCircle2 size={14} className="text-emerald-600" />
        ) : (
          <AlertTriangle size={14} className="text-rose-600" />
        )}
        <p
          className={`text-[10px] font-semibold uppercase tracking-widest ${
            passesGate ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {passesGate
            ? "Cleared brand-guardrail gate — ready to send to HQ"
            : "Below brand-guardrail gate — fix highest-weight rows first"}
        </p>
      </div>
    </div>
  );
}

function SubScore({
  icon,
  label,
  score,
  band,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  band: keyof typeof SLOP_BAND_TONE;
}) {
  const tone = SLOP_BAND_TONE[band];
  return (
    <div className="rounded-md border border-white/60 bg-white/80 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
        {icon} {label}
      </div>
      <p className={`text-base font-bold ${tone.text}`}>{score}</p>
    </div>
  );
}

function localSummary(score: number, claimBreach: boolean): string {
  if (claimBreach) return "Regulatory claim-language breach — hard fail.";
  if (score < 40) return `${score}/100 — saturated; rewrite from scratch.`;
  if (score < 60) return `${score}/100 — below brand floor; iterate.`;
  if (score < 75) return `${score}/100 — passes the gate but expect HQ comments.`;
  return `${score}/100 — brand-clean. Ship it.`;
}
