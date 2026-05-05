/**
 * APAC plan — Pilot persistence
 *
 * Supabase client (Singapore region by default).
 *
 * Two modes:
 *
 *   1. LOCAL_MODE  (no env vars set)
 *      The existing Zustand `persist` store keeps owning state. The
 *      module exports `null` as the client and `false` as `isLive()`,
 *      so callers fall back to the local-first path. Demos run offline.
 *
 *   2. SUPABASE_MODE (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *      A real `SupabaseClient` is returned. Tables are read/written
 *      through the typed helpers below; auth uses magic-link.
 *
 * Server-side API routes can also pull a service-role client via
 * `getServiceSupabase()` — that one needs SUPABASE_SERVICE_ROLE_KEY and
 * is gated behind a server check.
 */

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

export type ApacRole = "ricardo-approver" | "species-manager" | "viewer" | "daniel-admin";

export interface ApacAuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: ApacRole;
  tenantId: string;
}

/* -------------------------------------------------------------------------- */
/*  Browser-side singleton                                                     */
/* -------------------------------------------------------------------------- */

let _client: SupabaseClient | null | undefined;

function readPublicEnv(): { url?: string; anon?: string } {
  if (typeof window === "undefined") {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
  }
  // Next.js inlines NEXT_PUBLIC_* at build time — runtime read is safe.
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function getSupabase(): SupabaseClient | null {
  if (_client !== undefined) return _client;
  const { url, anon } = readPublicEnv();
  if (!url || !anon) {
    _client = null;
    return null;
  }
  _client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { "x-apac-app": "adiplan-ai" },
    },
  });
  return _client;
}

export function isLive(): boolean {
  return getSupabase() !== null;
}

/* -------------------------------------------------------------------------- */
/*  Server-side service-role client (RLS-bypass writes)                        */
/* -------------------------------------------------------------------------- */

export function getServiceSupabase(): SupabaseClient | null {
  if (typeof window !== "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { "x-apac-app": "adiplan-ai-server" },
    },
  });
}

/* -------------------------------------------------------------------------- */
/*  Auth helpers                                                               */
/* -------------------------------------------------------------------------- */

const ROLE_ALLOWLIST: Record<string, { role: ApacRole; tenantId: string; fullName: string }> = {
  // Ricardo — the demo gate. Update domain when his real address lands.
  "ricardo@adisseo.com": {
    role: "ricardo-approver",
    tenantId: "adisseo",
    fullName: "Ricardo (APAC head)",
  },
  "ricardo.cardenas@adisseo.com": {
    role: "ricardo-approver",
    tenantId: "adisseo",
    fullName: "Ricardo (APAC head)",
  },
  "ricardo.communod@adisseo.com": {
    role: "ricardo-approver",
    tenantId: "adisseo",
    fullName: "Ricardo (APAC head)",
  },
  // Species managers — Vish / Aileen / Antoine / Claire.
  "vish@adisseo.com": {
    role: "species-manager",
    tenantId: "adisseo",
    fullName: "Vish · Poultry",
  },
  "aileen@adisseo.com": {
    role: "species-manager",
    tenantId: "adisseo",
    fullName: "Aileen · Aqua",
  },
  "antoine@adisseo.com": {
    role: "species-manager",
    tenantId: "adisseo",
    fullName: "Antoine · Ruminants",
  },
  "claire@adisseo.com": {
    role: "species-manager",
    tenantId: "adisseo",
    fullName: "Claire · Swine",
  },
  // Daniel — admin
  "daniel@adi-plan.ai": {
    role: "daniel-admin",
    tenantId: "adisseo",
    fullName: "Daniel (admin)",
  },
};

export function resolveAcl(user: User | null): ApacAuthUser | null {
  if (!user || !user.email) return null;
  const meta = ROLE_ALLOWLIST[user.email.toLowerCase()];
  if (!meta) {
    return {
      id: user.id,
      email: user.email,
      role: "viewer",
      tenantId: "adisseo",
    };
  }
  return {
    id: user.id,
    email: user.email,
    fullName: meta.fullName,
    role: meta.role,
    tenantId: meta.tenantId,
  };
}

export async function signInWithMagicLink(
  email: string,
  redirectTo?: string
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase_not_configured" };
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo ?? (typeof window !== "undefined" ? window.location.origin : undefined),
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
}

export async function currentAuthUser(): Promise<ApacAuthUser | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return resolveAcl(data.user ?? null);
}

/* -------------------------------------------------------------------------- */
/*  Table types — mirror the migration in scripts/supabase-migrate.sql        */
/* -------------------------------------------------------------------------- */

export interface Db_StakeholderMap {
  id: string;
  tenant_id: string;
  name: string;
  scope: "country" | "group" | "company";
  scope_label: string;
  regions: string[];
  species: string[];
  description: string | null;
  nodes: { stakeholderId: string; trend?: string; note?: string }[];
  author: string | null;
  saved_at: string;
}

export interface Db_DistributionLog {
  id: string;
  tenant_id: string;
  channel: string;
  deliverable: string;
  trust_score: number | null;
  status: "queued" | "shipped" | "blocked";
  audience: string | null;
  shipped_at: string;
  reach: number | null;
}

export interface Db_InlineEdit {
  id: string;
  tenant_id: string;
  section_id: string;
  section_label: string;
  user_email: string;
  mode: "manual" | "rewrite" | "translate";
  language: string;
  before_text: string;
  after_text: string;
  created_at: string;
}

export interface Db_Article {
  id: string;
  tenant_id: string;
  competitor: string;
  title: string;
  summary: string;
  url: string;
  published_at: string;
  region: string;
  language: string;
  species: string[];
  tags: string[];
  scored_at: string | null;
  cbi_top: string | null;
  csf_top: string | null;
  persona_top: string | null;
  composite: number | null;
}

/* -------------------------------------------------------------------------- */
/*  Convenience reads / writes                                                */
/* -------------------------------------------------------------------------- */

export async function fetchStakeholderMaps(
  tenantId: string
): Promise<Db_StakeholderMap[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("stakeholder_maps")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("saved_at", { ascending: false })
    .limit(40);
  if (error || !data) return [];
  return data as Db_StakeholderMap[];
}

export async function pushInlineEdit(
  edit: Omit<Db_InlineEdit, "id" | "created_at">
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase_not_configured" };
  const { error } = await sb.from("inline_edits").insert(edit);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
