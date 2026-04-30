"use client";

/**
 * APAC plan — Phase 4
 *
 * Ricardo on the call: "Show the global team the four layers, simply."
 *
 *   Input  →  LLM + Knowledge base  →  Branch picker  →  Customised output
 *
 * This is *not* a new engine — every box maps to something already running.
 * The component is a single horizontal strip that:
 *   • highlights the active layer with a subtle pulse,
 *   • shows the running label in each layer (e.g. the article title in
 *     Input, the persona in Branch, the deliverable kind in Output),
 *   • explains what's happening on hover so a non-technical viewer can
 *     follow.
 *
 * Drop it into /news-bridge (after the user matches an article) and into
 * /strategic-frame (after they compose a frame) — both pages already
 * carry all the context this component renders.
 */

import { ReactNode } from "react";
import {
  Newspaper,
  Brain,
  GitBranch,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export type DecisionLayer = "input" | "synthesis" | "branch" | "output";

export interface DecisionMatrixFlowProps {
  /** Human-readable description of the input (e.g. article title). */
  inputLabel: string;
  inputSub?: string;
  /** What knowledge bases are in play (e.g. "APAC vault · 92 entries · 18 verified"). */
  synthesisLabel: string;
  synthesisSub?: string;
  /** The branch picked — persona / format combo. */
  branchLabel: string;
  branchSub?: string;
  /** Final customised output. */
  outputLabel: string;
  outputSub?: string;
  /** Highest reached layer (everything before it gets the "done" check). */
  active?: DecisionLayer;
  /** Show a compact variant — hides the body text. */
  compact?: boolean;
}

const ORDER: DecisionLayer[] = ["input", "synthesis", "branch", "output"];

const TINTS: Record<DecisionLayer, { bg: string; ink: string; soft: string }> = {
  input: { bg: "#0E1014", ink: "#FFFFFF", soft: "#3A3D45" },
  synthesis: { bg: "#0F4C81", ink: "#FFFFFF", soft: "#2D6FA8" },
  branch: { bg: "#9C2A2A", ink: "#FFFFFF", soft: "#C4262E" },
  output: { bg: "#1B7D52", ink: "#FFFFFF", soft: "#2EA679" },
};

const ICONS: Record<DecisionLayer, ReactNode> = {
  input: <Newspaper size={14} />,
  synthesis: <Brain size={14} />,
  branch: <GitBranch size={14} />,
  output: <Layers size={14} />,
};

const HEADERS: Record<DecisionLayer, { kicker: string; title: string; explainer: string }> = {
  input: {
    kicker: "01 · Input",
    title: "Signal in",
    explainer:
      "A scraped competitor article OR a manual decision from the team. Source attribution is preserved end-to-end.",
  },
  synthesis: {
    kicker: "02 · Synthesis",
    title: "LLM + Knowledge base",
    explainer:
      "Claude reads the input against the APAC vault (CBI ladders, brand voice, regional context, Adisseo product docs). Citations are anchored, not hallucinated.",
  },
  branch: {
    kicker: "03 · Branch picker",
    title: "Persona × Format",
    explainer:
      "The dominant persona drives the deliverable kind: Risk Reducer → carousel, Knowledge Builder → manga, Efficiency Optimizer → leaflet. Saved stakeholder maps fan one input into N branches.",
  },
  output: {
    kicker: "04 · Output",
    title: "Customised deliverable",
    explainer:
      "Style, voice, language, and persona are tuned per branch. Inline editor (Phase 5) lets you tweak before render. Trust layer gates ship.",
  },
};

export function DecisionMatrixFlow(props: DecisionMatrixFlowProps) {
  const { active = "output", compact = false } = props;
  const activeIdx = ORDER.indexOf(active);

  const items: Record<
    DecisionLayer,
    { label: string; sub?: string }
  > = {
    input: { label: props.inputLabel, sub: props.inputSub },
    synthesis: { label: props.synthesisLabel, sub: props.synthesisSub },
    branch: { label: props.branchLabel, sub: props.branchSub },
    output: { label: props.outputLabel, sub: props.outputSub },
  };

  return (
    <section
      className="rounded-2xl border border-adisseo-line bg-white p-4 shadow-sm"
      aria-label="Decision matrix flow"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
          Decision matrix · 4 layers
        </p>
        <p className="text-[10px] text-adisseo-muted">
          Hover any box to see what runs there
        </p>
      </div>

      <div className="grid items-stretch gap-1.5 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
        {ORDER.map((layer, i) => {
          const isActive = i === activeIdx;
          const isDone = i < activeIdx;
          const tint = TINTS[layer];
          const meta = HEADERS[layer];
          const data = items[layer];
          return (
            <div key={layer} className="contents">
              <div
                className={`group relative overflow-hidden rounded-xl border ${
                  isActive
                    ? "border-adisseo-ink-strong shadow-md"
                    : "border-adisseo-line"
                }`}
                style={{
                  backgroundColor: isDone || isActive ? tint.bg : "#FBFAF6",
                  color: isDone || isActive ? tint.ink : "#0E1014",
                }}
              >
                <div className="flex items-center justify-between px-3 pt-2.5">
                  <span
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest"
                    style={{
                      color: isDone || isActive ? tint.ink : "#3A3D45",
                      opacity: 0.85,
                    }}
                  >
                    {ICONS[layer]}
                    {meta.kicker}
                  </span>
                  {isDone && <CheckCircle2 size={12} style={{ opacity: 0.7 }} />}
                  {isActive && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[8px] font-bold"
                      style={{ backgroundColor: tint.soft, color: tint.ink }}
                    >
                      live
                    </span>
                  )}
                </div>
                <div className="px-3 pb-3 pt-1.5">
                  <p
                    className="text-xs font-bold leading-tight"
                    style={{ color: isDone || isActive ? tint.ink : "#0E1014" }}
                  >
                    {meta.title}
                  </p>
                  {!compact && (
                    <p
                      className="mt-1.5 line-clamp-2 text-[10.5px] font-semibold leading-snug"
                      style={{
                        color: isDone || isActive ? tint.ink : "#0E1014",
                        opacity: isDone || isActive ? 0.95 : 1,
                      }}
                      title={data.label}
                    >
                      {data.label}
                    </p>
                  )}
                  {!compact && data.sub && (
                    <p
                      className="mt-1 line-clamp-2 text-[9.5px] leading-snug"
                      style={{
                        color: isDone || isActive ? tint.ink : "#3A3D45",
                        opacity: isDone || isActive ? 0.75 : 0.9,
                      }}
                    >
                      {data.sub}
                    </p>
                  )}
                </div>
                {/* hover explainer */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-adisseo-ink-strong/95 p-2 text-[10px] leading-snug text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"
                  aria-hidden
                >
                  {meta.explainer}
                </div>
              </div>

              {i < ORDER.length - 1 && (
                <div className="hidden items-center justify-center text-adisseo-muted md:flex">
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
