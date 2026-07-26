/*
# MedMinder: medicines, intake_logs, caregivers

## Summary
Creates the core data model for the MedMinder medicine reminder app. This is a
single-tenant app with NO sign-in screen, so all tables use shared/public RLS
policies that allow the anon-key frontend to read and write its own data.

## New Tables

### medicines
Stores each medicine's reminder schedule.
- id (uuid, pk)
- name (text, not null) — medicine name, e.g. "Metformin"
- dosage (text, not null) — e.g. "1 tablet"
- time (time, not null) — time of day to take it, e.g. 08:00
- frequency (text, not null, CHECK in 'daily','weekly')
- day_of_week (smallint, nullable, 0–6, Sunday=0) — set for weekly medicines;
  the weekday the weekly dose is due. NULL for daily.
- notes (text, nullable)
- created_at (timestamptz, default now())

### intake_logs
Records that a medicine was taken on a specific date. One row per
(medicine, date). Insert = taken; delete = un-taken.
- id (uuid, pk)
- medicine_id (uuid, fk → medicines, on delete cascade)
- taken_date (date, not null)
- created_at (timestamptz, default now())
- UNIQUE (medicine_id, taken_date)

### caregivers
Stores emergency caregiver contact details for the bottom card.
- id (uuid, pk)
- name (text, not null)
- relationship (text, nullable) — e.g. "Daughter"
- phone (text, not null)
- created_at (timestamptz, default now())

## Security
- RLS enabled on all three tables.
- All policies use TO anon, authenticated with USING(true)/WITH CHECK(true)
  because this is a single-tenant app with no sign-in; the data is intentionally
  shared across the single user of the app.
- 4 policies per table (select/insert/update/delete) — no FOR ALL.

## Important Notes
1. No user_id columns and no auth.uid() usage — app has no sign-in screen.
2. intake_logs UNIQUE constraint prevents duplicate "taken" records per day,
   and enables clean upsert from the frontend toggle.
3. All statements are idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS) so the
   migration is safe to re-apply after a tool timeout.
*/

-- medicines
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  dosage text NOT NULL,
  time time NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  day_of_week smallint CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_medicines" ON medicines;
CREATE POLICY "anon_select_medicines" ON medicines FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_medicines" ON medicines;
CREATE POLICY "anon_insert_medicines" ON medicines FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_medicines" ON medicines;
CREATE POLICY "anon_update_medicines" ON medicines FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_medicines" ON medicines;
CREATE POLICY "anon_delete_medicines" ON medicines FOR DELETE
  TO anon, authenticated USING (true);

-- intake_logs
CREATE TABLE IF NOT EXISTS intake_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  taken_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (medicine_id, taken_date)
);

ALTER TABLE intake_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_intake_logs" ON intake_logs;
CREATE POLICY "anon_select_intake_logs" ON intake_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_intake_logs" ON intake_logs;
CREATE POLICY "anon_insert_intake_logs" ON intake_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_intake_logs" ON intake_logs;
CREATE POLICY "anon_update_intake_logs" ON intake_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_intake_logs" ON intake_logs;
CREATE POLICY "anon_delete_intake_logs" ON intake_logs FOR DELETE
  TO anon, authenticated USING (true);

-- caregivers
CREATE TABLE IF NOT EXISTS caregivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  relationship text,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_caregivers" ON caregivers;
CREATE POLICY "anon_select_caregivers" ON caregivers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_caregivers" ON caregivers;
CREATE POLICY "anon_insert_caregivers" ON caregivers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_caregivers" ON caregivers;
CREATE POLICY "anon_update_caregivers" ON caregivers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_caregivers" ON caregivers;
CREATE POLICY "anon_delete_caregivers" ON caregivers FOR DELETE
  TO anon, authenticated USING (true);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_intake_logs_date ON intake_logs (taken_date);
CREATE INDEX IF NOT EXISTS idx_intake_logs_medicine ON intake_logs (medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicines_time ON medicines (time);
