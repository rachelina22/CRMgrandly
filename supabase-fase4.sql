-- ============================================================
-- GRANDLY CRM — Fase 4: Suscripciones
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id        UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Plan
  plan_type          VARCHAR(30) NOT NULL DEFAULT 'mensual'
                       CHECK (plan_type IN ('mensual','trimestral','semestral','anual','regalo')),
  plan_name          VARCHAR(100),          -- nombre libre, ej. "Revista + Club VIP"

  -- Estado
  status             VARCHAR(20) NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','paused','cancelled','expired','pending')),

  -- Importes
  price              NUMERIC(8,2) NOT NULL DEFAULT 0,
  currency           CHAR(3)      NOT NULL DEFAULT 'EUR',

  -- Fechas
  start_date         DATE         NOT NULL DEFAULT CURRENT_DATE,
  end_date           DATE,                  -- null = renovación automática
  next_billing_date  DATE,
  paused_at          TIMESTAMPTZ,
  cancelled_at       TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Pago
  payment_method     VARCHAR(40) DEFAULT 'domiciliacion'
                       CHECK (payment_method IN ('domiciliacion','tarjeta','transferencia','efectivo','otro')),
  payment_reference  VARCHAR(200),          -- referencia externa (IBAN, ID Stripe, etc.)

  -- Metadatos
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger updated_at
DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_subs_select ON subscriptions;
DROP POLICY IF EXISTS admin_subs_insert ON subscriptions;
DROP POLICY IF EXISTS admin_subs_update ON subscriptions;
DROP POLICY IF EXISTS admin_subs_delete ON subscriptions;

CREATE POLICY admin_subs_select ON subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY admin_subs_insert ON subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY admin_subs_update ON subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_subs_delete ON subscriptions FOR DELETE TO authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;

-- Vista de stats para dashboard
CREATE OR REPLACE VIEW subscription_stats_view AS
SELECT
  COUNT(*)                                                      AS total,
  COUNT(*) FILTER (WHERE status = 'active')                     AS active,
  COUNT(*) FILTER (WHERE status = 'paused')                     AS paused,
  COUNT(*) FILTER (WHERE status = 'cancelled')                  AS cancelled,
  COUNT(*) FILTER (WHERE status = 'pending')                    AS pending,
  COALESCE(SUM(price) FILTER (WHERE status = 'active'), 0)      AS mrr,
  COUNT(*) FILTER (WHERE next_billing_date <= CURRENT_DATE + 7
                     AND status = 'active')                     AS due_this_week
FROM subscriptions;

GRANT SELECT ON subscription_stats_view TO authenticated;
GRANT SELECT ON subscription_stats_view TO anon;
