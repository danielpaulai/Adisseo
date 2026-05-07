"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Filter,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAdiPlanStore, type ApprovalRequest, type ApprovalStatus } from "@/lib/store";
import { syncApprovalAfterLocalMutation } from "@/lib/approval-requests-supabase";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { WorkflowRibbon } from "@/components/workspace/WorkflowRibbon";

const KIND_LABEL: Record<ApprovalRequest["kind"], string> = {
  "aqua-leaflet": "Aqua leaflet",
  "poultry-pack": "Poultry pack",
  "ruminants-brochure": "Ruminants brochure",
  "swine-short": "Swine short",
  "voice-memo": "Voice memo",
  "strategic-frame": "Strategic frame",
};

const KIND_TONE: Record<ApprovalRequest["kind"], string> = {
  "aqua-leaflet": "bg-sky-100 text-sky-800",
  "poultry-pack": "bg-amber-100 text-amber-800",
  "ruminants-brochure": "bg-emerald-100 text-emerald-800",
  "swine-short": "bg-rose-100 text-rose-800",
  "voice-memo": "bg-violet-100 text-violet-800",
  "strategic-frame": "bg-stone-200 text-stone-800",
};

const QUICK_COMMENTS = [
  "On-brand. Ship it.",
  "Adjust headline tone — drop the superlative.",
  "Sub the proof point with the APAC trial figure.",
  "Re-anchor the CTA on the ASF mortality benchmark.",
];

const DEMO_SEED: Omit<ApprovalRequest, "id" | "sentAt" | "status">[] = [
  {
    kind: "poultry-pack",
    title: "Poultry email + carousel · ASF outbreak playbook",
    summary: "5-slide LinkedIn carousel + sales email · EN · SE-Asia distributors",
    sender: "Vish · Poultry",
    href: "/studio/poultry",
    payload: { language: "en", audience: "SE-Asia distributors" },
  },
  {
    kind: "ruminants-brochure",
    title: "Ruminants manga brochure · Hokkaido methane",
    summary: "2-page manga brochure · JP · Japanese dairy co-ops",
    sender: "Antoine · Ruminants",
    href: "/studio/ruminants",
    payload: { language: "ja", audience: "JP dairy co-ops" },
  },
];

const SHOWCASE_APPROVALS: ApprovalRequest[] = [
  {
    id: "showcase-pending-poultry",
    kind: "poultry-pack",
    title: "Poultry email + carousel · ASF outbreak playbook",
    summary: "5-slide LinkedIn carousel + sales email · EN · SE-Asia distributors",
    sender: "Vish · Poultry",
    href: "/studio/poultry",
    payload: {
      language: "en",
      audience: "SE-Asia distributors",
      channel: "linkedin + email",
      citations: 4,
    },
    status: "pending",
    sentAt: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    id: "showcase-approved-ruminants",
    kind: "ruminants-brochure",
    title: "Ruminants manga brochure · Hokkaido methane",
    summary: "2-page manga brochure · JP · Japanese dairy co-ops",
    sender: "Antoine · Ruminants",
    href: "/studio/ruminants",
    payload: {
      language: "ja",
      audience: "JP dairy co-ops",
      channel: "trade-mag",
      citations: 2,
    },
    status: "approved",
    sentAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    reviewedAt: new Date(Date.now() - 2.5 * 60 * 60_000).toISOString(),
    reviewer: "Ricardo Communod",
    reviewerComment: "On-brand. Ship it.",
  },
  {
    id: "showcase-rejected-swine",
    kind: "swine-short",
    title: "ASF nursery short · 60s WeChat",
    summary: "WeChat short video script · ZH · nursery recovery protocol",
    sender: "Claire · Swine",
    href: "/studio/swine",
    payload: {
      language: "zh",
      audience: "CN integrator vet desk",
      channel: "wechat",
      citations: 2,
    },
    status: "rejected",
    sentAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
    reviewedAt: new Date(Date.now() - 4.5 * 60 * 60_000).toISOString(),
    reviewer: "Ricardo Communod",
    reviewerComment: "Adjust headline tone — drop the superlative.",
  },
];

export default function ApprovalQueuePage() {
  const approvals = useAdiPlanStore((s) => s.approvals);
  const decideApproval = useAdiPlanStore((s) => s.decideApproval);
  const requestApproval = useAdiPlanStore((s) => s.requestApproval);
  const clearApprovals = useAdiPlanStore((s) => s.clearApprovals);
  const pushActivity = useAdiPlanStore((s) => s.pushActivity);

  const [filter, setFilter] = useState<"all" | ApprovalStatus>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const usingShowcaseData = approvals.length === 0;
  const displayApprovals = usingShowcaseData ? SHOWCASE_APPROVALS : approvals;

  const filtered = useMemo(
    () =>
      filter === "all"
        ? displayApprovals
        : displayApprovals.filter((a) => a.status === filter),
    [displayApprovals, filter]
  );

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    for (const a of displayApprovals) c[a.status]++;
    return c;
  }, [displayApprovals]);

  const active =
    (activeId ? displayApprovals.find((a) => a.id === activeId) ?? null : null) ??
    (usingShowcaseData ? filtered[0] ?? null : null);

  const seedDemo = () => {
    for (const e of DEMO_SEED) requestApproval(e);
    toast.success("Demo queue seeded", {
      description: `${DEMO_SEED.length} review requests added`,
    });
  };

  const decide = (id: string, decision: "approved" | "rejected") => {
    if (!comment.trim() && decision === "rejected") {
      toast.error("Add a reviewer comment before rejecting");
      return;
    }
    const req = approvals.find((a) => a.id === id);
    decideApproval(id, decision, comment.trim() || "Approved as-is.", "Ricardo Communod");
    void syncApprovalAfterLocalMutation(id).then((r) => {
      if (r.ok || r.skipped) return;
      toast.error("Could not sync decision to Supabase", {
        description: r.error ?? "Unknown error",
      });
    });
    if (req) {
      pushActivity({
        kind: "frame",
        title: `${decision === "approved" ? "Approved" : "Rejected"} · ${KIND_LABEL[req.kind]}`,
        detail: req.title,
        href: req.href,
        tone: decision === "approved" ? "cyan" : "crimson",
      });
    }
    toast.success(decision === "approved" ? "Approved" : "Rejected", {
      description: req?.title,
    });
    setComment("");
    setActiveId(null);
  };

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-adisseo-bg">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero */}
        <div className="mb-8 flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-cyan text-white">
            <ShieldCheck size={16} />
          </span>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-cyan">
              Regional desk · brand guardrails
            </p>
            <h1 className="font-display text-2xl font-semibold text-adisseo-ink-strong sm:text-3xl">
              Approval queue
            </h1>
            <p className="text-sm text-adisseo-muted">
              Every species deliverable lands here before it leaves. The
              approval log auto-feeds the engagement tracker, so we know which
              assets shipped under regional guardrails.
            </p>
            {usingShowcaseData && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-adisseo-cyan/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-cyan">
                Showcase mode · sample approvals shown until a live review is created
              </p>
            )}
          </div>
          <button
            onClick={seedDemo}
            className="rounded-lg border border-adisseo-line/90 bg-white px-3 py-2 text-xs font-semibold text-adisseo-ink-strong shadow-adi-card transition hover:border-adisseo-cyan hover:text-adisseo-cyan"
          >
            Seed demo queue
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Pending"
            value={counts.pending}
            icon={<Clock size={14} />}
            tone="amber"
          />
          <Stat
            label="Approved"
            value={counts.approved}
            icon={<CheckCircle2 size={14} />}
            tone="emerald"
          />
          <Stat
            label="Rejected"
            value={counts.rejected}
            icon={<XCircle size={14} />}
            tone="rose"
          />
          <Stat
            label="Total reviewed"
            value={counts.approved + counts.rejected}
            icon={<ClipboardList size={14} />}
            tone="ink"
          />
        </div>

        <WorkflowRibbon />

        {/* Filters */}
        <div className="mb-4 flex items-center gap-2 text-xs">
          <Filter size={12} className="text-adisseo-muted" />
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-widest transition ${
                filter === f
                  ? "border-adisseo-cyan bg-adisseo-cyan text-white"
                  : "border-adisseo-line bg-white text-adisseo-muted hover:border-adisseo-cyan hover:text-adisseo-cyan"
              }`}
            >
              {f}
            </button>
          ))}
          {!usingShowcaseData && (
            <button
              onClick={() => {
                clearApprovals();
                toast.success("Queue cleared");
              }}
              className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted hover:text-adisseo-crimson"
            >
              Clear queue
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* List */}
          <div className="adi-surface overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <ShieldCheck size={28} className="text-adisseo-muted" />
                <p className="text-sm font-semibold text-adisseo-ink-strong">
                  Nothing in the {filter === "all" ? "queue" : filter}.
                </p>
                <p className="text-xs text-adisseo-muted">
                  Generate something in a studio and click &quot;Send for regional brand
                  review&quot;, or seed the demo queue above.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-adisseo-line">
                {filtered.map((a) => (
                  <li
                    key={a.id}
                    onClick={() => {
                      if (a.status === "pending" && !usingShowcaseData) {
                        setActiveId(a.id);
                        setComment("");
                      } else {
                        setActiveId(a.id === activeId ? null : a.id);
                      }
                    }}
                    className={`cursor-pointer px-4 py-3 transition hover:bg-adisseo-bg ${
                      activeId === a.id ? "bg-adisseo-bg" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <StatusPill status={a.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${KIND_TONE[a.kind]}`}
                          >
                            {KIND_LABEL[a.kind]}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                            from {a.sender}
                          </span>
                          <span className="text-[10px] text-adisseo-muted">
                            {new Date(a.sentAt).toLocaleString()}
                          </span>
                          <span
                            className="ml-auto rounded bg-adisseo-bg px-1.5 py-0.5 font-mono text-[10px] text-adisseo-muted"
                            title="Approval id"
                          >
                            {a.id}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-adisseo-ink-strong">
                          {a.title}
                        </p>
                        <p className="mt-0.5 text-xs text-adisseo-muted">
                          {a.summary}
                        </p>
                        {a.reviewerComment && (
                          <p
                            className={`mt-2 rounded-md border px-2 py-1 text-[11px] ${
                              a.status === "approved"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-rose-200 bg-rose-50 text-rose-800"
                            }`}
                          >
                            <span className="font-semibold">
                              {a.reviewer ?? "Ricardo"}:
                            </span>{" "}
                            "{a.reviewerComment}"
                          </p>
                        )}
                      </div>
                      {a.href && (
                        <Link
                          href={a.href}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-adisseo-cyan hover:underline"
                        >
                          Open <ArrowRight size={10} className="inline" />
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Review pane */}
          <div className="adi-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-cyan">
              Regional review
            </p>
            {active ? (
              <>
                <h3 className="mt-2 text-base font-bold text-adisseo-ink-strong">
                  {active.title}
                </h3>
                <p className="mt-1 text-xs text-adisseo-muted">{active.summary}</p>
                <p className="mt-1 font-mono text-[10px] text-adisseo-muted">
                  Approval id · {active.id}
                </p>

                {active.payload && (
                  <dl className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-adisseo-bg p-2 text-[10px]">
                    {Object.entries(active.payload).map(([k, v]) => (
                      <div key={k}>
                        <dt className="font-semibold uppercase tracking-widest text-adisseo-muted">
                          {k}
                        </dt>
                        <dd className="text-adisseo-ink-strong">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {active.status === "pending" && !usingShowcaseData ? (
                  <>
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                      Reviewer comment
                    </p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Brand-guardrail note (optional for approve, required for reject)"
                      className="mt-1 h-24 w-full resize-none rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs text-adisseo-ink-strong focus:border-adisseo-cyan focus:outline-none"
                    />

                    <div className="mt-2 flex flex-wrap gap-1">
                      {QUICK_COMMENTS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setComment(c)}
                          className="rounded-full border border-adisseo-line bg-white px-2 py-0.5 text-[10px] text-adisseo-muted hover:border-adisseo-cyan hover:text-adisseo-cyan"
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => decide(active.id, "approved")}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => decide(active.id, "rejected")}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-lg border border-adisseo-line bg-adisseo-bg p-3 text-xs">
                    <p className="font-semibold text-adisseo-ink-strong">
                      Decision: {active.status}
                    </p>
                    {active.reviewedAt && (
                      <p className="mt-1 text-[10px] text-adisseo-muted">
                        Reviewed by {active.reviewer ?? "Ricardo"} ·{" "}
                        {new Date(active.reviewedAt).toLocaleString()}
                      </p>
                    )}
                    {active.reviewerComment && (
                      <p className="mt-2 text-[11px]">{`"${active.reviewerComment}"`}</p>
                    )}
                    {usingShowcaseData && active.status === "pending" && (
                      <div className="mt-3 rounded-md border border-adisseo-cyan/25 bg-white p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-cyan">
                          Live review actions unlock after seeding
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-adisseo-muted">
                          This sample shows the payload, reviewer context, and guardrail expectation. Click Seed demo queue to create live, interactive approval requests.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 text-xs text-adisseo-muted">
                Pick a request from the queue to review it. Each approval is
                logged to the war room and the engagement tracker grades it
                against the Malaysia-ASF benchmark.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
    </WorkspaceShell>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "amber" | "emerald" | "rose" | "ink";
}) {
  const cls =
    tone === "amber"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : tone === "rose"
          ? "bg-rose-50 text-rose-800 border-rose-200"
          : "border-adisseo-line/90 bg-white text-adisseo-ink-strong shadow-adi-card";
  return (
    <div className={`rounded-2xl border p-3 ${cls}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest opacity-80">
        {icon} {label}
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: ApprovalStatus }) {
  const map = {
    pending: { cls: "bg-amber-100 text-amber-800", icon: <Clock size={11} />, label: "Pending" },
    approved: {
      cls: "bg-emerald-100 text-emerald-800",
      icon: <CheckCircle2 size={11} />,
      label: "Approved",
    },
    rejected: { cls: "bg-rose-100 text-rose-800", icon: <XCircle size={11} />, label: "Rejected" },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${s.cls}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}
