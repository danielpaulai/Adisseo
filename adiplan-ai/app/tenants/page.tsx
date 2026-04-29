"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers,
  Shield,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import {
  TENANT_LIST,
  CHANNEL_LIST,
  type TenantConfig,
} from "@/lib/tenant";
import { BRAND_VOICES } from "@/lib/brand-voice";
import { seededVault } from "@/lib/vault";
import { DEMO_DELIVERABLES } from "@/lib/distribution";
import { useAdiPlanStore } from "@/lib/store";

function tenantStats(t: TenantConfig) {
  const vaultEntries = seededVault.filter(
    (e) => (e.tenantId ?? "adisseo") === t.id
  ).length;
  const deliverables = DEMO_DELIVERABLES.filter((d) => d.tenantId === t.id).length;
  const voice = BRAND_VOICES[t.brandVoice];
  return { vaultEntries, deliverables, voice };
}

export default function TenantsPage() {
  const activeTenantId = useAdiPlanStore((s) => s.activeTenantId);
  const setActiveTenant = useAdiPlanStore((s) => s.setActiveTenant);

  const summary = useMemo(() => {
    return {
      tenants: TENANT_LIST.length,
      live: TENANT_LIST.filter((t) => t.id === "adisseo").length,
      blueprints: TENANT_LIST.length - 1,
      vaultPartitions: new Set(seededVault.map((e) => e.tenantId ?? "adisseo")).size,
      deliverables: DEMO_DELIVERABLES.length,
    };
  }, []);

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
          <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            <Building2 size={10} /> Phase 4 · Multi-tenant
          </p>
          <h1 className="mt-3 text-3xl font-black text-adisseo-ink-strong">
            Tenant directory
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-adisseo-muted">
            AdiPlan is tenant-aware. Adisseo runs live today; DSM-Firmenich,
            Cargill, and Kemin are blueprinted with their own brand voice,
            Vault scope, trust floor, approved channels, and reviewer label.
            Switching the tenant in the top-bar rescopes every consumer:
            ProseQualityCard, Vault, Distribution, Engagement, Approval queue.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { label: "Tenants", value: summary.tenants },
              { label: "Live", value: summary.live },
              { label: "Blueprinted", value: summary.blueprints },
              { label: "Vault partitions", value: summary.vaultPartitions },
              { label: "Demo deliverables", value: summary.deliverables },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-adisseo-line p-3 text-center"
              >
                <p className="text-2xl font-black text-adisseo-ink-strong">
                  {s.value}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-adisseo-muted">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {TENANT_LIST.map((t) => {
            const stats = tenantStats(t);
            const isActive = t.id === activeTenantId;
            return (
              <article
                key={t.id}
                className={`rounded-2xl border p-6 shadow-sm transition ${
                  isActive
                    ? "border-2 bg-white"
                    : "border-adisseo-line bg-white"
                }`}
                style={isActive ? { borderColor: t.accent } : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
                      style={{ backgroundColor: t.accent }}
                    >
                      <Building2 size={10} />
                      {t.id === "adisseo" ? "Live" : "Blueprint"}
                    </span>
                    <h2
                      className="mt-2 text-2xl font-black"
                      style={{ color: t.accent }}
                    >
                      {t.name}
                    </h2>
                    <p className="mt-1 text-xs text-adisseo-muted">{t.blurb}</p>
                  </div>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-lg border border-adisseo-line p-2">
                    <p className="flex items-center gap-1 font-bold text-adisseo-ink-strong">
                      <Shield size={11} /> Trust floor
                    </p>
                    <p className="mt-0.5 text-adisseo-muted">
                      Composite ≥ {t.trustFloor} · warning &lt; {t.warningFloor}
                    </p>
                  </div>
                  <div className="rounded-lg border border-adisseo-line p-2">
                    <p className="flex items-center gap-1 font-bold text-adisseo-ink-strong">
                      <Users size={11} /> Reviewer
                    </p>
                    <p className="mt-0.5 text-adisseo-muted">
                      {t.reviewerLabel}
                    </p>
                  </div>
                  <div className="rounded-lg border border-adisseo-line p-2">
                    <p className="flex items-center gap-1 font-bold text-adisseo-ink-strong">
                      <Layers size={11} /> Vault entries
                    </p>
                    <p className="mt-0.5 text-adisseo-muted">
                      {stats.vaultEntries} owned · mode {t.vaultMode}
                    </p>
                  </div>
                  <div className="rounded-lg border border-adisseo-line p-2">
                    <p className="flex items-center gap-1 font-bold text-adisseo-ink-strong">
                      <Building2 size={11} /> Brand voice
                    </p>
                    <p className="mt-0.5 text-adisseo-muted">
                      {stats.voice?.label ?? t.brandVoice}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
                    Approved channels
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {CHANNEL_LIST.map((c) => {
                      const approved = t.approvedChannels.includes(c.id);
                      return (
                        <span
                          key={c.id}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            approved
                              ? "border-emerald-500 text-emerald-700"
                              : "border-adisseo-line bg-stone-50 text-adisseo-muted line-through"
                          }`}
                        >
                          {c.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
                    Home regions
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {t.homeRegions.map((r) => (
                      <span
                        key={r}
                        className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <button
                    onClick={() => setActiveTenant(t.id)}
                    disabled={isActive}
                    className="inline-flex items-center gap-1.5 rounded-full border border-adisseo-line px-3 py-1.5 text-[11px] font-semibold text-adisseo-ink transition hover:border-adisseo-crimson disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isActive ? "Already active" : "Make active"}
                  </button>
                  <Link
                    href="/distribution"
                    className="inline-flex items-center gap-1.5 rounded-full bg-adisseo-ink-strong px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-adisseo-crimson"
                  >
                    Open distribution rails
                    <ArrowRight size={11} />
                  </Link>
                  <Link
                    href="/vault"
                    className="text-[11px] font-semibold text-adisseo-muted underline-offset-2 hover:text-adisseo-crimson hover:underline"
                  >
                    Vault →
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-2xl border border-adisseo-line bg-white p-6">
          <h2 className="text-lg font-black text-adisseo-ink-strong">
            What "tenant-aware" actually means here
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-adisseo-muted">
            <li>
              <strong>ProseQualityCard</strong> picks the brand-voice config
              from the active tenant, so DSM hype words and Adisseo hype words
              are scored against different rule sets.
            </li>
            <li>
              <strong>Vault</strong> filters to the active tenant by default;
              cross-tenant entries stay invisible to keep R&D leakage down.
            </li>
            <li>
              <strong>Distribution gate</strong> reads
              <code className="ml-1 rounded bg-stone-100 px-1 py-0.5 text-[11px]">
                tenant.approvedChannels
              </code>{" "}
              and{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">
                tenant.trustFloor
              </code>{" "}
              before allowing a dispatch.
            </li>
            <li>
              <strong>Approval queue</strong> shows the tenant's named reviewer
              label so the right desk knows what's waiting.
            </li>
            <li>
              <strong>Engagement tracker</strong> partitions by tenant — DSM
              numbers don't mix with Adisseo numbers.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
