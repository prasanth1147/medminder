/*
# Remove permissive RLS policies from MedMinder tables

## Summary
The MedMinder app was rewritten to use per-user browser storage (localStorage)
with its own local auth. It no longer reads from or writes to the Supabase
tables `medicines`, `intake_logs`, or `caregivers`. These tables are now
orphaned, but they still carry permissive RLS policies
(`USING (true)` / `WITH CHECK (true)`) scoped to `anon, authenticated`. Those
policies let anyone with the anon key read, insert, update, or delete every row
— a real security hole even though the app no longer uses the tables.

This migration drops ALL policies on all three tables and keeps RLS enabled.
With no policies, RLS denies every request from the anon and authenticated
roles, so the tables are fully locked down. Only the service role (server-side,
never exposed to the browser) can still access them.

This is non-destructive: no tables or columns are dropped, no data is deleted.
Only the permissive policies are removed.

## Tables affected
- `medicines` — drops 4 policies (select/insert/update/delete), RLS stays enabled.
- `intake_logs` — drops 4 policies (select/insert/update/delete), RLS stays enabled.
- `caregivers` — drops 4 policies (select/insert/update/delete), RLS stays enabled.

## Security changes
- All `anon_*` policies using `USING (true)` / `WITH CHECK (true)` are removed.
- RLS remains ENABLED on all three tables.
- With zero policies, `anon` and `authenticated` roles receive NO access —
  every SELECT/INSERT/UPDATE/DELETE is rejected by RLS.
- The service role bypasses RLS and retains access for any future admin/migration work.

## Important notes
1. The application does not depend on these tables anymore. Dropping the
   policies cannot break the running app.
2. Statements are idempotent via `DROP POLICY IF EXISTS`, so re-running after a
   tool timeout is safe.
3. No `DROP TABLE` or `DELETE` is used — no user data is lost. If the tables
   are later removed entirely, that should be a separate, explicit decision.
*/

-- medicines: drop all policies, keep RLS enabled
DROP POLICY IF EXISTS "anon_select_medicines" ON medicines;
DROP POLICY IF EXISTS "anon_insert_medicines" ON medicines;
DROP POLICY IF EXISTS "anon_update_medicines" ON medicines;
DROP POLICY IF EXISTS "anon_delete_medicines" ON medicines;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

-- intake_logs: drop all policies, keep RLS enabled
DROP POLICY IF EXISTS "anon_select_intake_logs" ON intake_logs;
DROP POLICY IF EXISTS "anon_insert_intake_logs" ON intake_logs;
DROP POLICY IF EXISTS "anon_update_intake_logs" ON intake_logs;
DROP POLICY IF EXISTS "anon_delete_intake_logs" ON intake_logs;
ALTER TABLE intake_logs ENABLE ROW LEVEL SECURITY;

-- caregivers: drop all policies, keep RLS enabled
DROP POLICY IF EXISTS "anon_select_caregivers" ON caregivers;
DROP POLICY IF EXISTS "anon_insert_caregivers" ON caregivers;
DROP POLICY IF EXISTS "anon_update_caregivers" ON caregivers;
DROP POLICY IF EXISTS "anon_delete_caregivers" ON caregivers;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
