"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  useAdiPlanStore,
  type ApprovalKind,
  type ApprovalRequest,
} from "@/lib/store";

interface Props {
  /** What kind of deliverable this is. */
  kind: ApprovalKind;
  /** Title shown in the queue. */
  title: string;
  /** One-line summary (language, audience, format). */
  summary: string;
  /** Optional extra payload snapshot. */
  payload?: ApprovalRequest["payload"];
  /** Where the queue should deep-link back to. */
  href?: string;
  /** Sender label, defaults to species manager via kind mapping. */
  sender?: string;
  /** Disable the button (e.g. before first generation). */
  disabled?: boolean;
}

const SENDER_BY_KIND: Record<ApprovalKind, string> = {
  "aqua-leaflet": "Aileen · Aqua",
  "poultry-pack": "Vish · Poultry",
  "ruminants-brochure": "Antoine · Ruminants",
  "swine-short": "Claire · Swine",
  billboard: "AdiPlan AI",
  "voice-memo": "Field memo",
  "strategic-frame": "Strategy desk",
};

export function SendToHQButton({
  kind,
  title,
  summary,
  payload,
  href,
  sender,
  disabled = false,
}: Props) {
  const requestApproval = useAdiPlanStore((s) => s.requestApproval);
  const approvals = useAdiPlanStore((s) => s.approvals);
  const [justSent, setJustSent] = useState<string | null>(null);

  // Find any existing approval request matching this title (most recent first).
  const existing = approvals.find((a) => a.title === title);
  const status = justSent ? "pending" : existing?.status;

  const onClick = () => {
    if (disabled) return;
    const id = requestApproval({
      kind,
      title,
      summary,
      payload,
      href,
      sender: sender ?? SENDER_BY_KIND[kind],
    });
    setJustSent(id);
    toast.success("Sent to HQ for brand review", {
      description: "Ricardo will see it in the approval queue.",
    });
  };

  if (status === "approved") {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs">
        <CheckCircle2 size={14} className="text-emerald-600" />
        <span className="font-semibold text-emerald-700">Approved by HQ</span>
        {existing?.reviewerComment && (
          <span className="text-emerald-700/80">"{existing.reviewerComment}"</span>
        )}
        <Link
          href="/approval-queue"
          className="ml-auto inline-flex items-center gap-1 text-emerald-700 hover:underline"
        >
          View in queue <ArrowRight size={11} />
        </Link>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs">
        <XCircle size={14} className="text-rose-600" />
        <span className="font-semibold text-rose-700">Rejected by HQ</span>
        {existing?.reviewerComment && (
          <span className="text-rose-700/80">"{existing.reviewerComment}"</span>
        )}
        <button
          onClick={onClick}
          className="ml-auto inline-flex items-center gap-1 rounded bg-rose-600 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90"
        >
          Re-submit
        </button>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs">
        <Clock size={14} className="text-amber-700" />
        <span className="font-semibold text-amber-800">In HQ review</span>
        <span className="text-amber-800/80">
          Sent {new Date(existing?.sentAt ?? Date.now()).toLocaleTimeString()}
        </span>
        <Link
          href="/approval-queue"
          className="ml-auto inline-flex items-center gap-1 text-amber-800 hover:underline"
        >
          Open queue <ArrowRight size={11} />
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-adisseo-cyan/40 bg-adisseo-cyan/5 px-3 py-2 text-xs font-semibold text-adisseo-cyan transition hover:bg-adisseo-cyan/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShieldCheck size={14} />
      Send to HQ for brand review
      <Send size={12} />
    </button>
  );
}
