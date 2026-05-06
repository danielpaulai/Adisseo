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
import { useAdiPlanStore } from "@/lib/store";
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
                Preview-only by design. Approved deliverables render the
                channel-native card here so regional marketing can sanity-check the layout
                before pushing into Coschedule. We do not auto-distribute —
                the team owns the publish step in the tool they already pay
                for. Inbound engagement webhooks still flow into the audit log
                + engagement-tracker.
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
                      Preview-only · push to Coschedule on approval
                    </span>
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
              Distribution log ({tenantLog.length})
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
                {tenantLog.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-6 text-center text-xs text-adisseo-muted"
                    >
                      No dispatches yet — inbound webhooks (Coschedule, Mailgun) populate the log here.
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
