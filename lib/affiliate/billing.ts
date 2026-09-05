import { randomBytes, randomUUID } from 'crypto'
import { getDb } from '@/lib/db'
import { INVOICE_TOKEN_BYTES } from './constants'
import type { CreateCustomerInput, CreateInvoiceInput, CreateSubscriptionInput, PublicInvoiceView } from './types'

/** Public invoice links identify invoices by this high-entropy, unguessable token. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bantugrow.com'
}

export function invoicePublicUrl(token: string): string {
  return `${siteUrl()}/invoice/${encodeURIComponent(token)}`
}

export async function createCustomer(input: CreateCustomerInput, now = new Date()): Promise<string> {
  const db = await getDb()
  const email = input.email.trim().toLowerCase()
  if (!input.name.trim() || !email.includes('@')) throw new Error('Invalid customer')
  let fraudStatus: 'clear' | 'review' = 'clear'
  if (input.affiliateId) {
    const affiliate = await db.get<{ email: string; status: string }>('SELECT email,status FROM affiliates WHERE id=?', [input.affiliateId])
    if (!affiliate || affiliate.status !== 'active') throw new Error('Affiliate is not active')
    if (affiliate.email.toLowerCase() === email) fraudStatus = 'review'
  }
  const id = randomUUID()
  const timestamp = now.toISOString()
  await db.run(`INSERT INTO affiliate_customers (id,name,email,affiliate_id,fraud_status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`,
    [id, input.name.trim(), email, input.affiliateId ?? null, fraudStatus, timestamp, timestamp])
  return id
}

export async function createSubscription(input: CreateSubscriptionInput, now = new Date()): Promise<string> {
  if (input.periodEnd <= input.periodStart) throw new Error('Subscription period is invalid')
  const db = await getDb()
  const id = randomUUID()
  const timestamp = now.toISOString()
  await db.run(`INSERT INTO affiliate_subscriptions (id,customer_id,product_code,status,started_at,current_period_start,current_period_end,created_at,updated_at)
    VALUES (?,?,?,'active',?,?,?,?,?)`, [id, input.customerId, input.productCode, input.periodStart.toISOString(), input.periodStart.toISOString(), input.periodEnd.toISOString(), timestamp, timestamp])
  return id
}

export async function createInvoice(input: CreateInvoiceInput, now = new Date()): Promise<{ id: string; invoiceNumber: string; publicToken: string }> {
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) throw new Error('Invoice amount must be positive integer rupiah')
  const db = await getDb()
  const id = randomUUID()
  const timestamp = now.toISOString()
  const publicToken = randomBytes(INVOICE_TOKEN_BYTES).toString('base64url')
  await db.exec('BEGIN IMMEDIATE')
  try {
    const period = timestamp.slice(0, 7).replace('-', '')
    const row = await db.get<{ count: number }>("SELECT COUNT(*) count FROM affiliate_invoices WHERE invoice_number LIKE ?", [`BG-${period}-%`])
    const invoiceNumber = `BG-${period}-${String((row?.count ?? 0) + 1).padStart(5, '0')}`
    await db.run(`INSERT INTO affiliate_invoices (id,invoice_number,subscription_id,amount,cycle_number,due_at,public_token,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?)`, [id, invoiceNumber, input.subscriptionId, input.amount, input.cycleNumber, input.dueAt.toISOString(), publicToken, timestamp, timestamp])
    await db.exec('COMMIT')
    return { id, invoiceNumber, publicToken }
  } catch (error) { await db.exec('ROLLBACK'); throw error }
}

export async function setInvoiceStatus(invoiceId: string, status: 'sent' | 'overdue' | 'void', now = new Date()): Promise<void> {
  const db = await getDb()
  const sentAt = status === 'sent' ? now.toISOString() : null
  const result = await db.run('UPDATE affiliate_invoices SET status=?,sent_at=COALESCE(sent_at,?),updated_at=? WHERE id=? AND status<>\'paid\'', [status, sentAt, now.toISOString(), invoiceId])
  if (!result.changes) throw new Error('Invoice not found or already paid')
}

/** Resolves the customer-facing invoice by its public, hashed token. */
export async function getPublicInvoice(token: string): Promise<PublicInvoiceView | null> {
  const db = await getDb()
  const row = await db.get<{
    invoice_number: string; customer_name: string; product_code: string; amount: number; status: string;
    cycle_number: number; due_at: string; paid_at: string | null; public_token: string | null
  }>(`SELECT i.invoice_number,c.name customer_name,s.product_code,i.amount,i.status,i.cycle_number,i.due_at,i.paid_at,i.public_token
    FROM affiliate_invoices i JOIN affiliate_subscriptions s ON s.id=i.subscription_id JOIN affiliate_customers c ON c.id=s.customer_id
    WHERE i.public_token=?`, [token])
  if (!row) return null
  return {
    invoiceNumber: row.invoice_number,
    customerName: row.customer_name,
    productName: row.product_code,
    amount: row.amount,
    status: row.status as PublicInvoiceView['status'],
    cycleNumber: row.cycle_number,
    dueAt: row.due_at,
    paidAt: row.paid_at,
    paymentInstructions: process.env.INVOICE_PAYMENT_INSTRUCTIONS ?? 'Hubungi tim BantuGrow untuk instruksi pembayaran.',
  }
}

/** Records (or re-records) a reminder delivery so the retry cron can resend failures. */
export async function recordInvoiceReminder(invoiceId: string, reminderCode: string, status: 'sent' | 'failed', errorMessage?: string | null, now = new Date()): Promise<void> {
  const db = await getDb()
  await db.run(`INSERT INTO invoice_reminders (invoice_id,reminder_code,sent_at,status,error_message) VALUES (?,?,?,?,?)
    ON CONFLICT(invoice_id,reminder_code) DO UPDATE SET sent_at=excluded.sent_at,status=excluded.status,error_message=excluded.error_message`,
    [invoiceId, reminderCode, now.toISOString(), status, errorMessage?.slice(0, 1000) ?? null])
}

/** Invoices awaiting a specific due-date reminder (idempotently re-sent only when failed). */
export async function getInvoicesDueForReminder(reminderCode: string, daysAhead: number, now = new Date(), limit = 100): Promise<{ invoiceId: string; email: string; invoiceNumber: string }[]> {
  const db = await getDb()
  const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const windowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead, 23, 59, 59)
  return db.all<{ invoiceId: string; email: string; invoiceNumber: string }[]>(`
    SELECT i.id invoiceId, c.email, i.invoice_number invoiceNumber
    FROM affiliate_invoices i JOIN affiliate_subscriptions s ON s.id=i.subscription_id JOIN affiliate_customers c ON c.id=s.customer_id
    WHERE i.status IN ('sent','overdue') AND i.due_at BETWEEN ? AND ?
      AND NOT EXISTS (SELECT 1 FROM invoice_reminders r WHERE r.invoice_id=i.id AND r.reminder_code=? AND r.status='sent')
    ORDER BY i.due_at LIMIT ?`, [windowStart.toISOString(), windowEnd.toISOString(), reminderCode, limit])
}

/** Overdue invoices with a confirmed past due date and no sent overdue notice yet. */
export async function getOverdueInvoices(now = new Date(), limit = 100): Promise<{ invoiceId: string; email: string; invoiceNumber: string; dueAt: string }[]> {
  const db = await getDb()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  return db.all<{ invoiceId: string; email: string; invoiceNumber: string; dueAt: string }[]>(`
    SELECT i.id invoiceId, c.email, i.invoice_number invoiceNumber, i.due_at dueAt
    FROM affiliate_invoices i JOIN affiliate_subscriptions s ON s.id=i.subscription_id JOIN affiliate_customers c ON c.id=s.customer_id
    WHERE i.status IN ('sent','overdue') AND i.due_at < ?
      AND NOT EXISTS (SELECT 1 FROM invoice_reminders r WHERE r.invoice_id=i.id AND r.reminder_code='overdue' AND r.status='sent')
    ORDER BY i.due_at LIMIT ?`, [today.toISOString(), limit])
}

/** Marks all past-due, unpaid invoices as overdue; returns how many changed. */
export async function markOverdueInvoices(now = new Date()): Promise<number> {
  const db = await getDb()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const result = await db.run("UPDATE affiliate_invoices SET status='overdue',updated_at=? WHERE status='sent' AND due_at<?", [now.toISOString(), today.toISOString()])
  return result.changes ?? 0
}

/**
 * Generates the next-cycle invoice for every active subscription whose current
 * period ends within the configured renewal window. Idempotent: a subscription
 * will never get two invoices for the same cycle.
 */
export async function generateRenewalInvoices(now = new Date(), windowDays = 30, limit = 100): Promise<number> {
  const db = await getDb()
  const windowEnd = new Date(now.getTime() + windowDays * 86_400_000).toISOString()
  const subscriptions = await db.all<{ id: string; current_period_start: string; current_period_end: string; amount: number }[]>(`
    SELECT s.id, s.current_period_start, s.current_period_end,
      COALESCE((SELECT amount FROM affiliate_invoices i WHERE i.subscription_id=s.id ORDER BY i.cycle_number DESC LIMIT 1), 0) amount
    FROM affiliate_subscriptions s
    WHERE s.status='active' AND s.current_period_end BETWEEN ? AND ?
    ORDER BY s.current_period_end LIMIT ?`, [now.toISOString(), windowEnd, limit])
  let generated = 0
  for (const subscription of subscriptions) {
    const nextStart = new Date(subscription.current_period_end)
    const last = await db.get<{ cycle_number: number }>(
      'SELECT cycle_number FROM affiliate_invoices WHERE subscription_id=? ORDER BY cycle_number DESC LIMIT 1',
      [subscription.id])
    const cycle = (last?.cycle_number ?? 0) + 1
    // Idempotency: skip when a future invoice already covers this renewal.
    const existing = await db.get<{ id: string }>(
      "SELECT id FROM affiliate_invoices WHERE subscription_id=? AND due_at >= ? AND status <> 'void'",
      [subscription.id, nextStart.toISOString()])
    if (existing) continue
    await createInvoice({
      subscriptionId: subscription.id,
      amount: subscription.amount || 1_000_000,
      cycleNumber: cycle,
      dueAt: nextStart,
    }, now)
    generated += 1
  }
  return generated
}
