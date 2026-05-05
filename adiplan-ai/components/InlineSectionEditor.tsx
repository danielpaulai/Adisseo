"use client";

/**
 * APAC plan — Phase 5
 *
 * Inline section editor that sits *before* every "Render PDF" / "Send for regional review"
 * button across all four species studios.
 *
 * Three modes Ricardo asked for:
 *   • Manual    — type-over edit (textarea, no AI)
 *   • AI rewrite — feed a prompt, Claude rewrites in brand voice
 *   • Translate  — flip language between EN / VI / TH / ID / ZH
 *
 * The editor is intentionally compact so it can drop next to a section
 * heading without restructuring the studio. It emits an `onChange(text)`
 * each time the user "applies" — the studio decides whether to render the
 * change live or stage it for the render step.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pencil,
  Sparkles,
  Languages,
  Check,
  RotateCcw,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";

export type EditorLang = "en" | "vi" | "th" | "id" | "zh";

const LANG_LABEL: Record<EditorLang, string> = {
  en: "English",
  vi: "Tiếng Việt",
  th: "ภาษาไทย",
  id: "Bahasa",
  zh: "中文",
};

export type EditorMode = "manual" | "rewrite" | "translate";

export interface InlineSectionEditorProps {
  /** Stable id for tracing — the API logs use this. */
  sectionId: string;
  /** Section heading (used in the prompt + the editor header). */
  sectionLabel: string;
  /** Current text in the studio. */
  value: string;
  /** Original text — used for the "reset" affordance. */
  original?: string;
  /** Default working language. */
  language?: EditorLang;
  /** Optional brand-voice profile id — passed through to the API. */
  voiceProfileId?: string;
  /** Optional tenant id for the trace. */
  tenantId?: string;
  /** Called with the new text when the user clicks "Apply". */
  onChange: (next: string, meta: { mode: EditorMode; language: EditorLang }) => void;
  /** Compact = single-line trigger; default = inline panel. */
  compact?: boolean;
}

export function InlineSectionEditor({
  sectionId,
  sectionLabel,
  value,
  original,
  language = "en",
  voiceProfileId,
  tenantId,
  onChange,
  compact = false,
}: InlineSectionEditorProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<EditorMode>("manual");
  const [draft, setDraft] = useState(value);
  const [lang, setLang] = useState<EditorLang>(language);
  const [prompt, setPrompt] = useState("Tighten this and lean into the regional buyer's pain.");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const isDirty = draft.trim() !== value.trim();
  const canReset = original !== undefined && original !== value;

  const counts = useMemo(() => {
    const chars = draft.length;
    const words = draft.trim().split(/\s+/).filter(Boolean).length;
    return { chars, words };
  }, [draft]);

  const callApi = async (kind: "rewrite" | "translate") => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/section-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          sectionLabel,
          text: draft,
          mode: kind,
          language: lang,
          prompt: kind === "rewrite" ? prompt : undefined,
          voiceProfileId,
          tenantId,
        }),
      });
      if (!r.ok) {
        throw new Error(`API ${r.status}`);
      }
      const json = (await r.json()) as { text: string; trace?: { id: string } };
      setDraft(json.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rewrite failed");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => draftRef.current?.focus());
    }
  };

  const apply = () => {
    if (!isDirty) {
      setOpen(false);
      return;
    }
    onChange(draft.trim(), { mode, language: lang });
    setOpen(false);
  };

  const resetToOriginal = () => {
    if (!original) return;
    setDraft(original);
  };

  // Trigger button (collapsed)
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-md border border-adisseo-line bg-white px-2.5 py-1 text-[10px] font-semibold text-adisseo-muted hover:border-adisseo-ink/30 hover:text-adisseo-ink ${
          compact ? "" : ""
        }`}
        title="Edit section, AI-rewrite, or translate"
      >
        <Pencil size={11} />
        {compact ? "Edit" : "Edit / Rewrite / Translate"}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-adisseo-ink-strong/30 bg-white p-3 shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-adisseo-muted">
            Inline editor · {sectionLabel}
          </p>
          <p className="text-[10px] text-adisseo-muted">
            Stage edits before render-PDF — nothing dispatches yet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-adisseo-line p-1 text-adisseo-muted hover:bg-adisseo-line/40"
          title="Close editor"
        >
          <X size={12} />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="mt-3 flex gap-1.5">
        <ModeTab
          icon={<Pencil size={11} />}
          label="Manual"
          active={mode === "manual"}
          onClick={() => setMode("manual")}
        />
        <ModeTab
          icon={<Sparkles size={11} />}
          label="AI rewrite"
          active={mode === "rewrite"}
          onClick={() => setMode("rewrite")}
        />
        <ModeTab
          icon={<Languages size={11} />}
          label="Translate"
          active={mode === "translate"}
          onClick={() => setMode("translate")}
        />
      </div>

      {/* Mode-specific controls */}
      {mode === "rewrite" && (
        <div className="mt-2 rounded-md border border-adisseo-line bg-adisseo-warmth/40 p-2">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-adisseo-muted">
            Rewrite prompt
          </p>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Tighten the hook for a Vietnamese feed-mill buyer"
            className="mt-1 w-full rounded-md border border-adisseo-line bg-white px-2 py-1 text-xs outline-none focus:border-adisseo-crimson"
          />
          <button
            type="button"
            onClick={() => callApi("rewrite")}
            disabled={busy || draft.trim().length === 0}
            className="mt-2 flex items-center gap-1.5 rounded-md bg-adisseo-crimson px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90 disabled:opacity-40"
          >
            {busy ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
            Run rewrite
          </button>
        </div>
      )}

      {mode === "translate" && (
        <div className="mt-2 rounded-md border border-adisseo-line bg-adisseo-warmth/40 p-2">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-adisseo-muted">
            Target language
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {(Object.keys(LANG_LABEL) as EditorLang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  lang === l
                    ? "bg-adisseo-ink-strong text-white"
                    : "border border-adisseo-line bg-white text-adisseo-muted hover:text-adisseo-ink"
                }`}
              >
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => callApi("translate")}
            disabled={busy || draft.trim().length === 0}
            className="mt-2 flex items-center gap-1.5 rounded-md bg-adisseo-ink-strong px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90 disabled:opacity-40"
          >
            {busy ? <Loader2 size={11} className="animate-spin" /> : <Languages size={11} />}
            Translate to {LANG_LABEL[lang]}
          </button>
        </div>
      )}

      {/* The textarea */}
      <textarea
        ref={draftRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={Math.min(10, Math.max(3, Math.ceil(draft.length / 80)))}
        className="mt-2 w-full resize-y rounded-md border border-adisseo-line bg-white px-3 py-2 text-xs leading-relaxed outline-none focus:border-adisseo-crimson"
      />

      {error && (
        <p className="mt-1 flex items-start gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] text-amber-800">
          <AlertTriangle size={11} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-adisseo-muted">
        <span>
          {counts.words} words · {counts.chars} chars
          {isDirty && <span className="ml-2 font-bold text-adisseo-crimson">· edited</span>}
        </span>
        <div className="flex items-center gap-1.5">
          {canReset && (
            <button
              type="button"
              onClick={resetToOriginal}
              className="flex items-center gap-1 rounded-md border border-adisseo-line px-2 py-1 text-[10px] text-adisseo-muted hover:text-adisseo-ink"
              title="Reset to original"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={apply}
            disabled={busy}
            className="flex items-center gap-1 rounded-md bg-adisseo-crimson px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90 disabled:opacity-40"
          >
            <Check size={11} />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
        active
          ? "bg-adisseo-ink-strong text-white"
          : "border border-adisseo-line bg-white text-adisseo-muted hover:text-adisseo-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
