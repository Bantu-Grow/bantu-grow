import { randomUUID } from 'crypto'
import { getDb } from '@/lib/db'
import { COMMISSION_FIRST_YEAR_BPS, COMMISSION_HOLD_DAYS, COMMISSION_RENEWAL_BPS, addDays } from './constants'

export interface MarkPaidResult { commissionId: string | null; commissionAmount: number; alreadyPaid: boolean; fraudReview: boolean }

/** Atomically marks an invoice paid and creates at most one recurring commission. */
export async function markInvoicePaid(invoiceId: string, paymentReference: string, now = new Date()): Promise<MarkPaidResult> {
  if (!paymentReference.trim()) throw new Error('Payment reference is required')
  const db = await getDb()
  await db.exec('BEGIN IMMEDIATE')
  try {
    const invoice = await db.get<{ status: string; amount: number; cycle_number: number; customer_id: string; affiliate_id: string | null; customer_email: string; affiliate_email: string | null; fraud_status: string }>(`
      SELECT i.status,i.amount,i.cycle_number,s.customer_id,c.affiliate_id,c.email customer_email,a.email affiliate_email,c.fraud_status
      FROM affiliate_invoices i JOIN affiliate_subscriptions s ON s.id=i.subscription_id
      JOIN affiliate_customers c ON c.id=s.customer_id LEFT JOIN affiliates a ON a.id=c.affiliate_id WHERE i.id=?`, [invoiceId])
    if (!invoice) throw new Error('Invoice not found')
    const existing = await db.get<{ id: string; amount: number }>('SELECT id,amount FROM affiliate_commissions WHERE invoice_id=?', [invoiceId])
    if (invoice.status === 'paid') {
      await db.exec('COMMIT')
      return { commissionId: existing?.id ?? null, commissionAmount: existing?.amount ?? 0, alreadyPaid: true, fraudReview: false }
    }
    if (invoice.status === 'void') throw new Error('Void invoice cannot be paid')
    const timestamp = now.toISOString()
    await db.run('UPDATE affiliate_invoices SET status=\'paid\',paid_at=?,payment_reference=?,updated_at=? WHERE id=?', [timestamp, paymentReference.trim(), timestamp, invoiceId])
    let commissionId: string | null = null
    let amount = 0
    const fraudReview = invoice.fraud_status !== 'clear' || (!!invoice.affiliate_email && invoice.affiliate_email.toLowerCase() === invoice.customer_email.toLowerCase())
    if (invoice.affiliate_id && !fraudReview) {
      const rate = invoice.cycle_number === 1 ? COMMISSION_FIRST_YEAR_BPS : COMMISSION_RENEWAL_BPS
      amount = Math.floor(invoice.amount * rate / 10_000)
      commissionId = randomUUID()
      await db.run(`INSERT INTO affiliate_commissions (id,affiliate_id,customer_id,invoice_id,rate_basis_points,amount,status,hold_until,created_at,updated_at)
        VALUES (?,?,?,?,?,?,'held',?,?,?)`, [commissionId, invoice.affiliate_id, invoice.customer_id, invoiceId, rate, amount, addDays(now, COMMISSION_HOLD_DAYS), timestamp, timestamp])
    }
    await db.run(`INSERT INTO affiliate_audit_log (id,actor_type,action,entity_type,entity_id,metadata_json,created_at) VALUES (?,'admin','invoice.mark_paid','invoice',?,?,?)`,
      [randomUUID(), invoiceId, JSON.stringify({ paymentReference: paymentReference.trim(), fraudReview }), timestamp])
    await db.exec('COMMIT')
    return { commissionId, commissionAmount: amount, alreadyPaid: false, fraudReview }
  } catch (error) { await db.exec('ROLLBACK'); throw error }
}

export async function releaseHeldCommissions(now = new Date()): Promise<number> {
  const db = await getDb()
  const result = await db.run(`UPDATE affiliate_commissions SET status='available',updated_at=?
    WHERE status='held' AND hold_until<=? AND fraud_reason IS NULL`, [now.toISOString(), now.toISOString()])
  return result.changes ?? 0
}

export async function voidCommission(invoiceId: string, reason: string, now = new Date()): Promise<void> {
  if (!reason.trim()) throw new Error('Void reason is required')
  const db = await getDb()
  await db.run(`UPDATE affiliate_commissions SET status='void',fraud_reason=?,updated_at=? WHERE invoice_id=? AND status<>'paid'`, [reason.trim(), now.toISOString(), invoiceId])
}
