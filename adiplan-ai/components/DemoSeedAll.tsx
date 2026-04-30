"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import { seedFullDemo } from "@/lib/demo-seed";
import { toast } from "sonner";

/**
 * <DemoSeedAll />
 *
 * Single-button "prime the entire demo state" UI for the May 7 walkthrough.
 * Two halves:
 *   - Readiness panel: live-counts of every kind of seeded state (so the
 *     operator can see at a glance whether a refresh wiped persistence)
 *   - Action row: Seed all / Reset all
 *
 * Optional `compact` prop renders only the action row (used by the
 * dashboard top-bar where the readiness panel doesn't fit).
 */

interface DemoSeedAllProps {
  compact?: boolean;
}

export function DemoSeedAll({ compact = false }: DemoSeedAllProps) {
  const {
    selectedStakeholderIds,
    ladders,
    match,
    composedFrame,
    activity,
    approvals,
    distribution,
    scheduledSends,
    liveDeliverables,
  } = useAdiPlanStore();

  const setSelectedStakeholders = useAdiPlanStore(
    (s) => s.setSelectedStakeholders
  );
  const setLadder = useAdiPlanStore((s) => s.setLadder);
  const setSelectedArticle = useAdiPlanStore((s) => s.setSelectedArticle);
  const setMatch = useAdiPlanStore((s) => s.setMatch);
  const setComposedFrame = useAdiPlanStore((s) => s.setComposedFrame);
  const pushActivity = useAdiPlanStore((s) => s.pushActivity);
  const requestApproval = useAdiPlanStore((s) => s.requestApproval);
  const decideApproval = useAdiPlanStore((s) => s.decideApproval);
  const pushDistribution = useAdiPlanStore((s) => s.pushDistribution);
  const schedule = useAdiPlanStore((s) => s.schedule);
  const pushLiveDeliverable = useAdiPlanStore((s) => s.pushLiveDeliverable);

  const clearStakeholders = useAdiPlanStore((s) => s.clearStakeholders);
  const clearActivity = useAdiPlanStore((s) => s.clearActivity);
  const clearApprovals = useAdiPlanStore((s) => s.clearApprovals);
  const clearDistribution = useAdiPlanStore((s) => s.clearDistribution);
  const clearScheduled = useAdiPlanStore((s) => s.clearScheduled);
  const clearLiveDeliverables = useAdiPlanStore(
    (s) => s.clearLiveDeliverables
  );

  const [seeding, setSeeding] = useState(false);

  const ladderCount = Object.keys(ladders).length;

  const seed = () => {
    setSeeding(true);
    // Use a microtask delay so the spinner renders before the synchronous seed.
    setTimeout(() => {
      const r = seedFullDemo({
        setSelectedStakeholders,
        setLadder,
        setSelectedArticle,
        setMatch,
        setComposedFrame,
        pushActivity,
        requestApproval,
        decideApproval,
        pushDistribution,
        schedule,
        pushLiveDeliverable,
      });
      toast.success(
        `Demo state primed · ${r.stakeholders} stakeholders, ${r.activity} activities, ${r.distribution} dispatches, ${r.liveDeliverables} live deliverables`
      );
      setSeeding(false);
    }, 60);
  };

  const reset = () => {
    if (
      !confirm(
        "Reset all demo state — stakeholders, match, frame, activity, approvals, distribution log, scheduled sends, live deliverables. Voice profiles + tenant + studio defaults stay. Continue?"
      )
    )
      return;
    clearStakeholders();
    setSelectedArticle(null);
    setMatch(null);
    setComposedFrame(null);
    clearActivity();
    clearApprovals();
    clearDistribution();
    clearScheduled();
    clearLiveDeliverables();
    toast.info("Demo state cleared");
  };

  if (compact) {
    return (
      <button
        onClick={seed}
        disabled={seeding}
        className="inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2.5 py-1 text-[10px] font-semibold text-adisseo-crimson transition hover:border-adisseo-crimson disabled:opacity-50"
        title="Prime stakeholders, match, frame, activity, approvals, distribution log, scheduled sends, and live deliverables in one click."
      >
        {seeding ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
        Seed full demo
      </button>
    );
  }

  const checks: { label: string; got: number; need: number }[] = [
    { label: "Stakeholders selected", got: selectedStakeholderIds.length, need: 4 },
    { label: "CBI ladders", got: ladderCount, need: 4 },
    { label: "Article + match", got: match ? 1 : 0, need: 1 },
    { label: "Strategic frame", got: composedFrame ? 1 : 0, need: 1 },
    { label: "War-room activity", got: activity.length, need: 12 },
    { label: "Approval queue", got: approvals.length, need: 4 },
    { label: "Distribution log", got: distribution.length, need: 6 },
    { label: "Scheduled sends", got: scheduledSends.length, need: 3 },
    { label: "Live deliverables", got: liveDeliverables.length, need: 5 },
  ];

  const totalGot = checks.reduce((acc, c) => acc + Math.min(c.got, c.need), 0);
  const totalNeed = checks.reduce((acc, c) => acc + c.need, 0);
  const pct = Math.round((totalGot / totalNeed) * 100);

  return (
    <div className="rounded-3xl border border-adisseo-line bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-adisseo-crimson/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-adisseo-crimson">
            <Sparkles size={10} /> Demo readiness
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-adisseo-ink-strong md:text-3xl">
            One click. Every cold-open dead end. Solved.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-adisseo-muted">
            Pre-loads the stakeholder selection, the matched article, the
            composed strategic frame, 12 war-room activities, 4 approval
            requests (2 already decided), 6 distribution dispatches with
            engagement metrics, 3 scheduled sends, and 5 live deliverables
            for the engagement tracker. Demo never opens to an empty UI.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
            Pre-flight
          </p>
          <p
            className={`text-3xl font-black ${
              pct === 100
                ? "text-emerald-600"
                : pct > 0
                  ? "text-amber-600"
                  : "text-stone-400"
            }`}
          >
            {pct}%
          </p>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((c) => {
          const ok = c.got >= c.need;
          return (
            <li
              key={c.label}
              className="flex items-center justify-between text-[12px]"
            >
              <span className="flex items-center gap-1.5 text-adisseo-muted">
                {ok ? (
                  <CheckCircle2
                    size={13}
                    className="shrink-0 text-emerald-600"
                  />
                ) : (
                  <Circle size={13} className="shrink-0 text-stone-300" />
                )}
                <span className={ok ? "text-adisseo-ink-strong" : ""}>
                  {c.label}
                </span>
              </span>
              <span className="font-mono text-[11px] text-adisseo-muted">
                {c.got} / {c.need}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={seed}
          disabled={seeding}
          className="inline-flex items-center gap-2 rounded-lg bg-adisseo-crimson px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          Seed full demo state
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg border border-adisseo-line bg-white px-5 py-3 text-sm font-semibold text-adisseo-muted transition hover:border-rose-300 hover:text-rose-600"
        >
          <Trash2 size={14} />
          Reset demo state
        </button>
      </div>
    </div>
  );
}
