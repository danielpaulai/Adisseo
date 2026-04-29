"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus, Trash2, Wand2 } from "lucide-react";
import { useAdiPlanStore, type LadderRung } from "@/lib/store";
import {
  seededStakeholders,
  personaColors,
  type Stakeholder,
} from "@/lib/stakeholders";
import { Logo } from "@/components/Logo";

function generateSeedLadder(s: Stakeholder): { rungs: LadderRung[]; topValue: string } {
  const baseByPersona: Record<string, { rungs: string[]; witis: string[]; topValue: string }> = {
    "Efficiency Optimizer": {
      rungs: [
        "Help me defend feed margin against raw-material volatility",
        "Help me hit FCR targets without raising CP inclusion",
        "Help me prove $/animal savings to my board",
      ],
      witis: [
        "Margin loss this quarter would force a price hike we can't afford",
        "Lower CP = lower carbon footprint, which our buyers now audit",
        "Quantified savings = budget renewal + my year-end bonus",
      ],
      topValue: "Operational confidence + career-defining wins",
    },
    "System Simplifier": {
      rungs: [
        "Help me reduce the number of supplements in our standard ration",
        "Help me train mill staff once, not retrain every quarter",
        "Help me cut SKU count on the procurement side",
      ],
      witis: [
        "Each new SKU adds error risk and storage cost",
        "Staff turnover is high; complexity = mistakes",
        "Procurement time saved is time I spend on growth",
      ],
      topValue: "Calm, predictable operations",
    },
    "Risk Reducer": {
      rungs: [
        "Help me recover faster from the next ASF/PRRS/AI event",
        "Help me show regulators I'm using compliant feed strategies",
        "Help me sleep at night during disease season",
      ],
      witis: [
        "One outbreak wipes out a year of margin",
        "Regulatory non-compliance = license risk",
        "My personal reputation rides on outbreak response",
      ],
      topValue: "Survival, reputation, and license to operate",
    },
    "Sustainability Advocate": {
      rungs: [
        "Help me cut scope-3 emissions per kg of product",
        "Help me defend our CSR claims to retailer audits",
        "Help me co-publish a verified carbon case study",
      ],
      witis: [
        "Buyer audits now disqualify suppliers without scope-3 data",
        "Public claims must withstand greenwashing scrutiny",
        "Co-published case studies get me speaking slots and board visibility",
      ],
      topValue: "Industry leadership on sustainability",
    },
    "Knowledge Builder": {
      rungs: [
        "Help me explain a technical concept in 90 seconds",
        "Help me train my next generation of farmers",
        "Help me publish content I can put my name on",
      ],
      witis: [
        "Most farmers in my region lack technical literacy",
        "If I don't train them, no one will",
        "Authorship = professional legacy, not just a campaign",
      ],
      topValue: "Authorship, legacy, and educational impact",
    },
  };

  const seed = baseByPersona[s.persona] ?? baseByPersona["Efficiency Optimizer"];
  return {
    rungs: seed.rungs.map((outcome, i) => ({
      id: `${s.id}-rung-${i}-${Date.now()}`,
      outcome,
      witi: seed.witis[i] ?? "",
    })),
    topValue: seed.topValue,
  };
}

export default function CBILadderPage() {
  const selectedIds = useAdiPlanStore((s) => s.selectedStakeholderIds);
  const ladders = useAdiPlanStore((s) => s.ladders);
  const setLadder = useAdiPlanStore((s) => s.setLadder);
  const removeLadder = useAdiPlanStore((s) => s.removeLadder);

  const selectedStakeholders = useMemo(
    () => seededStakeholders.filter((s) => selectedIds.includes(s.id)),
    [selectedIds]
  );

  // Auto-seed ladders for newly selected stakeholders.
  useEffect(() => {
    for (const s of selectedStakeholders) {
      if (!ladders[s.id]) {
        const seed = generateSeedLadder(s);
        setLadder({
          stakeholderId: s.id,
          rungs: seed.rungs,
          topValue: seed.topValue,
        });
      }
    }
  }, [selectedStakeholders, ladders, setLadder]);

  if (selectedStakeholders.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
          Module 02 &middot; Assessing
        </p>
        <h1 className="mt-2 text-3xl font-bold text-adisseo-ink">CBI / CSF Ladder</h1>
        <p className="mt-4 text-adisseo-muted">
          Pick stakeholders from the influence map first &mdash; this module auto-generates
          a &ldquo;Help me to&hellip;&rdquo; outcomes ladder for each one and ladders them up
          to the underlying value (WITI = Why Is This Important).
        </p>
        <Link
          href="/stakeholder-map"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-adisseo-crimson px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Open Stakeholder Map
          <ArrowRight size={14} />
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="h-6 w-px bg-adisseo-line" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              Module 02 &middot; Assessing
            </p>
            <h1 className="text-lg font-semibold text-adisseo-ink-strong">
              CBI / CSF Ladder
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/stakeholder-map"
            className="text-sm text-adisseo-muted hover:text-adisseo-ink"
          >
            &larr; Back to map
          </Link>
          <Link
            href="/news-bridge"
            className="flex items-center gap-2 rounded-md bg-adisseo-crimson px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            News &rarr; Strategy bridge
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-sm text-adisseo-muted">
          {selectedStakeholders.length} stakeholder
          {selectedStakeholders.length === 1 ? "" : "s"} selected. Each ladder reads bottom-to-top:
          tactical &ldquo;Help me to&rdquo; outcomes &rarr; WITI &rarr; underlying value.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {selectedStakeholders.map((s) => {
            const ladder = ladders[s.id];
            const color = personaColors[s.persona];
            if (!ladder) return null;

            const updateRung = (rungId: string, patch: Partial<LadderRung>) => {
              setLadder({
                ...ladder,
                rungs: ladder.rungs.map((r) =>
                  r.id === rungId ? { ...r, ...patch } : r
                ),
              });
            };

            const addRung = () => {
              setLadder({
                ...ladder,
                rungs: [
                  ...ladder.rungs,
                  {
                    id: `${s.id}-rung-${Date.now()}`,
                    outcome: "Help me to…",
                    witi: "",
                  },
                ],
              });
            };

            const deleteRung = (rungId: string) => {
              setLadder({
                ...ladder,
                rungs: ladder.rungs.filter((r) => r.id !== rungId),
              });
            };

            const regenerate = () => {
              const seed = generateSeedLadder(s);
              setLadder({
                stakeholderId: s.id,
                rungs: seed.rungs,
                topValue: seed.topValue,
              });
            };

            return (
              <article
                key={s.id}
                className="overflow-hidden rounded-2xl border border-adisseo-line bg-white shadow-sm"
              >
                <div
                  className="px-5 py-4 text-white"
                  style={{ backgroundColor: color }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
                    {s.persona}
                  </p>
                  <h2 className="mt-1 text-base font-semibold leading-snug">
                    {s.label}
                  </h2>
                </div>

                <div className="space-y-3 p-5">
                  <div className="rounded-lg border border-adisseo-line bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                      Top Value (WITI of WITIs)
                    </p>
                    <input
                      type="text"
                      value={ladder.topValue}
                      onChange={(e) =>
                        setLadder({ ...ladder, topValue: e.target.value })
                      }
                      className="mt-1 w-full bg-transparent text-sm font-semibold text-adisseo-ink focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-1 text-adisseo-muted">
                    <ArrowUpRight size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      ladders up to
                    </span>
                  </div>

                  <ol className="space-y-2">
                    {ladder.rungs.map((rung, idx) => (
                      <li
                        key={rung.id}
                        className="rounded-lg border border-adisseo-line p-3"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: color }}
                          >
                            {idx + 1}
                          </span>
                          <div className="flex-1 space-y-2">
                            <textarea
                              value={rung.outcome}
                              onChange={(e) =>
                                updateRung(rung.id, { outcome: e.target.value })
                              }
                              className="w-full resize-none border-none bg-transparent text-sm text-adisseo-ink focus:outline-none"
                              rows={2}
                            />
                            <div className="rounded-md bg-slate-50 px-2 py-1.5">
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                                WITI
                              </p>
                              <textarea
                                value={rung.witi}
                                onChange={(e) =>
                                  updateRung(rung.id, { witi: e.target.value })
                                }
                                placeholder="Why is this important to them?"
                                className="w-full resize-none border-none bg-transparent text-xs italic text-adisseo-muted focus:outline-none"
                                rows={2}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => deleteRung(rung.id)}
                            className="text-adisseo-muted/60 hover:text-red-500"
                            title="Remove rung"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={addRung}
                      className="flex items-center gap-1.5 rounded-md border border-adisseo-line px-3 py-1.5 text-xs font-medium text-adisseo-ink hover:bg-slate-50"
                    >
                      <Plus size={12} /> Add rung
                    </button>
                    <button
                      onClick={regenerate}
                      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-adisseo-muted hover:text-adisseo-ink"
                      title="Regenerate from persona template"
                    >
                      <Wand2 size={12} /> Regenerate
                    </button>
                    <button
                      onClick={() => removeLadder(s.id)}
                      className="text-xs text-adisseo-muted/60 hover:text-red-500"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
