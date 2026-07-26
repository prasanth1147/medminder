/*
# Add explicit deny-all RLS policies to orphaned MedMinder tables

## Summary
The MedMinder app was rewritten to use per-user browser storage (localStorage)
with its own local auth, and no longer reads from or writes to the Supabase
tables `medicines`, `intake_logs`, or `caregivers`. A previous migration removed
the old permissive `USING (true)` policies and left RLS enabled with ZERO
policies, which fully locks the tables (every anon/authenticated request is
denied). That state is secure, but security scanners flag "RLS enabled with no
policy" because they cannot tell an intentional lockdown from a forgotten
policy.

This migration replaces that implicit lockdown with an EXPLICIT, documented one:
four deny-all policies per table (SELECT/INSERT/UPDATE/DELETE), each scoped to
`anon, authenticated` with a `false` predicate. Functionally identical to "no
policy" (all rows denied to frontend roles), but it clears the scanner warning
and records the intent in the schema. The service role still bypasses RLS and
retains access for any future admin/migration work.

This is non-destructive: no tables or columns are dropped, no data is deleted.
Each table currently holds 1 row; that data is preserved untouched.

## Tables affected
- `medicines` — 4 deny-all policies added (select/insert/update/delete). RLS already enabled.
- `intake_logs` — 4 deny-all policies added (select/insert/update/delete). RLS already enabled.
- `caregivers` — 4 deny-all policies added (select/insert/update/delete). RLS already enabled.

## Security changes
- RLS remains ENABLED on all three tables (re-asserted for safety).
- Four explicit deny-all policies added per table, scoped to `anon, authenticated`:
  - SELECT  ... USING (false)            -> no rows visible
  - INSERT  ... WITH CHECK (false)       -> no inserts allowed
  - UPDATE  ... USING (false) WITH CHECK (false) -> no updates allowed
  - DELETE  ... USING (false)            -> no deletes allowed
- Net effect for `anon` and `authenticated`: every request is rejected by RLS,
  identical to the previous "no policy" state, but now intentional and documented.
- The service role bypasses RLS and retains full access for admin/migration work.

## Important notes
1. The application does not depend on these tables (it uses localStorage). This
   migration cannot break the running app.
2. Existing rows (1 per table) are preserved — no DROP, DELETE, or column change.
3. Statements are idempotent via `DROP POLICY IF EXISTS` before each CREATE, so
   re-running after a tool timeout is safe and will not duplicate policies.
4. Four separate policies per table are used (no `FOR ALL`), per RLS best practice.
5. `USING (false)` / `WITH CHECK (false)` is used intentionally here to express
   an explicit deny. This is NOT the disallowed "USING (true)" shortcut — it
   grants nothing and documents that the tables are deliberately locked down.
*/

-- medicines: explicit deny-all (RLS already enabled)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_select_medicines" ON medicines;
CREATE POLICY "deny_select_medicines" ON medicines FOR SELECT
  TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "deny_insert_medicines" ON medicines;
CREATE POLICY "deny_insert_medicines" ON medicines FOR INSERT
  TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_update_medicines" ON medicines;
CREATE POLICY "deny_update_medicines" ON medicines FOR UPDATE
  TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_delete_medicines" ON medicines;
CREATE POLICY "deny_delete_medicines" ON medicines FOR DELETE
  TO anon, authenticated USING (false);

-- intake_logs: explicit deny-all (RLS already enabled)
ALTER TABLE intake_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_select_intake_logs" ON intake_logs;
CREATE POLICY "deny_select_intake_logs" ON intake_logs FOR SELECT
  TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "deny_insert_intake_logs" ON intake_logs;
CREATE POLICY "deny_insert_intake_logs" ON intake_logs FOR INSERT
  TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_update_intake_logs" ON intake_logs;
CREATE POLICY "deny_update_intake_logs" ON intake_logs FOR UPDATE
  TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_delete_intake_logs" ON intake_logs;
CREATE POLICY "deny_delete_intake_logs" ON intake_logs FOR DELETE
  TO anon, authenticated USING (false);

-- caregivers: explicit deny-all (RLS already enabled)
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_select_caregivers" ON caregivers;
CREATE POLICY "deny_select_caregivers" ON caregivers FOR SELECT
  TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "deny_insert_caregivers" ON caregivers;
CREATE POLICY "deny_insert_caregivers" ON caregivers FOR INSERT
  TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_update_caregivers" ON caregivers;
CREATE POLICY "deny_update_caregivers" ON caregivers FOR UPDATE
  TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_delete_caregivers" ON caregivers;
CREATE POLICY "deny_delete_caregivers" ON caregivers FOR DELETE
  TO anon, authenticated USING (false);
