"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Clapperboard,
  FileText,
  Mail,
  BookOpen,
  Newspaper,
  Target,
  Trash2,
  Mic,
  Layers,
  Send,
} from "lucide-react";
import { useAdiPlanStore, type ActivityEntry, type ActivityKind } from "@/lib/store";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { WorkflowRibbon } from "@/components/workspace/WorkflowRibbon";
import { DemoSeedAll } from "@/components/DemoSeedAll";
import { LiveModeChip } from "@/components/LiveModeChip";
import { DEMO_DELIVERABLES } from "@/lib/distribution";
import { CHANNELS, getTenant } from "@/lib/tenant";

/* ----------------------------------------------------------------------------
 * Demo-seed payload — populates the war-room with realistic recent activity
 * so it isn't empty in cold-start screenshots / first-impressions of the demo.
 * Mirrors the data model in /engagement-tracker but as session activity.
 * ---------------------------------------------------------------------------- */

const DEMO_SEED: Omit<ActivityEntry, "id">[] = [
  {
    kind: "match",
    title: "Analyzed: Cargill SE-Asia ASF webinar Q3 2025",
    detail:
      "Cargill · → Disease-resilience nutrition / Integrator vet desk",
    href: "/competitor-watch",
    tone: "ink",
    at: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    kind: "frame",
    title:
      "Composed frame: Add the nutrition layer to the recovery story. Or someone else will.",
    detail: "Integrator vet desk · China",
    href: "/strategic-frame",
    tone: "crimson",
    at: new Date(Date.now() - 10 * 60_000).toISOString(),
  },
  {
    kind: "swine",
    title: "Swine short: PRRS recovery vertical · ZH (WeChat)",
    detail: "ZH · cn-charoen-pokphand",
    href: "/studio/swine",
    tone: "crimson",
    at: new Date(Date.now() - 9 * 60_000).toISOString(),
  },
  {
    kind: "match",
    title: "Analyzed: Kemin AGP-Free webinar Jan 2026",
    detail: "Kemin · → Regulatory shift / Integrator nutrition manager",
    href: "/competitor-watch",
    tone: "ink",
    at: new Date(Date.now() - 7 * 60_000).toISOString(),
  },
  {
    kind: "frame",
    title:
      "Composed frame: Hold the FCR floor. Reclaim the uniformity ceiling.",
    detail: "Integrator vet desk · APAC",
    href: "/strategic-frame",
    tone: "crimson",
    at: new Date(Date.now() - 6 * 60_000).toISOString(),
  },
  {
    kind: "poultry",
    title: "Poultry pack: AGP-Free integrator emailer",
    detail: "Email + carousel · integrator-nutrition-manager",
    href: "/studio/poultry",
    tone: "cyan",
    at: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    kind: "match",
    title: "Analyzed: Hokkaido Dairy Times · summer-yield issue",
    detail:
      "Hokkaido Dairy Times · → Heat stress / Hokkaido dairy R&D buyer",
    href: "/competitor-watch",
    tone: "ink",
    at: new Date(Date.now() - 3 * 60_000).toISOString(),
  },
  {
    kind: "frame",
    title:
      "Composed frame: Hold the milk through summer. Without writing a capex memo.",
    detail: "Hokkaido dairy R&D buyer · Hokkaido",
    href: "/strategic-frame",
    tone: "crimson",
    at: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
  {
    kind: "ruminants",
    title: "Ruminants brochure: Heat-stress manga brochure",
    detail: "JA · heat-stress · hokkaido-dairy",
    href: "/studio/ruminants",
    tone: "ink",
    at: new Date(Date.now() - 1 * 60_000).toISOString(),
  },
];

const KIND_ICON: Record<ActivityKind, React.ComponentType<{ size?: number }>> = {
  match: Newspaper,
  frame: Target,
  aqua: FileText,
  poultry: Mail,
  ruminants: BookOpen,
  swine: Clapperboard,
  "voice-memo": Mic,
};

const KIND_LABEL: Record<ActivityKind, string> = {
  match: "News match",
  frame: "Strategic frame",
  aqua: "Aqua leaflet",
  poultry: "Poultry pack",
  ruminants: "Ruminants brochure",
  swine: "Swine short",
  "voice-memo": "Voice memo",
};

const TONE_BG: Record<NonNullable<ActivityEntry["tone"]>, string> = {
  crimson: "bg-adisseo-crimson/10 text-adisseo-crimson",
  cyan: "bg-adisseo-cyan/10 text-adisseo-cyan",
  orange: "bg-adisseo-orange/10 text-adisseo-orange",
  ink: "bg-adisseo-ink/10 text-adisseo-ink-strong",
};

function materializeDemoActivity(): ActivityEntry[] {
  return DEMO_SEED.map((entry, index) => ({
    ...entry,
    id: `showcase-${index}`,
  }));
}

export default function DashboardPage() {
  const activeTenantId = useAdiPlanStore((s) => s.activeTenantId);
  const activity = useAdiPlanStore((s) => s.activity);
  const distribution = useAdiPlanStore((s) => s.distribution);
  const clearActivity = useAdiPlanStore((s) => s.clearActivity);
  const pushActivity = useAdiPlanStore((s) => s.pushActivity);
  const composedFrame = useAdiPlanStore((s) => s.composedFrame);
  const match = useAdiPlanStore((s) => s.match);
  const tenant = getTenant(activeTenantId);

  const seedDemo = () => {
    // Replay in chronological order so the most-recent ends up on top.
    const ordered = [...DEMO_SEED].sort(
      (a, b) => new Date(a.at!).getTime() - new Date(b.at!).getTime()
    );
    for (const e of ordered) pushActivity(e);
  };

  const usingShowcaseData = activity.length === 0;
  const displayActivity = usingShowcaseData ? materializeDemoActivity() : activity;

  const counts = displayActivity.reduce<Record<ActivityKind, number>>(
    (acc, a) => {
      acc[a.kind] = (acc[a.kind] ?? 0) + 1;
      return acc;
    },
    {
      match: 0,
      frame: 0,
      aqua: 0,
      poultry: 0,
      ruminants: 0,
      swine: 0,
      "voice-memo": 0,
    }
  );

  const totalShipped =
    counts.aqua +
    counts.poultry +
    counts.ruminants +
    counts.swine +
    counts["voice-memo"];

  const matchToFrame = counts.match
    ? Math.round((counts.frame / counts.match) * 100)
    : 0;
  const frameToShip = counts.frame
    ? Math.round((totalShipped / counts.frame) * 100)
    : 0;

  const latestMatch = displayActivity.find((entry) => entry.kind === "match") ?? null;
  const latestFrame = displayActivity.find((entry) => entry.kind === "frame") ?? null;
  const latestShipment =
    displayActivity.find((entry) => ["aqua", "poultry", "ruminants", "swine", "voice-memo"].includes(entry.kind)) ?? null;

  const showcaseShipments = DEMO_DELIVERABLES.filter(
    (deliverable) =>
      deliverable.tenantId === activeTenantId &&
      deliverable.trustScore >= tenant.trustFloor &&
      (!tenant.requiresRegionalApproval || deliverable.approvalStatus === "approved")
  )
    .slice(0, 3)
    .map((deliverable, index) => ({
      id: `ship-${deliverable.id}`,
      deliverable: deliverable.label,
      channel: deliverable.recommendedChannels[0],
      reach:
        deliverable.recommendedChannels[0] === "trade-mag"
          ? "Editorial review"
          : `${(5400 + index * 1800).toLocaleString()} reached`,
      detail: `${deliverable.manager} · ${deliverable.region ?? "APAC"} · ${deliverable.citationCount ?? 0} citations`,
    }));

  const liveShipments = distribution
    .filter((row) => row.tenantId === activeTenantId && row.status === "shipped")
    .slice(0, 3)
    .map((row) => ({
      id: row.id,
      deliverable: row.deliverable,
      channel: row.channel,
      reach: row.audienceCount ? `${row.audienceCount.toLocaleString()} reached` : row.audience,
      detail: row.publicUrl ?? row.audience ?? "Live dispatch",
    }));

  const shippingLane = liveShipments.length > 0 ? liveShipments : showcaseShipments;
  const usingShowcaseShipping = liveShipments.length === 0;

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-adisseo-bg">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-baseline gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
              <Activity size={16} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                Sales war-room
              </p>
              <h1 className="font-display text-2xl font-semibold text-adisseo-ink-strong sm:text-3xl">
                What got shipped this session
              </h1>
              <p className="text-sm text-adisseo-muted">
                Every news match, composed strategic frame, and species deliverable
                that moved through APAC AI — most-recent first.
              </p>
              {usingShowcaseData && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-adisseo-crimson/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                  Showcase mode · seeded session story until a live workflow starts
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <DemoSeedAll compact />
            <LiveModeChip />
          </div>
        </div>

        {/* TOP STATS */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            n={counts.match}
            label="Articles matched"
            icon={Newspaper}
            href="/competitor-watch"
          />
          <Stat
            n={counts.frame}
            label="Frames composed"
            icon={Target}
            href="/strategic-frame"
          />
          <Stat
            n={totalShipped}
            label="Deliverables shipped"
            icon={Layers}
          />
          <Stat
            n={`${matchToFrame}%`}
            label="Analyze → Frame conversion"
            sub={`${frameToShip}% Frame → Deliverable`}
          />
        </div>

        <WorkflowRibbon />

        <section className="mb-8 mt-8 grid gap-4 lg:grid-cols-[1.1fr,1fr,1fr]">
          <OperatingCard
            label="Latest market signal"
            title={latestMatch?.title ?? "No article matched yet"}
            detail={latestMatch?.detail ?? "Open Competitor Watch to create the first live signal."}
            href={latestMatch?.href ?? "/competitor-watch"}
            cta="Open signal"
          />
          <OperatingCard
            label="Frame on deck"
            title={latestFrame?.title ?? "No strategic frame composed"}
            detail={latestFrame?.detail ?? "Compose the narrative before the creative leaves the studio."}
            href={latestFrame?.href ?? "/strategic-frame"}
            cta="Open frame"
          />
          <OperatingCard
            label="Latest shipped asset"
            title={latestShipment?.title ?? "No deliverable shipped yet"}
            detail={latestShipment?.detail ?? "Push one studio asset through approval and distribution to light this up."}
            href={latestShipment?.href ?? "/distribution"}
            cta="Open asset"
          />
        </section>

        <section className="mb-8 rounded-3xl border border-adisseo-line bg-white p-5 shadow-adi-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                Channel shipping lane
              </p>
              <h3 className="mt-1 text-lg font-bold text-adisseo-ink-strong">
                What left the desk and where it landed
              </h3>
              <p className="text-[11px] text-adisseo-muted">
                {usingShowcaseShipping
                  ? "Showcase shipments mirror the strongest distribution outputs until the first live dispatch lands."
                  : "These rows are coming from the live distribution log for the active tenant."}
              </p>
            </div>
            <Link
              href="/distribution"
              className="inline-flex items-center gap-1 rounded-md border border-adisseo-line px-3 py-2 text-[11px] font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson hover:text-adisseo-crimson"
            >
              Open distribution <ArrowRight size={11} />
            </Link>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {shippingLane.map((shipment) => (
              <div key={shipment.id} className="rounded-2xl border border-adisseo-line bg-[#FBFAF6] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-adisseo-ink/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-ink-strong">
                    <Send size={10} /> {CHANNELS[shipment.channel].label}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                    {shipment.reach}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold leading-snug text-adisseo-ink-strong">
                  {shipment.deliverable}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-adisseo-muted">
                  {shipment.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CURRENT FRAME */}
        {composedFrame && (
          <section className="mb-8 rounded-3xl border-2 border-adisseo-crimson/35 bg-white p-6 shadow-adi-card">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              <Target size={12} /> Current strategic frame
            </div>
            <h2 className="font-display mt-2 text-2xl font-semibold text-adisseo-ink-strong">
              {composedFrame.oneLineSummary}
            </h2>
            <p className="mt-2 text-sm text-adisseo-muted">
              {composedFrame.cbi} · {composedFrame.persona} ·{" "}
              {composedFrame.region}{" "}
              {composedFrame.competitor
                ? `· anchor: ${composedFrame.competitor}`
                : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Link
                href="/strategic-frame"
                className="flex items-center gap-1 rounded-md bg-adisseo-crimson px-3 py-1.5 font-semibold text-white hover:opacity-90"
              >
                Open frame <ArrowRight size={11} />
              </Link>
              {composedFrame.activations.slice(0, 3).map((act) => (
                <Link
                  key={act.species + act.deliverable}
                  href={`/studio/${act.species}`}
                  className="flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-3 py-1.5 font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson hover:text-adisseo-crimson"
                >
                  Studio · {act.species} <ArrowRight size={11} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* MIX */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-adisseo-ink-strong">
              Deliverable mix
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={seedDemo}
                className="flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2.5 py-1 text-[10px] font-semibold text-adisseo-crimson hover:border-adisseo-crimson"
                title="Pre-load 10 realistic activity entries so the war-room isn't empty in cold-start screenshots."
              >
                {usingShowcaseData ? "Load showcase into session" : "Pre-load demo activity"}
              </button>
              <DemoSeedAll compact />
              {!usingShowcaseData && (
                <button
                  onClick={() => {
                    if (confirm("Clear the war-room activity log?")) clearActivity();
                  }}
                  className="flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2.5 py-1 text-[10px] font-semibold text-adisseo-muted hover:border-adisseo-crimson hover:text-adisseo-crimson"
                >
                  <Trash2 size={10} /> Clear log
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            {(Object.keys(KIND_LABEL) as ActivityKind[]).map((k) => {
              const Icon = KIND_ICON[k];
              return (
                <div
                  key={k}
                  className="rounded-xl border border-adisseo-line bg-white p-3"
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-adisseo-muted">
                    <Icon size={11} />
                    {KIND_LABEL[k]}
                  </div>
                  <p className="mt-2 font-serif text-2xl font-bold text-adisseo-ink-strong">
                    {counts[k]}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* TIMELINE */}
        <section>
          <h3 className="mb-3 text-sm font-bold text-adisseo-ink-strong">
            Activity timeline
          </h3>
          {displayActivity.length === 0 ? (
            <EmptyState
              match={!!match}
              composedFrame={!!composedFrame}
              onSeedDemo={seedDemo}
            />
          ) : (
            <ol className="space-y-2">
              {displayActivity.map((a) => {
                const Icon = KIND_ICON[a.kind];
                const tone = a.tone ? TONE_BG[a.tone] : TONE_BG.ink;
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-2xl border border-adisseo-line bg-white p-4"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}
                    >
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-adisseo-ink-strong">
                          {a.title}
                        </p>
                        <span className="shrink-0 text-[10px] uppercase tracking-widest text-adisseo-muted">
                          {timeAgo(a.at)}
                        </span>
                      </div>
                      {a.detail && (
                        <p className="mt-0.5 truncate text-xs text-adisseo-muted">
                          {a.detail}
                        </p>
                      )}
                    </div>
                    {a.href && (
                      <Link
                        href={a.href}
                        className="flex items-center gap-1 rounded-md border border-adisseo-line px-2 py-1 text-[10px] font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson hover:text-adisseo-crimson"
                      >
                        Open <ArrowRight size={10} />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </main>
    </WorkspaceShell>
  );
}

function Stat({
  n,
  label,
  sub,
  icon: Icon,
  href,
}: {
  n: number | string;
  label: string;
  sub?: string;
  icon?: React.ComponentType<{ size?: number }>;
  href?: string;
}) {
  const inner = (
    <div className="adi-surface flex h-full flex-col p-4 transition hover:border-adisseo-crimson hover:shadow-adi-card-hover">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-adisseo-muted">
        {Icon && <Icon size={11} />}
        {label}
      </div>
      <p className="mt-2 font-serif text-3xl font-bold text-adisseo-ink-strong">
        {n}
      </p>
      {sub && <p className="mt-1 text-[10px] text-adisseo-muted">{sub}</p>}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

function OperatingCard({
  label,
  title,
  detail,
  href,
  cta,
}: {
  label: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="adi-surface rounded-2xl p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-snug text-adisseo-ink-strong">
        {title}
      </p>
      <p className="mt-1 min-h-[2.5rem] text-[11px] leading-relaxed text-adisseo-muted">
        {detail}
      </p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-adisseo-crimson hover:underline"
      >
        {cta} <ArrowRight size={11} />
      </Link>
    </div>
  );
}

function EmptyState({
  match,
  onSeedDemo,
}: {
  match: boolean;
  composedFrame: boolean;
  onSeedDemo: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-adisseo-line bg-white p-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-adisseo-crimson/10 text-adisseo-crimson">
        <Activity size={20} />
      </span>
      <p className="mt-4 text-sm font-bold text-adisseo-ink-strong">
        No activity yet this session
      </p>
      <p className="mt-2 mx-auto max-w-md text-xs text-adisseo-muted">
        Every news match, composed strategic frame, and species deliverable
        will appear here as you work. Start the demo path — or pre-load a
        realistic 10-entry session for screenshots:
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <button
          onClick={onSeedDemo}
          className="flex items-center gap-1 rounded-md bg-adisseo-ink-strong px-3 py-2 font-semibold text-white hover:opacity-90"
        >
          Pre-load demo activity <ArrowRight size={11} />
        </button>
        <Link
          href="/competitor-watch"
          className="flex items-center gap-1 rounded-md bg-adisseo-crimson px-3 py-2 font-semibold text-white hover:opacity-90"
        >
          1 · Analyze an article <ArrowRight size={11} />
        </Link>
        <Link
          href="/strategic-frame"
          className={`flex items-center gap-1 rounded-md px-3 py-2 font-semibold ${
            match
              ? "bg-white text-adisseo-ink-strong border border-adisseo-line hover:border-adisseo-crimson hover:text-adisseo-crimson"
              : "bg-adisseo-bg text-adisseo-muted opacity-60"
          }`}
        >
          2 · Compose frame <ArrowRight size={11} />
        </Link>
        <Link
          href="/personas-matrix"
          className="flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-3 py-2 font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson hover:text-adisseo-crimson"
        >
          · Or open the matrix <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
