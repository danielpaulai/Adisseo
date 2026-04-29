"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Send,
  Share2,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import {
  CHANNEL_LIST,
  CHANNELS,
  TENANT_LIST,
  getTenant,
  type DistributionChannel,
  type TenantId,
} from "@/lib/tenant";
import {
  DEMO_DELIVERABLES,
  type DemoDeliverable,
} from "@/lib/distribution";
import { useAdiPlanStore } from "@/lib/store";

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
  const pushActivity = useAdiPlanStore((s) => s.pushActivity);

  const [filterChannel, setFilterChannel] = useState<DistributionChannel | "all">(
    "all"
  );
  const [dispatch, setDispatch] = useState<DispatchState>({ status: "idle" });

  const tenantDeliverables = useMemo(
    () => DEMO_DELIVERABLES.filter((d) => d.tenantId === activeTenantId),
    [activeTenantId]
  );

  const channelsForTenant = CHANNEL_LIST.filter((c) =>
    tenant.approvedChannels.includes(c.id)
  );

  const tenantLog = distribution.filter((l) => l.tenantId === activeTenantId);

  async function ship(deliverable: DemoDeliverable, channel: DistributionChannel) {
    setDispatch({
      status: "shipping",
      channel,
      deliverableId: deliverable.id,
    });
    try {
      const res = await fetch("/api/distribute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tenantId: deliverable.tenantId,
          channel,
          deliverable: deliverable.label,
          trustScore: deliverable.trustScore,
          approvalStatus: deliverable.approvalStatus,
          species: deliverable.species,
        }),
      });
      const json = await res.json();
      if (json.status === "shipped") {
        pushDistribution({
          tenantId: deliverable.tenantId,
          channel,
          deliverable: deliverable.label,
          trustScore: deliverable.trustScore,
          status: "shipped",
          audience: json.audience,
        });
        pushActivity({
          kind: "deliverable",
          title: `Shipped — ${deliverable.label}`,
          detail: `${getTenant(deliverable.tenantId).name} → ${
            CHANNELS[channel].label
          } · trust ${deliverable.trustScore}`,
          tone: "good",
          href: "/distribution",
        });
        toast.success(`Shipped to ${CHANNELS[channel].label}`, {
          description: `${getTenant(deliverable.tenantId).name} · ${
            json.audience ?? CHANNELS[channel].audience
          }`,
        });
        setDispatch({
          status: "shipped",
          channel,
          deliverableId: deliverable.id,
        });
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
      setDispatch({ status: "blocked", reason: msg, channel, deliverableId: deliverable.id });
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
                <Share2 size={10} /> Phase 4 · Live
              </p>
              <h1 className="mt-3 text-3xl font-black text-adisseo-ink-strong">
                Distribution rails
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-adisseo-muted">
                Once a deliverable clears the trust gate <em>and</em> HQ approval,
                AdiPlan can route it to the channels the active tenant approves.
                Every dispatch is logged — trust score, channel, audience, blocker
                — so legal can audit who shipped what.
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
                Trust floor {tenant.trustFloor} · {tenant.approvedChannels.length}{" "}
                channels · {tenant.requiresHqApproval ? "HQ approval required" : "no approval gate"}
              </p>
            </div>
          </div>

          {/* Channel chips */}
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
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
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
                  {c.label}
                  {!approved && (
                    <span className="ml-1 inline-flex items-center text-[9px] uppercase tracking-widest">
                      blocked
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deliverables grid */}
        <section className="mt-10">
          <h2 className="text-lg font-black text-adisseo-ink-strong">
            Approved-and-ready deliverables ({tenantDeliverables.length})
          </h2>
          <p className="text-xs text-adisseo-muted">
            Each card shows the deliverable's trust composite, its approval status,
            and the recommended channel. Click a channel to ship.
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
                        {d.studio} · {d.species}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-adisseo-ink-strong">
                        {d.label}
                      </h3>
                      <p className="mt-1 text-[11px] text-adisseo-muted">
                        Manager: {d.manager}
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
                      Recommended: {d.recommendedChannels.map((c) => CHANNELS[c].label).join(", ")}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {channelsForTenant
                      .filter((c) => filterChannel === "all" || c.id === filterChannel)
                      .map((c) => {
                        const isShipping =
                          dispatch.status === "shipping" &&
                          dispatch.channel === c.id &&
                          dispatch.deliverableId === d.id;
                        const justShipped =
                          dispatch.status === "shipped" &&
                          dispatch.channel === c.id &&
                          dispatch.deliverableId === d.id;
                        const justBlocked =
                          dispatch.status === "blocked" &&
                          dispatch.channel === c.id &&
                          dispatch.deliverableId === d.id;
                        const recommended = d.recommendedChannels.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            disabled={!eligible || isShipping}
                            onClick={() => ship(d, c.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              justShipped
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : justBlocked
                                  ? "border-rose-500 bg-rose-500 text-white"
                                  : recommended
                                    ? "border-adisseo-crimson text-adisseo-crimson hover:bg-adisseo-crimson hover:text-white"
                                    : "border-adisseo-line text-adisseo-ink hover:border-adisseo-crimson"
                            }`}
                            title={c.blurb}
                          >
                            {justShipped ? (
                              <CheckCircle2 size={11} />
                            ) : justBlocked ? (
                              <XCircle size={11} />
                            ) : isShipping ? (
                              <Sparkles size={11} className="animate-pulse" />
                            ) : (
                              <Send size={11} />
                            )}
                            {isShipping
                              ? `Shipping to ${c.label}…`
                              : justShipped
                                ? `Shipped to ${c.label}`
                                : `Ship to ${c.label}`}
                          </button>
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
                No demo deliverables seeded for {tenant.name} yet. Switch tenant to see
                others.
              </p>
            )}
          </div>
        </section>

        {/* Distribution log */}
        <section className="mt-10">
          <h2 className="text-lg font-black text-adisseo-ink-strong">
            Distribution log ({tenantLog.length})
          </h2>
          <p className="text-xs text-adisseo-muted">
            Every successful + blocked dispatch under the active tenant.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-adisseo-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-widest text-adisseo-muted">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Channel</th>
                  <th className="px-3 py-2">Deliverable</th>
                  <th className="px-3 py-2 text-right">Trust</th>
                </tr>
              </thead>
              <tbody>
                {tenantLog.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-xs text-adisseo-muted"
                    >
                      No dispatches yet — ship a deliverable above to populate the log.
                    </td>
                  </tr>
                ) : (
                  tenantLog.map((row) => (
                    <tr
                      key={row.id}
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
                        {row.audience && row.status === "shipped" && (
                          <p className="mt-0.5 text-[11px] text-adisseo-muted">
                            Audience · {row.audience}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-xs font-bold text-adisseo-ink-strong">
                        {row.trustScore ?? "—"}
                      </td>
                    </tr>
                  ))
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
                  <tr
                    key={t.id}
                    className="border-t border-adisseo-line"
                  >
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
