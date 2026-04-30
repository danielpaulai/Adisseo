"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Eye,
  Send,
  Share2,
  ShieldAlert,
  Sparkles,
  XCircle,
  Zap,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import {
  ChannelPreview,
  ChannelIcon,
} from "@/components/ChannelPreview";
import {
  CHANNEL_LIST,
  CHANNELS,
  TENANT_LIST,
  getTenant,
  type DistributionChannel,
} from "@/lib/tenant";
import {
  DEMO_DELIVERABLES,
  type DemoDeliverable,
} from "@/lib/distribution";
import { useAdiPlanStore } from "@/lib/store";
import {
  deliverableKindForChannel,
  type DeliverableInstance,
} from "@/lib/engagement";
import type { ChannelPreview as ChannelPreviewType } from "@/lib/channel-adapter";

interface DispatchState {
  status: "idle" | "shipping" | "shipped" | "blocked";
  reason?: string;
  channel?: DistributionChannel;
  deliverableId?: string;
}

export default function DistributionPage() {
  const activeTenantId = useAdiPlanStore((s) => s.activeTenantId);
  const tenant = getTenant(activeTenantId);

  const distribution = useAdiPlanStore((s) => s.distribution);
  const pushDistribution = useAdiPlanStore((s) => s.pushDistribution);
  const patchDistribution = useAdiPlanStore((s) => s.patchDistribution);

  const scheduledSends = useAdiPlanStore((s) => s.scheduledSends);
  const schedule = useAdiPlanStore((s) => s.schedule);
  const fireScheduled = useAdiPlanStore((s) => s.fireScheduled);
  const cancelScheduled = useAdiPlanStore((s) => s.cancelScheduled);

  const pushLiveDeliverable = useAdiPlanStore((s) => s.pushLiveDeliverable);
  const patchLiveDeliverable = useAdiPlanStore((s) => s.patchLiveDeliverable);

  const pushActivity = useAdiPlanStore((s) => s.pushActivity);

  const [filterChannel, setFilterChannel] = useState<DistributionChannel | "all">(
    "all"
  );
  const [dispatch, setDispatch] = useState<DispatchState>({ status: "idle" });
  const [previewCard, setPreviewCard] = useState<ChannelPreviewType | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [scheduleFor, setScheduleFor] = useState<string>("");
  const [openLogPreview, setOpenLogPreview] = useState<string | null>(null);

  const tenantDeliverables = useMemo(
    () => DEMO_DELIVERABLES.filter((d) => d.tenantId === activeTenantId),
    [activeTenantId]
  );

  const channelsForTenant = CHANNEL_LIST.filter((c) =>
    tenant.approvedChannels.includes(c.id)
  );

  const tenantLog = distribution.filter((l) => l.tenantId === activeTenantId);
  const tenantQueue = scheduledSends.filter(
    (q) => q.tenantId === activeTenantId
  );

  // Default the schedule input to "+2 hours" so the demo always has a time.
  useEffect(() => {
    if (scheduleFor) return;
    const t = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const local = new Date(t.getTime() - t.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16);
    setScheduleFor(local);
  }, [scheduleFor]);

  /* ------------------------------------------------------------------------ */
  /* Preview a channel card without dispatching.                              */
  /* ------------------------------------------------------------------------ */
  async function preview(d: DemoDeliverable, channel: DistributionChannel) {
    setPreviewLoading(`${d.id}-${channel}`);
    try {
      const res = await fetch("/api/distribute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tenantId: d.tenantId,
          channel,
          deliverable: d.label,
          body: d.body,
          subject: d.label,
          hashtags: d.hashtags,
          region: d.region,
          species: d.species,
          manager: d.manager,
          trustScore: d.trustScore,
          citationCount: d.citationCount,
          previewOnly: true,
        }),
      });
      const json = await res.json();
      if (json.preview) setPreviewCard(json.preview as ChannelPreviewType);
    } catch (e) {
      toast.error("Preview failed", {
        description: e instanceof Error ? e.message : "Request failed",
      });
    } finally {
      setPreviewLoading(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Ship via the channel adapter, push live deliverable, log activity.       */
  /* ------------------------------------------------------------------------ */
  async function ship(deliverable: DemoDeliverable, channel: DistributionChannel) {
    setDispatch({ status: "shipping", channel, deliverableId: deliverable.id });
    try {
      const res = await fetch("/api/distribute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tenantId: deliverable.tenantId,
          channel,
          deliverable: deliverable.label,
          body: deliverable.body,
          subject: deliverable.label,
          hashtags: deliverable.hashtags,
          region: deliverable.region,
          species: deliverable.species,
          manager: deliverable.manager,
          trustScore: deliverable.trustScore,
          citationCount: deliverable.citationCount,
          approvalStatus: deliverable.approvalStatus,
        }),
      });
      const json = await res.json();
      const channelLabel = CHANNELS[channel].label;

      if (json.status === "shipped") {
        const deliverableInstanceId = `dx-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 5)}`;
        const distId = pushDistribution({
          tenantId: deliverable.tenantId,
          channel,
          deliverable: deliverable.label,
          trustScore: deliverable.trustScore,
          status: "shipped",
          audience: json.audience,
          publicUrl: json.publicUrl,
          externalId: json.externalId,
          audienceCount: json.audienceCount,
          preview: json.preview,
          deliverableInstanceId,
        });

        // Phase 5 — auto-create a DeliverableInstance for engagement-tracker.
        const instance: DeliverableInstance = {
          id: deliverableInstanceId,
          kind: deliverableKindForChannel(channel, deliverable.label),
          title: deliverable.label,
          language: deliverable.region === "Hokkaido" ? "JA" :
            deliverable.region === "China" ? "ZH" :
            deliverable.region === "Vietnam" ? "VI" :
            deliverable.region === "Indonesia" ? "ID" :
            deliverable.region === "Thailand" ? "TH" : "EN",
          region: deliverable.region ?? "APAC",
          species: deliverable.species,
          audience: channelLabel,
          owner: `${deliverable.manager} · ${deliverable.studio}`,
          sentAt: new Date().toISOString().slice(0, 10),
          views: 0,
          qualifiedViews: 0,
          conversations: 0,
          conversions: 0,
          anchorSignal: `${getTenant(deliverable.tenantId).name} · ${channelLabel}`,
          trustScore: deliverable.trustScore,
        };
        pushLiveDeliverable(instance);

        pushActivity({
          kind: "deliverable",
          title: `Shipped — ${deliverable.label}`,
          detail: `${getTenant(deliverable.tenantId).name} → ${channelLabel} · reach ${
            json.audienceCount?.toLocaleString() ?? "?"
          } · trust ${deliverable.trustScore}`,
          tone: "good",
          href: "/distribution",
        });
        toast.success(`Shipped to ${channelLabel}`, {
          description: `Reach ${json.audienceCount?.toLocaleString() ?? "?"} · open the post → ${
            json.publicUrl ?? "(mock URL)"
          }`,
        });
        setDispatch({ status: "shipped", channel, deliverableId: deliverable.id });

        // Auto-trigger an engagement callback after 600ms so the demo lands
        // with non-zero numbers without the operator clicking again.
        setTimeout(() => simulateEngagement(distId), 600);
      } else {
        pushDistribution({
          tenantId: deliverable.tenantId,
          channel,
          deliverable: deliverable.label,
          trustScore: deliverable.trustScore,
          status: "blocked",
          blockReason: json.reason,
        });
        pushActivity({
          kind: "deliverable",
          title: `Blocked — ${deliverable.label}`,
          detail: json.reason ?? "Distribution gate failed",
          tone: "warn",
          href: "/distribution",
        });
        toast.warning("Distribution blocked", {
          description: json.reason ?? "Gate failed",
        });
        setDispatch({
          status: "blocked",
          reason: json.reason,
          channel,
          deliverableId: deliverable.id,
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      toast.error("Dispatch failed", { description: msg });
      setDispatch({
        status: "blocked",
        reason: msg,
        channel,
        deliverableId: deliverable.id,
      });
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Schedule a send for later.                                               */
  /* ------------------------------------------------------------------------ */
  async function scheduleShip(
    deliverable: DemoDeliverable,
    channel: DistributionChannel
  ) {
    if (!scheduleFor) {
      toast.error("Pick a date/time first");
      return;
    }
    const iso = new Date(scheduleFor).toISOString();
    schedule({
      tenantId: deliverable.tenantId,
      channel,
      deliverable: deliverable.label,
      trustScore: deliverable.trustScore,
      approvalStatus: deliverable.approvalStatus,
      species: deliverable.species,
      scheduledFor: iso,
    });
    pushActivity({
      kind: "deliverable",
      title: `Scheduled — ${deliverable.label}`,
      detail: `${CHANNELS[channel].label} · ${new Date(iso).toLocaleString()}`,
      tone: "info",
      href: "/distribution",
    });
    toast.success("Scheduled", {
      description: `${CHANNELS[channel].label} · ${new Date(iso).toLocaleString()}`,
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Fire a queued send now (operator override).                              */
  /* ------------------------------------------------------------------------ */
  async function fireQueued(queueId: string) {
    const q = scheduledSends.find((x) => x.id === queueId);
    if (!q) return;
    const deliverable = DEMO_DELIVERABLES.find((d) => d.label === q.deliverable);
    if (!deliverable) {
      toast.error("Queued deliverable not found in demo set");
      return;
    }
    fireScheduled(queueId);
    await ship(deliverable, q.channel);
  }

  /* ------------------------------------------------------------------------ */
  /* Simulate inbound engagement webhook for a shipped row.                   */
  /* ------------------------------------------------------------------------ */
  async function simulateEngagement(distId: string, hoursSinceShip: number = 24) {
    const row = useAdiPlanStore.getState().distribution.find((d) => d.id === distId);
    if (!row || row.status !== "shipped") return;
    try {
      const res = await fetch("/api/distribution-callback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          externalId: row.externalId,
          channel: row.channel,
          audienceCount: row.audienceCount,
          trustScore: row.trustScore,
          citationCount: 4,
          hoursSinceShip,
        }),
      });
      const json = await res.json();
      patchDistribution(distId, {
        engagement: {
          impressions: json.impressions,
          qualifiedViews: json.qualifiedViews,
          conversations: json.conversations,
          conversions: json.conversions,
          updatedAt: json.updatedAt,
        },
      });
      if (row.deliverableInstanceId) {
        patchLiveDeliverable(row.deliverableInstanceId, {
          views: json.impressions,
          qualifiedViews: json.qualifiedViews,
          conversations: json.conversations,
          conversions: json.conversions,
        });
      }
      toast.info("Engagement update", { description: json.summary });
    } catch (e) {
      toast.error("Callback failed", {
        description: e instanceof Error ? e.message : "Request failed",
      });
    }
  }

  return (
    <main className="min-h-screen bg-adisseo-bg pb-24 text-adisseo-ink">
      <header className="sticky top-0 z-20 border-b border-adisseo-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-adisseo-muted transition hover:text-adisseo-crimson"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
          <Logo />
          <TenantSwitcher />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-10">
        <div className="rounded-3xl border border-adisseo-line bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                <Share2 size={10} /> Phase 5 · Closed loop
              </p>
              <h1 className="mt-3 text-3xl font-black text-adisseo-ink-strong">
                Distribution rails
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-adisseo-muted">
                Approved-and-ready deliverables route through tenant-specific
                channel gates. Each channel runs through its own adapter that
                produces a channel-native preview, simulated dispatch latency,
                and a public URL. Every shipped deliverable auto-creates a
                DeliverableInstance for engagement-tracker grading. Inbound
                engagement webhook updates the trackers and the audit log.
              </p>
            </div>
            <div
              className="rounded-2xl border border-adisseo-line p-4 text-right"
              style={{ borderColor: tenant.accent }}
            >
              <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
                <Building2 size={10} /> Active tenant
              </p>
              <p
                className="text-lg font-black"
                style={{ color: tenant.accent }}
              >
                {tenant.name}
              </p>
              <p className="mt-1 text-[11px] text-adisseo-muted">
                Trust ≥ {tenant.trustFloor} · {tenant.approvedChannels.length}{" "}
                channels ·{" "}
                {tenant.requiresHqApproval ? "HQ approval required" : "no approval gate"}
              </p>
            </div>
          </div>

          {/* Channel filter chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterChannel("all")}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                filterChannel === "all"
                  ? "border-adisseo-crimson bg-adisseo-crimson text-white"
                  : "border-adisseo-line text-adisseo-ink hover:border-adisseo-crimson"
              }`}
            >
              All channels
            </button>
            {CHANNEL_LIST.map((c) => {
              const approved = tenant.approvedChannels.includes(c.id);
              const active = filterChannel === c.id;
              return (
                <button
                  key={c.id}
                  disabled={!approved}
                  onClick={() => setFilterChannel(c.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                    !approved
                      ? "cursor-not-allowed border-adisseo-line bg-stone-100 text-adisseo-muted"
                      : active
                        ? "text-white"
                        : "border-adisseo-line text-adisseo-ink hover:border-adisseo-crimson"
                  }`}
                  style={
                    active
                      ? { backgroundColor: c.accent, borderColor: c.accent }
                      : undefined
                  }
                  title={!approved ? `${tenant.name} does not approve ${c.label}` : c.blurb}
                >
                  <ChannelIcon channel={c.id} />
                  {c.label}
                  {!approved && <span className="text-[9px]">blocked</span>}
                </button>
              );
            })}
          </div>

          {/* Schedule-for input */}
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-adisseo-line bg-stone-50 px-3 py-2 text-[11px]">
            <CalendarClock size={12} className="text-adisseo-muted" />
            <span className="font-semibold text-adisseo-ink-strong">
              Schedule sends for:
            </span>
            <input
              type="datetime-local"
              value={scheduleFor}
              onChange={(e) => setScheduleFor(e.target.value)}
              className="rounded border border-adisseo-line bg-white px-2 py-1 text-[11px]"
            />
            <span className="text-adisseo-muted">
              Operators can defer dispatch; the queue fires at the scheduled time
              (or by manual override below).
            </span>
          </div>
        </div>

        {/* Live preview modal */}
        {previewCard && (
          <div
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-6"
            onClick={() => setPreviewCard(null)}
          >
            <div
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between text-white">
                <p className="text-[11px] font-bold uppercase tracking-widest">
                  Channel-native preview
                </p>
                <button
                  onClick={() => setPreviewCard(null)}
                  className="rounded bg-white/10 px-2 py-0.5 text-[10px]"
                >
                  Close
                </button>
              </div>
              <ChannelPreview preview={previewCard} />
            </div>
          </div>
        )}

        {/* Deliverables grid */}
        <section className="mt-10">
          <h2 className="text-lg font-black text-adisseo-ink-strong">
            Approved-and-ready deliverables ({tenantDeliverables.length})
          </h2>
          <p className="text-xs text-adisseo-muted">
            Preview the channel-native card, ship now, or queue for later.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {tenantDeliverables.map((d) => {
              const trustOk = d.trustScore >= tenant.trustFloor;
              const approvalOk =
                !tenant.requiresHqApproval || d.approvalStatus === "approved";
              const eligible = trustOk && approvalOk;
              return (
                <article
                  key={d.id}
                  className="rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-adisseo-muted">
                        {d.studio} · {d.species} · {d.region ?? "APAC"}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-adisseo-ink-strong">
                        {d.label}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11px] text-adisseo-muted">
                        {d.body}
                      </p>
                      <p className="mt-1 text-[10px] text-adisseo-muted">
                        Manager: {d.manager} · {d.citationCount ?? 0} Vault citations
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        d.approvalStatus === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : d.approvalStatus === "rejected"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {d.approvalStatus}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        trustOk
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      Trust {d.trustScore} {trustOk ? "≥" : "<"} {tenant.trustFloor}
                    </span>
                    {!approvalOk && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                        HQ approval required
                      </span>
                    )}
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 font-semibold text-stone-700">
                      Recommended:{" "}
                      {d.recommendedChannels
                        .map((c) => CHANNELS[c].label)
                        .join(", ")}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {channelsForTenant
                      .filter(
                        (c) => filterChannel === "all" || c.id === filterChannel
                      )
                      .map((c) => {
                        const isShipping =
                          dispatch.status === "shipping" &&
                          dispatch.channel === c.id &&
                          dispatch.deliverableId === d.id;
                        const justShipped =
                          dispatch.status === "shipped" &&
                          dispatch.channel === c.id &&
                          dispatch.deliverableId === d.id;
                        const recommended = d.recommendedChannels.includes(c.id);
                        const previewKey = `${d.id}-${c.id}`;
                        return (
                          <div
                            key={c.id}
                            className="flex flex-wrap items-center gap-1 rounded-full border border-adisseo-line bg-stone-50 px-1.5 py-1"
                          >
                            <span className="px-1 text-[10px] font-bold text-stone-700">
                              {c.label}
                            </span>
                            <button
                              onClick={() => preview(d, c.id)}
                              disabled={previewLoading === previewKey}
                              className="inline-flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-semibold text-adisseo-muted transition hover:text-adisseo-crimson"
                              title={`Preview the ${c.label} card`}
                            >
                              {previewLoading === previewKey ? (
                                <Sparkles size={9} className="animate-pulse" />
                              ) : (
                                <Eye size={9} />
                              )}
                              Preview
                            </button>
                            <button
                              disabled={!eligible || isShipping}
                              onClick={() => ship(d, c.id)}
                              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                justShipped
                                  ? "bg-emerald-500 text-white"
                                  : recommended
                                    ? "bg-adisseo-crimson text-white hover:bg-adisseo-crimson/90"
                                    : "bg-adisseo-ink-strong text-white hover:bg-adisseo-crimson"
                              }`}
                              title={c.blurb}
                            >
                              {justShipped ? (
                                <CheckCircle2 size={9} />
                              ) : isShipping ? (
                                <Sparkles size={9} className="animate-pulse" />
                              ) : (
                                <Send size={9} />
                              )}
                              {isShipping ? "Shipping…" : justShipped ? "Shipped" : "Ship now"}
                            </button>
                            <button
                              disabled={!eligible}
                              onClick={() => scheduleShip(d, c.id)}
                              className="inline-flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-semibold text-stone-700 transition hover:text-adisseo-crimson disabled:cursor-not-allowed disabled:opacity-50"
                              title="Defer dispatch to the scheduled time"
                            >
                              <CalendarClock size={9} /> Queue
                            </button>
                          </div>
                        );
                      })}
                    {!eligible && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-adisseo-muted">
                        <ShieldAlert size={11} />
                        Gate failed — fix trust or approval first
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
            {tenantDeliverables.length === 0 && (
              <p className="rounded-2xl border border-dashed border-adisseo-line p-6 text-sm text-adisseo-muted md:col-span-2">
                No demo deliverables seeded for {tenant.name} yet. Switch tenant
                to see others.
              </p>
            )}
          </div>
        </section>

        {/* Scheduled queue */}
        {tenantQueue.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-black text-adisseo-ink-strong">
              Scheduled queue ({tenantQueue.length})
            </h2>
            <p className="text-xs text-adisseo-muted">
              In production a cron fires these at the scheduled time. Here you
              can fire one early or cancel.
            </p>
            <ul className="mt-4 space-y-2">
              {tenantQueue.map((q) => (
                <li
                  key={q.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-adisseo-line bg-white px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-adisseo-ink-strong">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${
                          q.status === "queued"
                            ? "bg-amber-100 text-amber-700"
                            : q.status === "fired"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-stone-200 text-stone-600 line-through"
                        }`}
                      >
                        {q.status}
                      </span>
                      {q.deliverable}
                    </p>
                    <p className="text-[11px] text-adisseo-muted">
                      {CHANNELS[q.channel]?.label} · scheduled{" "}
                      {new Date(q.scheduledFor).toLocaleString()} · trust {q.trustScore}
                    </p>
                  </div>
                  {q.status === "queued" && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => fireQueued(q.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-emerald-700"
                      >
                        <Zap size={10} /> Fire now
                      </button>
                      <button
                        onClick={() => cancelScheduled(q.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-adisseo-line px-2.5 py-1 text-[10px] font-semibold text-stone-600 transition hover:text-adisseo-crimson"
                      >
                        <Trash2 size={10} /> Cancel
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Distribution log */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-adisseo-ink-strong">
              Distribution log ({tenantLog.length})
            </h2>
            <p className="text-[11px] text-adisseo-muted">
              Each row links to the public URL + the channel-native preview.
              Engagement updates auto-feed the engagement-tracker.
            </p>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-adisseo-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-widest text-adisseo-muted">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Channel</th>
                  <th className="px-3 py-2">Deliverable</th>
                  <th className="px-3 py-2 text-right">Reach</th>
                  <th className="px-3 py-2 text-right">Conv.</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenantLog.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-6 text-center text-xs text-adisseo-muted"
                    >
                      No dispatches yet — ship a deliverable above to populate the log.
                    </td>
                  </tr>
                ) : (
                  tenantLog.map((row) => {
                    const expanded = openLogPreview === row.id;
                    return (
                      <Fragment key={row.id}>
                        <tr
                          className="border-t border-adisseo-line align-top"
                        >
                          <td className="whitespace-nowrap px-3 py-2 text-[11px] text-adisseo-muted">
                            {new Date(row.shippedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                                row.status === "shipped"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : row.status === "blocked"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs font-semibold text-adisseo-ink-strong">
                            {CHANNELS[row.channel]?.label ?? row.channel}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            <p className="font-semibold text-adisseo-ink-strong">
                              {row.deliverable}
                            </p>
                            {row.blockReason && (
                              <p className="mt-0.5 text-[11px] text-rose-600">
                                {row.blockReason}
                              </p>
                            )}
                            {row.publicUrl && (
                              <a
                                href={row.publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-0.5 inline-flex items-center gap-1 truncate text-[11px] font-semibold text-adisseo-crimson hover:underline"
                              >
                                <ExternalLink size={10} />
                                {row.publicUrl.length > 48
                                  ? row.publicUrl.slice(0, 47) + "…"
                                  : row.publicUrl}
                              </a>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-[11px] font-semibold text-adisseo-ink-strong">
                            {row.audienceCount?.toLocaleString() ?? "—"}
                            {row.engagement && (
                              <p className="text-[10px] font-normal text-adisseo-muted">
                                {row.engagement.impressions.toLocaleString()} impr
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-[11px] font-bold text-emerald-700">
                            {row.engagement?.conversions ?? "—"}
                            {row.engagement && (
                              <p className="text-[10px] font-normal text-adisseo-muted">
                                {row.engagement.qualifiedViews} qualified
                              </p>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right">
                            {row.preview && (
                              <button
                                onClick={() =>
                                  setOpenLogPreview(expanded ? null : row.id)
                                }
                                className="text-[10px] font-semibold text-adisseo-muted transition hover:text-adisseo-crimson"
                              >
                                {expanded ? "Hide preview" : "Preview"}
                              </button>
                            )}
                            {row.status === "shipped" && (
                              <button
                                onClick={() => simulateEngagement(row.id, 24)}
                                className="ml-2 text-[10px] font-semibold text-adisseo-crimson transition hover:underline"
                                title="Simulate the channel firing back engagement metrics"
                              >
                                ↻ Update
                              </button>
                            )}
                          </td>
                        </tr>
                        {expanded && row.preview && (
                          <tr>
                            <td
                              colSpan={7}
                              className="border-t border-adisseo-line bg-stone-50 px-3 py-3"
                            >
                              <div className="mx-auto max-w-md">
                                <ChannelPreview preview={row.preview} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tenant overview */}
        <section className="mt-10 rounded-2xl border border-adisseo-line bg-white p-6">
          <h2 className="text-lg font-black text-adisseo-ink-strong">
            Tenant channel matrix
          </h2>
          <p className="text-xs text-adisseo-muted">
            Each tenant's compliance team picks which channels are approved.
            AdiPlan blocks the rest at the API level.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-widest text-adisseo-muted">
                <tr>
                  <th className="px-2 py-2">Tenant</th>
                  <th className="px-2 py-2 text-center">Trust floor</th>
                  {CHANNEL_LIST.map((c) => (
                    <th key={c.id} className="px-2 py-2 text-center">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TENANT_LIST.map((t) => (
                  <tr key={t.id} className="border-t border-adisseo-line">
                    <td className="px-2 py-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-adisseo-ink-strong">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: t.accent }}
                        />
                        {t.name}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-xs font-bold">
                      {t.trustFloor}
                    </td>
                    {CHANNEL_LIST.map((c) => (
                      <td key={c.id} className="px-2 py-2 text-center text-base">
                        {t.approvedChannels.includes(c.id) ? (
                          <CheckCircle2
                            size={14}
                            className="mx-auto text-emerald-600"
                          />
                        ) : (
                          <XCircle
                            size={14}
                            className="mx-auto text-stone-300"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
