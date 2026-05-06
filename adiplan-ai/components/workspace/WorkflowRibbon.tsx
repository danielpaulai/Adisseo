"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Clapperboard,
  Newspaper,
  Share2,
  ShieldCheck,
  Target,
} from "lucide-react";

/** Produce card href; any `/studio/*` route emphasizes this step in the ribbon. */
export const WORKFLOW_PRODUCE_ENTRY_HREF = "/studio/poultry" as const;

const STEPS = [
  {
    href: "/competitor-watch",
    title: "Competitor Watch",
    description: "Scraped competitor news, filters, and CSF / CBI / persona roll-ups.",
    icon: Newspaper,
    accent: "border-adisseo-crimson/30 bg-adisseo-crimson/5",
  },

  {
    href: "/strategic-frame",
    title: "Compose strategy",
    description: "Lock the frame before creative execution.",
    icon: Target,
    accent: "border-adisseo-orange/40 bg-adisseo-orange/5",
  },
  {
    href: WORKFLOW_PRODUCE_ENTRY_HREF,
    title: "Produce assets",
    description: "Species studios — start from poultry or switch species.",
    icon: Clapperboard,
    accent: "border-adisseo-cyan/40 bg-adisseo-cyan/5",
  },
  {
    href: "/approval-queue",
    title: "Regional review",
    description: "Brand guardrail queue before external ship.",
    icon: ShieldCheck,
    accent: "border-emerald-300/80 bg-emerald-50/80",
  },
  {
    href: "/distribution",
    title: "Ship to channels",
    description: "Preview channel-native cards and publish rails (manual push).",
    icon: Share2,
    accent: "border-violet-300/90 bg-violet-50/90",
  },
] as const;

export function inferWorkflowEmphasizedHref(pathname: string): string | undefined {
  if (pathname.startsWith("/studio")) return WORKFLOW_PRODUCE_ENTRY_HREF;
  if (pathname === "/competitor-watch" || pathname === "/news-bridge")
    return "/competitor-watch";
  if (pathname === "/strategic-frame") return "/strategic-frame";
  if (pathname === "/approval-queue") return "/approval-queue";
  if (pathname === "/distribution") return "/distribution";
  if (pathname === "/engagement-tracker") return "/competitor-watch";
  return undefined;
}

export type WorkflowRibbonProps = {
  /** Overrides pathname-based emphasis when set. */
  emphasizeHref?: string;
};

export function WorkflowRibbon({ emphasizeHref }: WorkflowRibbonProps) {
  const pathname = usePathname() ?? "";
  const resolvedEmphasis =
    emphasizeHref ?? inferWorkflowEmphasizedHref(pathname);

  return (
    <section
      className="adi-surface mb-8 p-4 sm:p-5"
      aria-label="Suggested workflow"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
          Session workflow
        </p>
        <span className="text-[10px] text-adisseo-muted-soft">
          Monitor → Position → Produce → Review → Ship
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const emphasized = resolvedEmphasis === s.href;
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`group relative flex flex-col rounded-xl border p-4 transition hover:shadow-adi-card-hover ${s.accent} ${
                emphasized
                  ? "z-[1] ring-2 ring-adisseo-crimson ring-offset-2 ring-offset-white shadow-adi-card"
                  : ""
              }`}
            >
              {emphasized ? (
                <span className="sr-only">Current workflow phase</span>
              ) : null}
              <div className="flex items-center gap-2 text-adisseo-ink-strong">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-adisseo-crimson shadow-sm ring-1 ring-adisseo-line/60">
                  <Icon size={15} />
                </span>
                <span className="text-sm font-semibold">{s.title}</span>
              </div>
              <p className="mt-2 flex-1 text-[11px] leading-snug text-adisseo-ink">
                {s.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-adisseo-crimson group-hover:underline">
                Open <ArrowRight size={12} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
