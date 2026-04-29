"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lightbulb,
  Pause,
  Search,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAdiPlanStore } from "@/lib/store";
import { seededStakeholders } from "@/lib/stakeholders";
import {
  buildWWWKBoard,
  summariseBoard,
  type WWWKMethod,
  type WWWKPriority,
  type WWWKQuestion,
  type WWWKStatus,
} from "@/lib/wwwk";

const METHOD_TONE: Record<WWWKMethod, string> = {
  "1:1 interview": "bg-sky-100 text-sky-800",
  "Focus group": "bg-violet-100 text-violet-800",
  "Online survey": "bg-emerald-100 text-emerald-800",
  "On-farm observation": "bg-amber-100 text-amber-800",
  "Desk research": "bg-stone-200 text-stone-800",
  "Sales call ride-along": "bg-rose-100 text-rose-800",
  "Win/loss review": "bg-orange-100 text-orange-800",
};

const PRIORITY_TONE: Record<WWWKPriority, string> = {
  high: "bg-adisseo-crimson text-white",
  medium: "bg-amber-200 text-amber-900",
  low: "bg-stone-200 text-stone-700",
};

const STATUS_TONE: Record<WWWKStatus, string> = {
  open: "bg-stone-100 text-stone-700 border-stone-300",
  "in-flight": "bg-amber-100 text-amber-800 border-amber-300",
  answered: "bg-emerald-100 text-emerald-800 border-emerald-300",
  parked: "bg-stone-100 text-stone-500 border-stone-300",
};

export default function WWWKPage() {
  const selected = useAdiPlanStore((s) => s.selectedStakeholderIds);
  const match = useAdiPlanStore((s) => s.match);
  const composedFrame = useAdiPlanStore((s) => s.composedFrame);

  const defaultStakeholder =
    selected[0] ?? seededStakeholders[0].id;
  const defaultCbi =
    composedFrame?.cbi ?? match?.cbi ?? "Procurement-cycle compression";
  const defaultRegion = composedFrame?.region ?? "APAC";

  const [stakeholderId, setStakeholderId] = useState(defaultStakeholder);
  const [cbi, setCbi] = useState(defaultCbi);
  const [region, setRegion] = useState(defaultRegion);

  // Local mutation of the question state so users can mark answered, etc.
  const initialBoard = useMemo(
    () => buildWWWKBoard(stakeholderId, cbi, region),
    [stakeholderId, cbi, region]
  );
  const [questions, setQuestions] = useState<WWWKQuestion[]>(initialBoard.questions);

  // When stakeholder/CBI/region changes, reset the question state.
  // (We use a key on the editing UI rather than useEffect to avoid stale state.)
  const boardKey = `${stakeholderId}-${cbi}-${region}`;
  const [boundKey, setBoundKey] = useState(boardKey);
  if (boundKey !== boardKey) {
    setQuestions(initialBoard.questions);
    setBoundKey(boardKey);
  }

  const summary = summariseBoard({ ...initialBoard, questions });

  const stakeholder = seededStakeholders.find((s) => s.id === stakeholderId) ?? seededStakeholders[0];

  const setStatus = (id: string, status: WWWKStatus) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? {
              ...q,
              status,
              answeredAt: status === "answered" ? new Date().toISOString() : q.answeredAt,
            }
          : q
      )
    );
  };
  const setInsight = (id: string, insight: string) => {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, insight, status: insight ? "answered" : q.status, answeredAt: insight ? new Date().toISOString() : q.answeredAt } : q))
    );
  };

  const exportToCSV = () => {
    const header = [
      "question",
      "decision",
      "hypothesis",
      "who_to_ask",
      "method",
      "priority",
      "status",
      "insight",
    ];
    const rows = questions.map((q) =>
      [
        q.question,
        q.decision,
        q.hypothesis,
        q.whoToAsk,
        q.method,
        q.priority,
        q.status,
        q.insight ?? "",
      ]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wwwk-${stakeholder.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported WWWK board as CSV");
  };

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="text-adisseo-muted hover:text-adisseo-crimson">
              Home
            </Link>
            <Link href="/cbi-ladder" className="text-adisseo-muted hover:text-adisseo-crimson">
              CBI Ladder
            </Link>
            <Link href="/strategic-frame" className="text-adisseo-muted hover:text-adisseo-crimson">
              Strategic Frame
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-orange text-white">
            <HelpCircle size={16} />
          </span>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-orange">
              Assessing · We Wish We Knew
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              WWWK board
            </h1>
            <p className="text-sm text-adisseo-muted">
              The questions that, if answered, would change a decision — not
              just inform one. Tied to specific stakeholders and the CBI you're
              already working on.
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs font-semibold text-adisseo-ink-strong transition hover:border-adisseo-orange hover:text-adisseo-orange"
          >
            Export CSV
          </button>
        </div>

        {/* Setup */}
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-adisseo-line bg-white p-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Stakeholder
            </span>
            <select
              value={stakeholderId}
              onChange={(e) => setStakeholderId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs text-adisseo-ink-strong focus:border-adisseo-orange focus:outline-none"
            >
              {seededStakeholders.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} · {s.persona}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Critical Business Issue
            </span>
            <input
              type="text"
              value={cbi}
              onChange={(e) => setCbi(e.target.value)}
              placeholder="Procurement-cycle compression"
              className="mt-1 w-full rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs text-adisseo-ink-strong focus:border-adisseo-orange focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Region
            </span>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="APAC"
              className="mt-1 w-full rounded-lg border border-adisseo-line bg-white px-3 py-2 text-xs text-adisseo-ink-strong focus:border-adisseo-orange focus:outline-none"
            />
          </label>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Questions on the board" value={summary.total} icon={<HelpCircle size={14} />} tone="ink" />
          <Stat label="Open" value={summary.open} icon={<Target size={14} />} tone="ink" />
          <Stat label="In flight" value={summary.inFlight} icon={<Clock size={14} />} tone="amber" />
          <Stat label="Answered" value={summary.answered} icon={<CheckCircle2 size={14} />} tone="emerald" />
        </div>

        {/* Persona context strip */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-adisseo-line bg-white p-3 text-xs">
          <span className="rounded bg-adisseo-orange/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-orange">
            Persona
          </span>
          <span className="font-semibold text-adisseo-ink-strong">{stakeholder.persona}</span>
          <span className="text-adisseo-muted">· {stakeholder.label}</span>
          <span className="ml-auto text-[10px] uppercase tracking-widest text-adisseo-muted">
            CBI · {cbi} · {region}
          </span>
        </div>

        {/* Board */}
        <ol className="space-y-3">
          {questions.map((q, i) => (
            <li
              key={q.id}
              className="rounded-2xl border border-adisseo-line bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${PRIORITY_TONE[q.priority]}`}
                >
                  {q.priority}
                </span>
                <span className="text-[10px] font-semibold text-adisseo-muted">
                  Q{(i + 1).toString().padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <p className="text-base font-semibold text-adisseo-ink-strong">
                    {q.question}
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    <Block label="Decision this answer unblocks" body={q.decision} accent="crimson" icon={<Target size={11} />} />
                    <Block label="Current hypothesis" body={q.hypothesis} accent="cyan" icon={<Lightbulb size={11} />} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                    <span className="rounded-full bg-adisseo-bg px-2 py-0.5 font-semibold uppercase tracking-widest text-adisseo-muted">
                      Ask: {q.whoToAsk}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-widest ${METHOD_TONE[q.method]}`}>
                      {q.method}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 font-semibold uppercase tracking-widest ${STATUS_TONE[q.status]}`}>
                      {q.status}
                    </span>
                  </div>

                  {/* Insight capture */}
                  <textarea
                    placeholder="Capture the answer here when you've heard it. Marking this complete will flip the status to 'answered'."
                    value={q.insight ?? ""}
                    onChange={(e) => setInsight(q.id, e.target.value)}
                    className="mt-3 w-full resize-none rounded-lg border border-adisseo-line bg-adisseo-bg px-3 py-2 text-xs text-adisseo-ink-strong placeholder:text-adisseo-muted focus:border-adisseo-orange focus:outline-none"
                    rows={q.insight ? 2 : 1}
                  />

                  {/* Status actions */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <StatusBtn
                      label="Open"
                      icon={<Search size={10} />}
                      active={q.status === "open"}
                      onClick={() => setStatus(q.id, "open")}
                    />
                    <StatusBtn
                      label="In flight"
                      icon={<Clock size={10} />}
                      active={q.status === "in-flight"}
                      onClick={() => setStatus(q.id, "in-flight")}
                    />
                    <StatusBtn
                      label="Answered"
                      icon={<CheckCircle2 size={10} />}
                      active={q.status === "answered"}
                      onClick={() => setStatus(q.id, "answered")}
                    />
                    <StatusBtn
                      label="Park"
                      icon={<Pause size={10} />}
                      active={q.status === "parked"}
                      onClick={() => setStatus(q.id, "parked")}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-adisseo-line bg-white p-4 text-xs">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
            What this feeds
          </p>
          <ul className="mt-2 space-y-1 text-adisseo-ink-strong">
            <li>
              <ArrowRight size={11} className="inline" /> Answered questions become inputs to the next CBI Ladder iteration.
            </li>
            <li>
              <ArrowRight size={11} className="inline" /> "High" priority questions that are still open block the matching Strategic Frame from being signed off.
            </li>
            <li>
              <ArrowRight size={11} className="inline" /> The CSV export goes straight into a regional-research backlog or a Notion table.
            </li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/cbi-ladder"
              className="rounded-md border border-adisseo-line px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted hover:border-adisseo-orange hover:text-adisseo-orange"
            >
              ⤷ Open CBI Ladder
            </Link>
            <Link
              href="/strategic-frame"
              className="rounded-md border border-adisseo-line px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted hover:border-adisseo-orange hover:text-adisseo-orange"
            >
              ⤷ Open Strategic Frame
            </Link>
          </div>
        </div>
      </div>
    </main>
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
  tone: "amber" | "emerald" | "ink";
}) {
  const cls =
    tone === "amber"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-white text-adisseo-ink-strong border-adisseo-line";
  return (
    <div className={`rounded-2xl border p-3 ${cls}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest opacity-80">
        {icon} {label}
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Block({
  label,
  body,
  accent,
  icon,
}: {
  label: string;
  body: string;
  accent: "crimson" | "cyan";
  icon: React.ReactNode;
}) {
  const cls =
    accent === "crimson"
      ? "border-l-2 border-adisseo-crimson"
      : "border-l-2 border-adisseo-cyan";
  return (
    <div className={`rounded-md bg-adisseo-bg px-3 py-2 ${cls}`}>
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
        {icon} {label}
      </p>
      <p className="mt-1 text-xs text-adisseo-ink-strong">{body}</p>
    </div>
  );
}

function StatusBtn({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition ${
        active
          ? "border-adisseo-orange bg-adisseo-orange text-white"
          : "border-adisseo-line bg-white text-adisseo-muted hover:border-adisseo-orange hover:text-adisseo-orange"
      }`}
    >
      {icon} {label}
    </button>
  );
}
