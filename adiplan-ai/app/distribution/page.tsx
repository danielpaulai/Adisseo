"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Eye,
  Share2,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { WorkflowRibbon } from "@/components/workspace/WorkflowRibbon";
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
import { buildPreview } from "@/lib/channel-adapter";
import { useAdiPlanStore, type DistributionLog } from "@/lib/store";
import type { ChannelPreview as ChannelPreviewType } from "@/lib/channel-adapter";

export default function DistributionPage() {
  const activeTenantId = useAdiPlanStore((s) => s.activeTenantId);
  const tenant = getTenant(activeTenantId);

  const distribution = useAdiPlanStore((s) => s.distribution);

  const [filterChannel, setFilterChannel] = useState<DistributionChannel | "all">(
    "all"
  );
  const [previewCard, setPreviewCard] = useState<ChannelPreviewType | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [openLogPreview, setOpenLogPreview] = useState<string | null>(null);

  const tenantDeliverables = useMemo(
    () => DEMO_DELIVERABLES.filter((d) => d.tenantId === activeTenantId),
    [activeTenantId]
  );

  const channelsForTenant = CHANNEL_LIST.filter((c) =>
    tenant.approvedChannels.includes(c.id)
  );

  const tenantLog = distribution.filter((l) => l.tenantId === activeTenantId);

  const eligibleDeliverables = useMemo(
    () =>
      tenantDeliverables.filter(
        (d) =>
          d.trustScore >= tenant.trustFloor &&
          (!tenant.requiresRegionalApproval || d.approvalStatus === "approved")
      ),
    [tenantDeliverables, tenant.trustFloor, tenant.requiresRegionalApproval]
  );

  const featuredDeliverable = eligibleDeliverables[0] ?? tenantDeliverables[0] ?? null;

  const showcaseLog = useMemo<DistributionLog[]>(() => {
    const shipped = eligibleDeliverables.slice(0, 2).map((d, index) => {
      const channel = d.recommendedChannels[0];
      return {
        id: `showcase-${d.id}-${channel}`,
        tenantId: d.tenantId,
        channel,
        deliverable: d.label,
        trustScore: d.trustScore,
        status: "shipped" as const,
        audience: CHANNELS[channel].audience,
        shippedAt: new Date(Date.now() - (index + 1) * 75 * 60_000).toISOString(),
        publicUrl: `https://preview.adiplan.ai/${d.tenantId}/${channel}/${d.id}`,
        externalId: `showcase-${channel}-${index + 1}`,
        audienceCount: channel === "trade-mag" ? 240 : 4200 + index * 1800,
        preview: buildPreview({
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
        }),
        engagement:
          channel === "trade-mag"
            ? undefined
            : {
                impressions: 5800 + index * 1700,
                qualifiedViews: 420 + index * 90,
                conversations: 28 + index * 7,
                conversions: 6 + index * 2,
                updatedAt: new Date(Date.now() - (index + 1) * 60 * 60_000).toISOString(),
              },
        dispatchMode: "mock" as const,
        rateLimited: false,
        waitMs: 0,
      };
    });

    const blockedDeliverable = tenantDeliverables.find(
      (d) =>
        d.trustScore < tenant.trustFloor ||
        (tenant.requiresRegionalApproval && d.approvalStatus !== "approved")
    );

    const blocked = blockedDeliverable
      ? [
          {
            id: `showcase-blocked-${blockedDeliverable.id}`,
            tenantId: blockedDeliverable.tenantId,
            channel: blockedDeliverable.recommendedChannels[0],
            deliverable: blockedDeliverable.label,
            trustScore: blockedDeliverable.trustScore,
            status: "blocked" as const,
            audience: CHANNELS[blockedDeliverable.recommendedChannels[0]].audience,
            shippedAt: new Date(Date.now() - 4 * 60 * 60_000).toISOString(),
            blockReason:
              blockedDeliverable.trustScore < tenant.trustFloor
                ? `Trust ${blockedDeliverable.trustScore} below floor ${tenant.trustFloor}`
                : `Regional approval still ${blockedDeliverable.approvalStatus}`,
            preview: buildPreview({
              tenantId: blockedDeliverable.tenantId,
              channel: blockedDeliverable.recommendedChannels[0],
              deliverable: blockedDeliverable.label,
              body: blockedDeliverable.body,
              subject: blockedDeliverable.label,
              hashtags: blockedDeliverable.hashtags,
              region: blockedDeliverable.region,
              species: blockedDeliverable.species,
              manager: blockedDeliverable.manager,
              trustScore: blockedDeliverable.trustScore,
              citationCount: blockedDeliverable.citationCount,
            }),
            dispatchMode: "mock" as const,
            rateLimited: false,
            waitMs: 0,
          },
        ]
      : [];

    return [...shipped, ...blocked];
  }, [eligibleDeliverables, tenantDeliverables, tenant.trustFloor, tenant.requiresRegionalApproval]);

  const displayLog = tenantLog.length > 0 ? tenantLog : showcaseLog;
  const usingShowcaseLog = tenantLog.length === 0;

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

  return (
    <WorkspaceShell>
      <main className="min-h-screen bg-adisseo-bg pb-24 text-adisseo-ink">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <div className="adi-surface rounded-3xl p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                <Share2 size={10} /> Production-readiness
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold text-adisseo-ink-strong">
                Distribution rails
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-adisseo-muted">
                Every deliverable below renders into channel-native output, not a placeholder label.
                Regional marketing can review the exact LinkedIn, WeChat, WhatsApp, email, and trade-mag
                shapes before shipping through the approved rail.
              </p>
              {usingShowcaseLog && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-adisseo-crimson/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                  Showcase mode · seeded shipped examples shown until a live dispatch happens
                </p>
              )}
            </div>
            <div
              className="rounded-2xl border border-adisseo-line p-4 text-right"

                    {featuredDeliverable && (
                      <section className="mt-8 rounded-3xl border border-adisseo-line bg-white p-6 shadow-adi-card">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-xl">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                              Featured ready-to-ship asset
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-adisseo-ink-strong">
                              {featuredDeliverable.label}
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-adisseo-muted">
                              {featuredDeliverable.body}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                                Trust {featuredDeliverable.trustScore}/100
                              </span>
                              <span className="rounded-full bg-stone-100 px-2 py-0.5 font-semibold text-stone-700">
                                {featuredDeliverable.citationCount ?? 0} citations
                              </span>
                              <span className="rounded-full bg-stone-100 px-2 py-0.5 font-semibold text-stone-700">
                                {featuredDeliverable.manager} · {featuredDeliverable.region ?? "APAC"}
                              </span>
                            </div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px] lg:max-w-[480px] lg:flex-1">
                            <MetricCard label="Eligible now" value={eligibleDeliverables.length} tone="emerald" />
                            <MetricCard label="Showcase shipped" value={displayLog.filter((row) => row.status === "shipped").length} tone="ink" />
                            <MetricCard label="Blocked by gate" value={displayLog.filter((row) => row.status === "blocked").length} tone="rose" />
                          </div>
                        </div>
                      </section>
                    )}
              style={{ borderColor: tenant.accent }}
            >
              <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
                <Building2 size={10} /> Active tenant
                        Approved-and-ready deliverables ({tenantDeliverables.length})
              <p
                className="text-lg font-black"
                        Each card below shows the channel-native artifact, the gate status, and the likely publish rail.
                {tenant.name}
              </p>
              <p className="mt-1 text-[11px] text-adisseo-muted">
                Trust ≥ {tenant.trustFloor} · {tenant.approvedChannels.length}{" "}
                channels ·{" "}
                {tenant.requiresRegionalApproval ? "Regional approval required" : "no approval gate"}
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

        </div>

        <WorkflowRibbon />

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
            Preview the channel-native card. The team copies the approved
            asset into Coschedule for the actual push.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {tenantDeliverables.map((d) => {
              const trustOk = d.trustScore >= tenant.trustFloor;
              const approvalOk =
                !tenant.requiresRegionalApproval || d.approvalStatus === "approved";
              const eligible = trustOk && approvalOk;
              return (
                <article
                  key={d.id}
                  className="adi-surface rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-adisseo-muted">
                        {d.studio} · {d.species} · {d.region ?? "APAC"}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-adisseo-ink-strong">
                        {d.label}
                      </h3>
                      <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-adisseo-muted">
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
                        Regional approval required
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
                          </div>
                        );
                      })}
                    {!eligible && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-adisseo-muted">
                        <ShieldAlert size={11} />
                        Gate failed — fix trust or approval first
                      </span>
                    )}
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-adisseo-muted">
                      Channel-ready outputs
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {channelsForTenant
                      .filter(
                        (c) =>
                          d.recommendedChannels.includes(c.id) &&
                          (filterChannel === "all" || c.id === filterChannel)
                      )
                      .map((c) => {
                        const inlinePreview = buildPreview({
                          tenantId: d.tenantId,
                          channel: c.id,
                          deliverable: d.label,
                          body: d.body,
                          subject: d.label,
                          hashtags: d.hashtags,
                          region: d.region,
                          species: d.species,
                          manager: d.manager,
                          trustScore: d.trustScore,
                          citationCount: d.citationCount,
                        });
                        return (
                          <div key={c.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
                                <ChannelIcon channel={c.id} />
                                {c.label} output
                              </p>
                              <span className="text-[10px] font-semibold text-adisseo-muted">
                                {c.blurb}
                              </span>
                            </div>
                            <ChannelPreview preview={inlinePreview} />
                          </div>
                        );
                      })}
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

        {/* Distribution log */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-adisseo-ink-strong">
              Distribution log ({displayLog.length})
            </h2>
            <p className="text-[11px] text-adisseo-muted">
              Each row links to the public URL + the channel-native preview.
              Engagement updates auto-feed the engagement-tracker.
            </p>
          </div>
          <div className="adi-surface mt-4 overflow-hidden rounded-2xl">
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
                {displayLog.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-6 text-center text-xs text-adisseo-muted"
                    >
                      No dispatches yet — inbound webhooks (Coschedule, Mailgun) populate the log here.
                    </td>
                  </tr>
                ) : (
                  displayLog.map((row) => {
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
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                                row.status === "shipped"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : row.status === "blocked"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {row.status}
                            </span>
                            {row.dispatchMode && (
                              <span
                                className={`ml-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                                  row.dispatchMode === "live"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-stone-200 text-stone-700"
                                }`}
                                title={
                                  row.dispatchMode === "live"
                                    ? "Dispatched via live channel API"
                                    : "Dispatched via mock channel adapter"
                                }
                              >
                                {row.dispatchMode}
                              </span>
                            )}
                            {row.rateLimited && (
                              <span
                                className="ml-1 inline-block rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-800"
                                title={`Rate-limited; waited ${row.waitMs ?? 0}ms`}
                              >
                                throttled
                              </span>
                            )}
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
        <section className="adi-surface mt-10 rounded-2xl p-6">
          <h2 className="text-lg font-black text-adisseo-ink-strong">
            Tenant channel matrix
          </h2>
          <p className="text-xs text-adisseo-muted">
            Each tenant's compliance team picks which channels are approved.
            APAC blocks the rest at the API level.
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
    </WorkspaceShell>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "ink";
}) {
  const cls =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-adisseo-line bg-[#FBFAF6] text-adisseo-ink-strong";
  return (
    <div className={`rounded-2xl border px-4 py-3 ${cls}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest opacity-75">
        {label}
      </p>
      <p className="mt-1 text-3xl font-black tabular-nums">{value}</p>
    </div>
  );
}
