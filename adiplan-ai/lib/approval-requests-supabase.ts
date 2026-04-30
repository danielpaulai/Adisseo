/**
 * Phase 8 — approval_requests ↔ Zustand (HQ queue).
 */

import type { ApprovalKind, ApprovalRequest } from "@/lib/store";
import {
  currentAuthUser,
  getSupabase,
  isLive,
} from "@/lib/supabase-client";
import { useAdiPlanStore } from "@/lib/store";

export interface Db_ApprovalRequestRow {
  id: string;
  tenant_id: string;
  kind: string;
  title: string;
  summary: string;
  sender: string;
  href: string | null;
  payload: Record<string, unknown> | null;
  status: string;
  sent_at: string;
  reviewed_at: string | null;
  reviewer_comment: string | null;
  reviewer: string | null;
}

function approvalRevision(a: ApprovalRequest): number {
  const sent = new Date(a.sentAt).getTime();
  const rev = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
  return Math.max(sent, rev);
}

function sanitizePayload(
  p?: ApprovalRequest["payload"]
): Record<string, unknown> | null {
  if (!p) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined) out[k] = v as string | number | boolean;
  }
  return Object.keys(out).length ? out : null;
}

export function dbRowToApprovalRequest(row: Db_ApprovalRequestRow): ApprovalRequest {
  const payload = row.payload ?? undefined;
  return {
    id: row.id,
    kind: row.kind as ApprovalKind,
    title: row.title,
    summary: row.summary,
    sender: row.sender,
    href: row.href ?? undefined,
    payload: payload as ApprovalRequest["payload"],
    status: row.status as ApprovalRequest["status"],
    sentAt: row.sent_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewerComment: row.reviewer_comment ?? undefined,
    reviewer: row.reviewer ?? undefined,
  };
}

export function mergeRemoteAndLocalApprovals(
  remote: ApprovalRequest[],
  local: ApprovalRequest[]
): ApprovalRequest[] {
  const byId = new Map<string, ApprovalRequest>();
  for (const a of local) byId.set(a.id, a);
  for (const a of remote) {
    const prev = byId.get(a.id);
    if (!prev || approvalRevision(a) >= approvalRevision(prev)) byId.set(a.id, a);
  }
  return Array.from(byId.values())
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    .slice(0, 60);
}

export async function fetchApprovalRequests(
  tenantId: string
): Promise<Db_ApprovalRequestRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("approval_requests")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sent_at", { ascending: false })
    .limit(60);
  if (error || !data) return [];
  return data as Db_ApprovalRequestRow[];
}

export async function upsertApprovalRequestRemote(
  row: ApprovalRequest,
  tenantId: string
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase_not_configured" };
  const dbRow = {
    id: row.id,
    tenant_id: tenantId,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    sender: row.sender,
    href: row.href ?? null,
    payload: sanitizePayload(row.payload),
    status: row.status,
    sent_at: row.sentAt,
    reviewed_at: row.reviewedAt ?? null,
    reviewer_comment: row.reviewerComment ?? null,
    reviewer: row.reviewer ?? null,
  };
  const { error } = await sb.from("approval_requests").upsert(dbRow);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function pullApprovalRequestsIntoStore(): Promise<void> {
  if (!isLive()) return;
  const me = await currentAuthUser();
  if (!me) return;
  const rows = await fetchApprovalRequests(me.tenantId);
  const remote = rows.map(dbRowToApprovalRequest);
  useAdiPlanStore.setState((s) => ({
    approvals: mergeRemoteAndLocalApprovals(remote, s.approvals),
  }));
}

export async function syncApprovalAfterLocalMutation(id: string): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
}> {
  if (!isLive()) return { ok: true, skipped: true };
  const me = await currentAuthUser();
  if (!me) return { ok: true, skipped: true };

  const { activeTenantId, approvals } = useAdiPlanStore.getState();
  const row = approvals.find((a) => a.id === id);
  if (!row) return { ok: false, error: "approval_not_found_in_store" };
  return upsertApprovalRequestRemote(row, activeTenantId);
}
