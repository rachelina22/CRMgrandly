-- ============================================================
-- GRANDLY CRM — Fase 3: Listas de espera
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Tabla principal
CREATE TABLE IF NOT EXISTS waiting_list (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name           VARCHAR(100) NOT NULL,
  last_name            VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  phone                VARCHAR(30),
  birth_date           DATE,
  acquisition_source   VARCHAR(80),
  interests            TEXT[]          DEFAULT '{}',
  message              TEXT,
  status               VARCHAR(20)     DEFAULT 'pending'
                         CHECK (status IN ('pending','contacted','approved','rejected','cancelled')),
  priority             SMALLINT        DEFAULT 0
                         CHECK (priority IN (0,1,2)),
  gdpr_consent_at      TIMESTAMPTZ,
  comm_email           BOOLEAN         DEFAULT true,
  comm_sms             BOOLEAN         DEFAULT false,
  internal_notes       TEXT,
  contacted_at         TIMESTAMPTZ,
  approved_at          TIMESTAMPTZ,
  converted_customer_id UUID           REFERENCES customers(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ     DEFAULT NOW(),
  updated_at           TIMESTAMPTZ     DEFAULT NOW()
);

-- Trigger updated_at (reutiliza la función creada en fase 2)
DROP TRIGGER IF EXISTS waiting_list_updated_at ON waiting_list;
CREATE TRIGGER waiting_list_updated_at
  BEFORE UPDATE ON waiting_list
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_waiting_list_select ON waiting_list;
DROP POLICY IF EXISTS admin_waiting_list_insert ON waiting_list;
DROP POLICY IF EXISTS admin_waiting_list_update ON waiting_list;
DROP POLICY IF EXISTS admin_waiting_list_delete ON waiting_list;

CREATE POLICY admin_waiting_list_select ON waiting_list
  FOR SELECT TO authenticated USING (true);
CREATE POLICY admin_waiting_list_insert ON waiting_list
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY admin_waiting_list_update ON waiting_list
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_waiting_list_delete ON waiting_list
  FOR DELETE TO authenticated USING (true);

-- GRANTs
GRANT SELECT, INSERT, UPDATE, DELETE ON waiting_list TO authenticated;

-- Vista resumen para el dashboard de listas de espera
CREATE OR REPLACE VIEW waiting_list_stats_view AS
SELECT
  COUNT(*)                                                      AS total,
  COUNT(*) FILTER (WHERE status = 'pending')                    AS pending,
  COUNT(*) FILTER (WHERE status = 'contacted')                  AS contacted,
  COUNT(*) FILTER (WHERE status = 'approved')                   AS approved,
  COUNT(*) FILTER (WHERE status = 'rejected')                   AS rejected,
  COUNT(*) FILTER (WHERE priority = 2)                          AS high_priority,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_this_month
FROM waiting_list;

GRANT SELECT ON waiting_list_stats_view TO authenticated;
GRANT SELECT ON waiting_list_stats_view TO anon;
