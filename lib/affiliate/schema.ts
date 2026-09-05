import type { Database } from 'sqlite'

/** Affiliate and manual-billing schema. All money values are integer rupiah. */
export async function migrateAffiliateSchema(db: Database): Promise<void> {
  await db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS affiliates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      referral_code TEXT NOT NULL COLLATE NOCASE UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended','rejected')),
      email_verified_at TEXT,
      bank_account_json TEXT,
      tax_id TEXT,
      tax_type TEXT CHECK(tax_type IN ('pph21','pph23')),
      tax_rate_basis_points INTEGER NOT NULL DEFAULT 0 CHECK(tax_rate_basis_points BETWEEN 0 AND 10000),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS affiliate_sessions (
      token_hash TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS affiliate_verification_tokens (
      token_hash TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      used_at TEXT
    );
    CREATE TABLE IF NOT EXISTS referral_clicks (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL REFERENCES affiliates(id),
      visitor_hash TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      user_agent TEXT,
      landing_path TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_referral_clicks_affiliate_time ON referral_clicks(affiliate_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_referral_clicks_ip_time ON referral_clicks(ip_hash, created_at);

    CREATE TABLE IF NOT EXISTS affiliate_attributions (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL REFERENCES affiliates(id),
      lead_id TEXT,
      demo_request_id TEXT,
      customer_id TEXT,
      source_click_id TEXT REFERENCES referral_clicks(id),
      visitor_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      locked_at TEXT,
      created_at TEXT NOT NULL,
      CHECK(lead_id IS NOT NULL OR demo_request_id IS NOT NULL OR customer_id IS NOT NULL)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_attribution_lead ON affiliate_attributions(lead_id) WHERE lead_id IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_attribution_demo ON affiliate_attributions(demo_request_id) WHERE demo_request_id IS NOT NULL;

    CREATE TABLE IF NOT EXISTS whatsapp_referrals (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT REFERENCES affiliates(id),
      referral_code TEXT NOT NULL COLLATE NOCASE,
      whatsapp_number TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invoice_reminders (
      invoice_id TEXT NOT NULL REFERENCES affiliate_invoices(id) ON DELETE CASCADE,
      reminder_code TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('sent','failed')),
      error_message TEXT,
      PRIMARY KEY (invoice_id, reminder_code)
    );
    CREATE TABLE IF NOT EXISTS backup_snapshots (
      id TEXT PRIMARY KEY,
      path TEXT NOT NULL,
      bytes INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS affiliate_customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      affiliate_id TEXT REFERENCES affiliates(id),
      fraud_status TEXT NOT NULL DEFAULT 'clear' CHECK(fraud_status IN ('clear','review','blocked')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS affiliate_subscriptions (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES affiliate_customers(id),
      product_code TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('active','past_due','cancelled','expired')),
      started_at TEXT NOT NULL,
      current_period_start TEXT NOT NULL,
      current_period_end TEXT NOT NULL,
      cancelled_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS affiliate_invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      subscription_id TEXT NOT NULL REFERENCES affiliate_subscriptions(id),
      amount INTEGER NOT NULL CHECK(amount > 0),
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sent','paid','overdue','void')),
      cycle_number INTEGER NOT NULL CHECK(cycle_number > 0),
      due_at TEXT NOT NULL,
      paid_at TEXT,
      payment_reference TEXT,
      public_token TEXT,
      sent_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(subscription_id, cycle_number)
    );
    CREATE TABLE IF NOT EXISTS affiliate_commissions (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL REFERENCES affiliates(id),
      customer_id TEXT NOT NULL REFERENCES affiliate_customers(id),
      invoice_id TEXT NOT NULL UNIQUE REFERENCES affiliate_invoices(id),
      rate_basis_points INTEGER NOT NULL CHECK(rate_basis_points IN (1000,2000)),
      amount INTEGER NOT NULL CHECK(amount >= 0),
      status TEXT NOT NULL CHECK(status IN ('held','available','reserved','paid','void')),
      hold_until TEXT NOT NULL,
      fraud_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_commissions_payout ON affiliate_commissions(affiliate_id,status,hold_until);
    CREATE TABLE IF NOT EXISTS affiliate_payouts (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL REFERENCES affiliates(id),
      amount INTEGER NOT NULL CHECK(amount >= 100000),
      status TEXT NOT NULL CHECK(status IN ('requested','approved','paid','rejected','cancelled')),
      bank_account_snapshot TEXT NOT NULL,
      transfer_reference TEXT,
      tax_type TEXT CHECK(tax_type IN ('pph21','pph23')),
      tax_rate_basis_points INTEGER NOT NULL DEFAULT 0 CHECK(tax_rate_basis_points BETWEEN 0 AND 10000),
      tax_amount INTEGER NOT NULL DEFAULT 0 CHECK(tax_amount >= 0),
      net_amount INTEGER NOT NULL DEFAULT 0 CHECK(net_amount >= 0),
      requested_at TEXT NOT NULL,
      paid_at TEXT
    );
    CREATE TABLE IF NOT EXISTS affiliate_payout_items (
      payout_id TEXT NOT NULL REFERENCES affiliate_payouts(id),
      commission_id TEXT NOT NULL UNIQUE REFERENCES affiliate_commissions(id),
      PRIMARY KEY(payout_id, commission_id)
    );
    CREATE TABLE IF NOT EXISTS affiliate_audit_log (
      id TEXT PRIMARY KEY,
      actor_type TEXT NOT NULL,
      actor_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
  `)

  // Idempotent column upgrades for databases created before these fields existed.
  async function ensureColumn(table: string, column: string, definition: string): Promise<void> {
    const columns = await db.all<{ name: string }[]>(`PRAGMA table_info(${table})`)
    if (columns.length && !columns.some((entry) => entry.name === column)) {
      await db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`)
    }
  }
  await ensureColumn('affiliates', 'tax_id', 'tax_id TEXT')
  await ensureColumn('affiliates', 'tax_type', "tax_type TEXT CHECK(tax_type IN ('pph21','pph23'))")
  await ensureColumn('affiliates', 'tax_rate_basis_points', 'tax_rate_basis_points INTEGER NOT NULL DEFAULT 0')
  await ensureColumn('affiliate_invoices', 'public_token', 'public_token TEXT')
  await ensureColumn('affiliate_invoices', 'sent_at', 'sent_at TEXT')
  await ensureColumn('affiliate_payouts', 'tax_type', "tax_type TEXT CHECK(tax_type IN ('pph21','pph23'))")
  await ensureColumn('affiliate_payouts', 'tax_rate_basis_points', 'tax_rate_basis_points INTEGER NOT NULL DEFAULT 0')
  await ensureColumn('affiliate_payouts', 'tax_amount', 'tax_amount INTEGER NOT NULL DEFAULT 0')
  await ensureColumn('affiliate_payouts', 'net_amount', 'net_amount INTEGER NOT NULL DEFAULT 0')

  // Public invoice tokens are high-entropy capability URLs; the unique index
  // prevents two invoices from sharing one token and makes lookups O(1).
  await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_invoices_public_token
    ON affiliate_invoices(public_token) WHERE public_token IS NOT NULL`)
}
