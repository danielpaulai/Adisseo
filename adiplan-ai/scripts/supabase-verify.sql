-- Phase 8 — sanity check that scripts/supabase-migrate.sql was applied.
-- Run in Supabase SQL Editor or: npx supabase db query --linked --file scripts/supabase-verify.sql

WITH
expected_extensions(extname) AS (
  SELECT unnest(ARRAY['uuid-ossp','pgcrypto']::text[])
),
expected_tables(relname) AS (
  SELECT unnest(ARRAY[
    'tenants','stakeholder_maps','articles','frames','deliverables',
    'distribution_log','inline_edits','engagement_log','vault_entries',
    'approval_requests','profiles'
  ]::text[])
),
expected_policies(tablename, policyname) AS (
  SELECT * FROM (VALUES
    ('stakeholder_maps','tenant_read_self'),
    ('stakeholder_maps','tenant_write_self'),
    ('stakeholder_maps','tenant_update_self'),
    ('stakeholder_maps','tenant_delete_self'),
    ('approval_requests','approval_req_select'),
    ('approval_requests','approval_req_insert'),
    ('approval_requests','approval_req_update'),
    ('deliverables','deliverables_read'),
    ('deliverables','deliverables_write'),
    ('distribution_log','distribution_read'),
    ('distribution_log','distribution_write'),
    ('vault_entries','vault_read'),
    ('vault_entries','vault_write'),
    ('inline_edits','inline_edit_read'),
    ('inline_edits','inline_edit_write'),
    ('engagement_log','engagement_read'),
    ('engagement_log','engagement_write'),
    ('articles','articles_read'),
    ('articles','articles_write'),
    ('frames','frames_read'),
    ('frames','frames_write'),
    ('profiles','profiles_self_read')
  ) AS v(tablename, policyname)
),
ext_checks AS (
  SELECT
    'extension:' || e.extname AS check_id,
    CASE WHEN x.extname IS NOT NULL THEN 'ok' ELSE 'MISSING' END AS status,
    COALESCE(x.extversion::text, '') AS detail
  FROM expected_extensions e
  LEFT JOIN pg_extension x ON x.extname = e.extname
),
tbl_checks AS (
  SELECT
    'table:' || e.relname AS check_id,
    CASE WHEN c.oid IS NOT NULL THEN 'ok' ELSE 'MISSING' END AS status,
    CASE WHEN c.oid IS NOT NULL AND c.relrowsecurity THEN 'rls_on'
       WHEN c.oid IS NOT NULL THEN 'rls_off'
       ELSE '' END AS detail
  FROM expected_tables e
  LEFT JOIN pg_class c ON c.relname = e.relname
    AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
),
pol_checks AS (
  SELECT
    'policy:' || ep.tablename || ':' || ep.policyname AS check_id,
    CASE WHEN p.policyname IS NOT NULL THEN 'ok' ELSE 'MISSING' END AS status,
    '' AS detail
  FROM expected_policies ep
  LEFT JOIN pg_policies p ON p.schemaname = 'public'
    AND p.tablename = ep.tablename
    AND p.policyname = ep.policyname
),
fn_check AS (
  SELECT
    'function:public.bootstrap_profile' AS check_id,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_proc pr
      JOIN pg_namespace ns ON ns.oid = pr.pronamespace
      WHERE ns.nspname = 'public' AND pr.proname = 'bootstrap_profile'
    ) THEN 'ok' ELSE 'MISSING' END AS status,
    '' AS detail
),
trig_check AS (
  SELECT
    'trigger:auth.users:on_auth_user_created' AS check_id,
    CASE WHEN EXISTS (
      SELECT 1
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'auth'
        AND c.relname = 'users'
        AND NOT t.tgisinternal
        AND t.tgname = 'on_auth_user_created'
    ) THEN 'ok' ELSE 'MISSING' END AS status,
    '' AS detail
),
tenant_seed AS (
  SELECT
    'seed:tenants:4_rows' AS check_id,
    CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tenants'
      ) THEN 'MISSING'
      WHEN (SELECT count(*)::int FROM public.tenants) >= 4 THEN 'ok'
      ELSE 'MISSING'
    END AS status,
    CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tenants'
      ) THEN 'no table'
      ELSE (SELECT count(*)::text || ' rows' FROM public.tenants)
    END AS detail
)
SELECT * FROM ext_checks
UNION ALL SELECT * FROM tbl_checks
UNION ALL SELECT * FROM pol_checks
UNION ALL SELECT * FROM fn_check
UNION ALL SELECT * FROM trig_check
UNION ALL SELECT * FROM tenant_seed
ORDER BY check_id;
