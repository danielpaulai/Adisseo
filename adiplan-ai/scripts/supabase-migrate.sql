-- APAC plan — Phase 8
-- Supabase schema for Adisseo APAC pilot.
-- Region: ap-southeast-1 (Singapore) — Ricardo's preferred default.
--
-- Apply with:
--   supabase db reset    (local)
--   supabase db push     (against linked project)
--
-- Or via the SQL editor in Supabase Studio.
--
-- Idempotent: every statement is guarded with IF NOT EXISTS / OR REPLACE.

------------------------------------------------------------------------------
-- extensions
------------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

------------------------------------------------------------------------------
-- tenants
------------------------------------------------------------------------------
create table if not exists public.tenants (
  id            text primary key,                -- 'adisseo' | 'dsm-firmenich' | ...
  display_name  text not null,
  brand_voice   text not null default 'default',
  trust_floor   int  not null default 75,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

insert into public.tenants (id, display_name, brand_voice, trust_floor)
values
  ('adisseo',        'Adisseo APAC',           'adisseo',        80),
  ('dsm-firmenich',  'DSM-Firmenich (preview)', 'dsm-firmenich',  75),
  ('cargill',        'Cargill (preview)',       'cargill',        75),
  ('kemin',          'Kemin (preview)',         'kemin',          75)
on conflict (id) do nothing;

------------------------------------------------------------------------------
-- stakeholder_maps  (Phase 3 — saved + recallable)
------------------------------------------------------------------------------
create table if not exists public.stakeholder_maps (
  id            text primary key,
  tenant_id     text not null references public.tenants(id) on delete cascade,
  name          text not null,
  scope         text not null check (scope in ('country','group','company')),
  scope_label   text not null,
  regions       text[] not null default '{}',
  species       text[] not null default '{}',
  description   text,
  nodes         jsonb not null default '[]'::jsonb,
  author        text,
  saved_at      timestamptz not null default now()
);

create index if not exists stakeholder_maps_tenant_idx
  on public.stakeholder_maps (tenant_id, saved_at desc);

------------------------------------------------------------------------------
-- articles  (Phase 2 — 3-axis scoring cache)
------------------------------------------------------------------------------
create table if not exists public.articles (
  id              text primary key,
  tenant_id       text not null references public.tenants(id) on delete cascade,
  competitor      text not null,
  title           text not null,
  summary         text not null,
  url             text not null,
  published_at    date not null,
  region          text not null,
  language        text not null,
  species         text[] not null default '{}',
  tags            text[] not null default '{}',
  scored_at       timestamptz,
  cbi_top         text,
  csf_top         text,
  persona_top     text,
  composite       int
);

create index if not exists articles_tenant_idx
  on public.articles (tenant_id, published_at desc);

------------------------------------------------------------------------------
-- frames  (Strategic frame composer)
------------------------------------------------------------------------------
create table if not exists public.frames (
  id              text primary key,
  tenant_id       text not null references public.tenants(id) on delete cascade,
  cbi_id          text not null,
  persona_id      text not null,
  one_line        text not null,
  pain            jsonb not null,
  promise         jsonb not null,
  proof           jsonb not null,
  proposition     jsonb not null,
  enterprise_persona text,
  enterprise_insight text,
  composed_at     timestamptz not null default now(),
  composed_by     text
);

------------------------------------------------------------------------------
-- deliverables  (every shipped piece — feeds engagement tracker)
------------------------------------------------------------------------------
create table if not exists public.deliverables (
  id              text primary key,
  tenant_id       text not null references public.tenants(id) on delete cascade,
  kind            text not null,                  -- leaflet | email | carousel | manga | short | voice-memo | frame
  title           text not null,
  language        text not null,
  region          text not null,
  species         text not null,
  audience        text,
  owner           text,
  sent_at         timestamptz not null default now(),
  reach           int  not null default 0,        -- impressions / delivered / plays / downloads
  qualified       int  not null default 0,
  conversations   int  not null default 0,
  conversions     int  not null default 0,
  trust_score     int,
  anchor_signal   text,
  channel         text,                           -- linkedin | email | wechat | whatsapp | trade-mag | pdf-download
  channel_metrics jsonb                           -- LinkedInMetrics | EmailMetrics | ...
);

create index if not exists deliverables_tenant_idx
  on public.deliverables (tenant_id, sent_at desc);

------------------------------------------------------------------------------
-- distribution_log  (Phase 5 — per-channel preview + dispatch)
------------------------------------------------------------------------------
create table if not exists public.distribution_log (
  id              text primary key,
  tenant_id       text not null references public.tenants(id) on delete cascade,
  channel         text not null,
  deliverable     text not null,
  approval_id     text,
  trust_score     int,
  status          text not null check (status in ('queued','shipped','blocked')),
  block_reason    text,
  audience        text,
  shipped_at      timestamptz not null default now(),
  reach           int,
  preview         jsonb,
  public_url      text,
  body            text
);

------------------------------------------------------------------------------
-- inline_edits  (Phase 5 — every section edit is auditable)
------------------------------------------------------------------------------
create table if not exists public.inline_edits (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       text not null references public.tenants(id) on delete cascade,
  section_id      text not null,
  section_label   text,
  user_email      text not null,
  mode            text not null check (mode in ('manual','rewrite','translate')),
  language        text not null default 'en',
  before_text     text,
  after_text      text,
  created_at      timestamptz not null default now()
);

create index if not exists inline_edits_section_idx
  on public.inline_edits (section_id, created_at desc);

------------------------------------------------------------------------------
-- engagement_log  (Phase 7 — webhook callbacks: Mailgun events, LinkedIn poll)
------------------------------------------------------------------------------
create table if not exists public.engagement_log (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       text not null references public.tenants(id) on delete cascade,
  deliverable_id  text references public.deliverables(id) on delete set null,
  channel         text not null,
  event_type      text not null,                  -- delivered | opened | clicked | shared | replied | downloaded
  occurred_at     timestamptz not null default now(),
  payload         jsonb
);

create index if not exists engagement_log_deliverable_idx
  on public.engagement_log (deliverable_id, occurred_at desc);

------------------------------------------------------------------------------
-- vault_entries  (Real Adisseo / poultry corpus + per-tenant vault)
------------------------------------------------------------------------------
create table if not exists public.vault_entries (
  id              text primary key,
  tenant_id       text not null references public.tenants(id) on delete cascade,
  kind            text not null,
  title           text not null,
  summary         text not null,
  metrics         jsonb,
  source_url      text not null,
  verified        boolean not null default false,
  date            date,
  regions         text[] not null default '{}',
  species         text[] not null default '{}',
  tags            text[] not null default '{}',
  attribution     text
);

create index if not exists vault_entries_tenant_idx
  on public.vault_entries (tenant_id);

------------------------------------------------------------------------------
-- approval_requests  (Phase 8 — HQ brand-guardrail queue, synced from client)
------------------------------------------------------------------------------
create table if not exists public.approval_requests (
  id                  text primary key,
  tenant_id           text not null references public.tenants(id) on delete cascade,
  kind                text not null,
  title               text not null,
  summary             text not null,
  sender              text not null,
  href                text,
  payload             jsonb,
  status              text not null check (status in ('pending','approved','rejected')),
  sent_at             timestamptz not null,
  reviewed_at         timestamptz,
  reviewer_comment    text,
  reviewer            text
);

create index if not exists approval_requests_tenant_idx
  on public.approval_requests (tenant_id, sent_at desc);

------------------------------------------------------------------------------
-- profiles  (auth users → tenant + role binding)
------------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  email           text not null unique,
  full_name       text,
  role            text not null check (role in ('ricardo-approver','species-manager','viewer','daniel-admin')),
  tenant_id       text not null references public.tenants(id) on delete cascade,
  created_at      timestamptz not null default now()
);

------------------------------------------------------------------------------
-- RLS  (defence-in-depth — every read/write scoped by tenant_id)
------------------------------------------------------------------------------
alter table public.stakeholder_maps    enable row level security;
alter table public.articles             enable row level security;
alter table public.frames               enable row level security;
alter table public.deliverables         enable row level security;
alter table public.distribution_log     enable row level security;
alter table public.inline_edits         enable row level security;
alter table public.engagement_log       enable row level security;
alter table public.vault_entries        enable row level security;
alter table public.approval_requests    enable row level security;
alter table public.profiles             enable row level security;

drop policy if exists "tenant_read_self" on public.stakeholder_maps;
create policy "tenant_read_self" on public.stakeholder_maps
  for select using (
    tenant_id = (select tenant_id from public.profiles where user_id = auth.uid())
  );
drop policy if exists "tenant_write_self" on public.stakeholder_maps;
create policy "tenant_write_self" on public.stakeholder_maps
  for insert with check (
    tenant_id = (select tenant_id from public.profiles where user_id = auth.uid())
  );
drop policy if exists "tenant_update_self" on public.stakeholder_maps;
create policy "tenant_update_self" on public.stakeholder_maps
  for update using (
    tenant_id = (select tenant_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "tenant_delete_self" on public.stakeholder_maps;
create policy "tenant_delete_self" on public.stakeholder_maps
  for delete using (
    tenant_id = (select tenant_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "approval_req_select" on public.approval_requests;
create policy "approval_req_select" on public.approval_requests
  for select using (
    tenant_id = (select tenant_id from public.profiles where user_id = auth.uid())
  );
drop policy if exists "approval_req_insert" on public.approval_requests;
create policy "approval_req_insert" on public.approval_requests
  for insert with check (
    tenant_id = (select tenant_id from public.profiles where user_id = auth.uid())
  );
drop policy if exists "approval_req_update" on public.approval_requests;
create policy "approval_req_update" on public.approval_requests
  for update using (
    tenant_id = (select tenant_id from public.profiles where user_id = auth.uid())
  );

-- Mirror policies for the rest of the per-tenant tables. Kept inline rather
-- than via DO-blocks so the policy names are explicit in the dashboard.
drop policy if exists "deliverables_read" on public.deliverables;
create policy "deliverables_read"  on public.deliverables  for select using (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "deliverables_write" on public.deliverables;
create policy "deliverables_write" on public.deliverables  for insert with check (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "distribution_read" on public.distribution_log;
create policy "distribution_read"  on public.distribution_log for select using (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "distribution_write" on public.distribution_log;
create policy "distribution_write" on public.distribution_log for insert with check (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "vault_read" on public.vault_entries;
create policy "vault_read"         on public.vault_entries for select using (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "vault_write" on public.vault_entries;
create policy "vault_write"        on public.vault_entries for insert with check (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "inline_edit_read" on public.inline_edits;
create policy "inline_edit_read"   on public.inline_edits  for select using (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "inline_edit_write" on public.inline_edits;
create policy "inline_edit_write"  on public.inline_edits  for insert with check (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "engagement_read" on public.engagement_log;
create policy "engagement_read"    on public.engagement_log for select using (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "engagement_write" on public.engagement_log;
create policy "engagement_write"   on public.engagement_log for insert with check (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "articles_read" on public.articles;
create policy "articles_read"      on public.articles      for select using (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "articles_write" on public.articles;
create policy "articles_write"     on public.articles      for insert with check (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "frames_read" on public.frames;
create policy "frames_read"        on public.frames        for select using (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));
drop policy if exists "frames_write" on public.frames;
create policy "frames_write"       on public.frames        for insert with check (tenant_id = (select tenant_id from public.profiles where user_id = auth.uid()));

-- profiles — every user can read their own row
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (user_id = auth.uid());

------------------------------------------------------------------------------
-- on auth.users insert — auto-create a profile row from email allowlist
------------------------------------------------------------------------------
create or replace function public.bootstrap_profile()
returns trigger language plpgsql security definer as $$
declare
  v_role text := 'viewer';
  v_tenant text := 'adisseo';
  v_name text := null;
begin
  if lower(new.email) in (
    'ricardo@adisseo.com',
    'ricardo.cardenas@adisseo.com'
  ) then
    v_role := 'ricardo-approver';
    v_name := 'Ricardo (APAC head)';
  elsif lower(new.email) in (
    'vish@adisseo.com',
    'aileen@adisseo.com',
    'antoine@adisseo.com',
    'claire@adisseo.com'
  ) then
    v_role := 'species-manager';
    v_name := split_part(new.email,'@',1);
  elsif lower(new.email) = 'daniel@adi-plan.ai' then
    v_role := 'daniel-admin';
    v_name := 'Daniel (admin)';
  end if;

  insert into public.profiles (user_id, email, full_name, role, tenant_id)
  values (new.id, new.email, v_name, v_role, v_tenant)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.bootstrap_profile();
