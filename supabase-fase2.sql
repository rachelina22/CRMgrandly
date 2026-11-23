-- ============================================================
-- GRANDLY CRM — Fase 2: Clientes
-- Pegar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- TABLA: customers
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email              VARCHAR(255) UNIQUE NOT NULL,
  first_name         VARCHAR(100) NOT NULL,
  last_name          VARCHAR(100) NOT NULL,
  phone              VARCHAR(30),
  birth_date         DATE,
  member_type        VARCHAR(20)  DEFAULT 'standard'
                     CHECK (member_type IN ('standard', 'premium', 'vip', 'paused')),
  status             VARCHAR(20)  DEFAULT 'active'
                     CHECK (status IN ('active', 'inactive', 'pending', 'cancelled')),
  acquisition_source VARCHAR(80),
  comm_email         BOOLEAN      DEFAULT true,
  comm_sms           BOOLEAN      DEFAULT false,
  comm_post          BOOLEAN      DEFAULT true,
  gdpr_consent_at    TIMESTAMPTZ,
  address_line       VARCHAR(200),
  address_city       VARCHAR(100),
  address_province   VARCHAR(100),
  address_postal     VARCHAR(10),
  address_country    VARCHAR(60)  DEFAULT 'España',
  notes              TEXT,
  loyalty_points     INTEGER      DEFAULT 0,
  created_at         TIMESTAMPTZ  DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLA: customer_tags
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_tags (
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  tag         VARCHAR(60) NOT NULL,
  PRIMARY KEY (customer_id, tag)
);

-- ─────────────────────────────────────────────────────────────
-- TABLA: interaction_history
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interaction_history (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id      UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  interaction_type VARCHAR(50) NOT NULL
                   CHECK (interaction_type IN (
                     'nota','llamada','email','pedido',
                     'incidencia','evento','juego','suscripcion','otro'
                   )),
  reference_id     UUID,
  reference_type   VARCHAR(50),
  description      TEXT,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: auto-actualizar updated_at en customers
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Solo usuarios autenticados (administradores) acceden
-- ─────────────────────────────────────────────────────────────
ALTER TABLE customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_history ENABLE ROW LEVEL SECURITY;

-- customers
CREATE POLICY "admin_customers_select" ON customers FOR SELECT    TO authenticated USING (true);
CREATE POLICY "admin_customers_insert" ON customers FOR INSERT    TO authenticated WITH CHECK (true);
CREATE POLICY "admin_customers_update" ON customers FOR UPDATE    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_customers_delete" ON customers FOR DELETE    TO authenticated USING (true);

-- customer_tags
CREATE POLICY "admin_tags_all"         ON customer_tags      FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- interaction_history
CREATE POLICY "admin_interactions_all" ON interaction_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- VISTA: estadísticas para el dashboard
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW customer_stats_view
WITH (security_invoker = true) AS
SELECT
  COUNT(*)                                                              AS total,
  COUNT(*) FILTER (WHERE status = 'active')                            AS active,
  COUNT(*) FILTER (WHERE member_type = 'premium')                      AS premium,
  COUNT(*) FILTER (WHERE member_type = 'vip')                          AS vip,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))     AS new_this_month,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')      AS new_this_week
FROM customers;

-- ─────────────────────────────────────────────────────────────
-- FUNCIÓN: crecimiento mensual (últimos N meses)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION monthly_growth(months_back INT DEFAULT 6)
RETURNS TABLE(month TEXT, new_customers BIGINT)
SECURITY INVOKER LANGUAGE sql AS $$
  SELECT
    to_char(date_trunc('month', gs.m), 'Mon YYYY') AS month,
    COUNT(c.id)                                     AS new_customers
  FROM generate_series(
    date_trunc('month', NOW()) - ((months_back - 1) * INTERVAL '1 month'),
    date_trunc('month', NOW()),
    INTERVAL '1 month'
  ) AS gs(m)
  LEFT JOIN customers c ON date_trunc('month', c.created_at) = gs.m
  GROUP BY gs.m
  ORDER BY gs.m;
$$;

-- ─────────────────────────────────────────────────────────────
-- Verificación: comprobar que todo está creado
-- ─────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('customers','customer_tags','interaction_history')
ORDER BY table_name;
