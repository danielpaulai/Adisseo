"use client";

import { useMemo, useState } from "react";
import { Building2, Check, ChevronDown } from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import { TENANT_LIST, getTenant, type TenantId } from "@/lib/tenant";

/**
 * Compact tenant-switcher chip for the top bar of every page that's
 * tenant-aware (Vault, Distribution, ProseQualityCard, Engagement).
 *
 * Click → popover with the four tenants, accent dot + brand name +
 * trust floor + channel count. Selecting a tenant updates the global
 * store and rescopes every downstream consumer.
 */
export function TenantSwitcher({ compact = false }: { compact?: boolean }) {
  const activeTenantId = useAdiPlanStore((s) => s.activeTenantId);
  const setActiveTenant = useAdiPlanStore((s) => s.setActiveTenant);
  const [open, setOpen] = useState(false);
  const tenant = useMemo(() => getTenant(activeTenantId), [activeTenantId]);

  return (
    <div className="relative">
      <button
        type="button"
        title="Workshop tenant simulation — rescopes brand voice, Vault slice, trust floor, and channels (not production customer tenants)."
        aria-label="Choose active workshop tenant"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md border border-adisseo-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-adisseo-ink-strong transition hover:border-adisseo-crimson"
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: tenant.accent }}
        />
        {compact ? <Building2 size={11} className="text-adisseo-muted" /> : null}
        <span>{compact ? tenant.id.toUpperCase() : tenant.name}</span>
        <ChevronDown size={11} className="text-adisseo-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-72 rounded-2xl border border-adisseo-line bg-white p-2 shadow-xl">
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
            Active tenant (workshop simulation)
          </p>
          {TENANT_LIST.map((t) => {
            const active = t.id === activeTenantId;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTenant(t.id as TenantId);
                  setOpen(false);
                }}
                className={`mt-0.5 flex w-full items-start gap-2 rounded-md p-2 text-left transition ${
                  active
                    ? "bg-adisseo-bg"
                    : "hover:bg-adisseo-bg/60"
                }`}
              >
                <span
                  className="mt-0.5 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: t.accent }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-xs font-bold text-adisseo-ink-strong">
                      {t.name}
                    </p>
                    {active && (
                      <Check size={11} className="text-emerald-600" />
                    )}
                  </div>
                  <p className="line-clamp-2 text-[10px] text-adisseo-muted">
                    {t.blurb}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[9px]">
                    <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-stone-700">
                      Trust ≥ {t.trustFloor}
                    </span>
                    <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-stone-700">
                      {t.approvedChannels.length} channels
                    </span>
                    <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-stone-700">
                      {t.species.length} species
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          <p className="mt-1 border-t border-adisseo-line pt-2 px-2 text-[10px] text-adisseo-muted">
            Switching the tenant rescopes the Vault, brand voice, trust floor,
            and approved distribution channels.
          </p>
        </div>
      )}
    </div>
  );
}
