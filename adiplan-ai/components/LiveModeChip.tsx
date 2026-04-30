"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RadioTower } from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import { CHANNEL_LIST } from "@/lib/tenant";

interface LiveStatus {
  tenant: string;
  channels: { channel: string; live: boolean }[];
  liveCount: number;
  totalCount: number;
}

/**
 * LiveModeChip — visual indicator showing how many of the active
 * tenant's channels are wired to live APIs vs. running on mocks.
 *
 * Reads from /api/credential-status so it can hit process.env on the
 * server. Refreshes whenever the active tenant changes.
 */
export function LiveModeChip() {
  const tenantId = useAdiPlanStore((s) => s.activeTenantId);
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/credential-status?tenant=${tenantId}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setStatus(j);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus({
          tenant: tenantId,
          channels: CHANNEL_LIST.map((c) => ({ channel: c.id, live: false })),
          liveCount: 0,
          totalCount: CHANNEL_LIST.length,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const isAllMock = !loading && (status?.liveCount ?? 0) === 0;
  const isAllLive =
    !loading &&
    status?.liveCount !== undefined &&
    status.totalCount === status.liveCount;

  return (
    <Link
      href="/credentials"
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-bold transition ${
        isAllLive
          ? "border-emerald-500 bg-emerald-500 text-white"
          : isAllMock
            ? "border-adisseo-line bg-stone-50 text-adisseo-ink"
            : "border-amber-500 bg-amber-50 text-amber-900"
      }`}
      title="Channel-credential matrix"
    >
      <RadioTower size={11} />
      {loading ? (
        "…"
      ) : (
        <>
          {isAllMock ? "Mock mode" : isAllLive ? "Live" : "Hybrid"} ·{" "}
          {status?.liveCount ?? 0}/{status?.totalCount ?? 5}
        </>
      )}
    </Link>
  );
}
