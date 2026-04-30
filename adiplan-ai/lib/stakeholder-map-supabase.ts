/**
 * Phase 8 — stakeholder_maps ↔ Zustand bridge.
 *
 * When Supabase env vars are set *and* the user has signed in with magic link,
 * saved maps merge from Postgres on auth changes and upsert after each local save.
 * Offline demo mode is unchanged (local persist only).
 */

import type { SavedStakeholderMap } from "@/lib/saved-stakeholder-map";
import type { Db_StakeholderMap } from "@/lib/supabase-client";
import {
  currentAuthUser,
  fetchStakeholderMaps,
  getSupabase,
  isLive,
} from "@/lib/supabase-client";
import { useAdiPlanStore } from "@/lib/store";

export function dbRowToSavedStakeholderMap(row: Db_StakeholderMap): SavedStakeholderMap {
  return {
    id: row.id,
    name: row.name,
    scope: row.scope,
    scopeLabel: row.scope_label,
    regions: row.regions as SavedStakeholderMap["regions"],
    species: row.species as SavedStakeholderMap["species"],
    description: row.description ?? undefined,
    nodes: (row.nodes ?? []) as SavedStakeholderMap["nodes"],
    author: row.author ?? undefined,
    savedAt: row.saved_at,
  };
}

/** Prefer newer savedAt when both sides have the same id. Cap at 40. */
export function mergeRemoteAndLocal(
  remote: SavedStakeholderMap[],
  local: SavedStakeholderMap[]
): SavedStakeholderMap[] {
  const byId = new Map<string, SavedStakeholderMap>();
  for (const m of local) byId.set(m.id, m);
  for (const m of remote) {
    const prev = byId.get(m.id);
    if (!prev || new Date(m.savedAt).getTime() >= new Date(prev.savedAt).getTime()) {
      byId.set(m.id, m);
    }
  }
  return Array.from(byId.values())
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    .slice(0, 40);
}

export async function upsertStakeholderMapRemote(
  map: SavedStakeholderMap,
  tenantId: string
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase_not_configured" };
  const row = {
    id: map.id,
    tenant_id: tenantId,
    name: map.name,
    scope: map.scope,
    scope_label: map.scopeLabel,
    regions: map.regions ?? [],
    species: map.species ?? [],
    description: map.description ?? null,
    nodes: map.nodes,
    author: map.author ?? null,
    saved_at: map.savedAt,
  };
  const { error } = await sb.from("stakeholder_maps").upsert(row);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteStakeholderMapRemote(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase_not_configured" };
  const { error } = await sb.from("stakeholder_maps").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Fire after saveMap() updates local state. No-op without Supabase or session.
 */
export async function syncSavedStakeholderMapAfterLocalSave(mapId: string): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
}> {
  if (!isLive()) return { ok: true, skipped: true };
  const me = await currentAuthUser();
  if (!me) return { ok: true, skipped: true };

  const { activeTenantId, savedMaps } = useAdiPlanStore.getState();
  const map = savedMaps.find((m) => m.id === mapId);
  if (!map) return { ok: false, error: "map_not_found_in_store" };

  return upsertStakeholderMapRemote(map, activeTenantId);
}

export async function pullStakeholderMapsIntoStore(): Promise<void> {
  if (!isLive()) return;
  const me = await currentAuthUser();
  if (!me) return;

  const rows = await fetchStakeholderMaps(me.tenantId);
  const remote = rows.map(dbRowToSavedStakeholderMap);
  useAdiPlanStore.setState((s) => ({
    savedMaps: mergeRemoteAndLocal(remote, s.savedMaps),
  }));
}
