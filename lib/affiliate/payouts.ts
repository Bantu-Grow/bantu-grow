import { randomUUID } from 'crypto'
import { getDb } from '@/lib/db'
import { MINIMUM_PAYOUT_RUPIAH } from './constants'
import type { TaxType } from './types'

interface PayoutAffiliate {
  bank_account_json: string | null
  status: string
  tax_type: TaxType | null
  tax_rate_basis_points: number
}

interface AvailableCommission {
  id: string
  amount: number
}

export interface PayoutTaxBreakdown {
  grossAmount: number
  taxType: TaxType | null
  taxRateBasisPoints: number
  taxAmount: number
  netAmount: number
}

function applyTax(amount: number, taxType: TaxType | null, rateBasisPoints: number): PayoutTaxBreakdown {
  if (!taxType || rateBasisPoints <= 0) {
    return { grossAmount: amount, taxType: null, taxRateBasisPoints: 0, taxAmount: 0, netAmount: amount }
  }
  const taxAmount = Math.floor(amount * rateBasisPoints / 10_000)
  return { grossAmount: amount, taxType, taxRateBasisPoints: rateBasisPoints, taxAmount, netAmount: amount - taxAmount }
}

/**
 * Requests a payout by RESERVING the available commissions rather than marking
 * them paid. Commissions are only flipped to paid when the transfer completes.
 * If the payout is later rejected or cancelled, the reservation is rolled back.
 */
export async function requestPayout(affiliateId: string, now = new Date()): Promise<{ payoutId: string; amount: number; tax: PayoutTaxBreakdown }> {
  const db = await getDb()
  await db.exec('BEGIN IMMEDIATE')
  try {
    const affiliate = await db.get<PayoutAffiliate>('SELECT bank_account_json,status,tax_type,tax_rate_basis_points FROM affiliates WHERE id=?', [affiliateId])
    if (!affiliate || affiliate.status !== 'active') throw new Error('Affiliate is not active')
    if (!affiliate.bank_account_json) throw new Error('Bank account is required')
    const rows = await db.all<AvailableCommission[]>("SELECT id,amount FROM affiliate_commissions WHERE affiliate_id=? AND status='available' ORDER BY created_at", [affiliateId])
    const amount = rows.reduce((sum, row) => sum + row.amount, 0)
    if (amount < MINIMUM_PAYOUT_RUPIAH) throw new Error('Minimum payout is Rp100.000')
    const tax = applyTax(amount, affiliate.tax_type, affiliate.tax_rate_basis_points)
    const payoutId = randomUUID()
    const timestamp = now.toISOString()
    await db.run(`INSERT INTO affiliate_payouts (id,affiliate_id,amount,status,bank_account_snapshot,tax_type,tax_rate_basis_points,tax_amount,net_amount,requested_at)
      VALUES (?,?,?,'requested',?,?,?,?,?,?)`,
      [payoutId, affiliateId, amount, affiliate.bank_account_json, tax.taxType, tax.taxRateBasisPoints, tax.taxAmount, tax.netAmount, timestamp])
    for (const row of rows) {
      await db.run('INSERT OR IGNORE INTO affiliate_payout_items (payout_id,commission_id) VALUES (?,?)', [payoutId, row.id])
      await db.run("UPDATE affiliate_commissions SET status='reserved',updated_at=? WHERE id=? AND status='available'", [timestamp, row.id])
    }
    await db.run(`INSERT INTO affiliate_audit_log (id,actor_type,action,entity_type,entity_id,metadata_json,created_at) VALUES (?,'affiliate','payout.requested','payout',?,?,?)`,
      [randomUUID(), payoutId, JSON.stringify({ grossAmount: tax.grossAmount, taxType: tax.taxType, taxAmount: tax.taxAmount, netAmount: tax.netAmount }), timestamp])
    await db.exec('COMMIT')
    return { payoutId, amount, tax }
  } catch (error) { await db.exec('ROLLBACK'); throw error }
}

export async function markPayoutPaid(payoutId: string, transferReference: string, now = new Date()): Promise<void> {
  if (!transferReference.trim()) throw new Error('Transfer reference is required')
  const db = await getDb()
  await db.exec('BEGIN IMMEDIATE')
  try {
    const result = await db.run(`UPDATE affiliate_payouts SET status='paid',transfer_reference=?,paid_at=? WHERE id=? AND status IN ('requested','approved')`,
      [transferReference.trim(), now.toISOString(), payoutId])
    if (!result.changes) throw new Error('Payout cannot be paid')
    // The transfer completed: mark the reserved commissions paid.
    await db.run("UPDATE affiliate_commissions SET status='paid',updated_at=? WHERE id IN (SELECT commission_id FROM affiliate_payout_items WHERE payout_id=?)",
      [now.toISOString(), payoutId])
    await db.exec('COMMIT')
  } catch (error) { await db.exec('ROLLBACK'); throw error }
}

/**
 * Rejects or cancels a payout that has NOT been transferred yet. Any reserved
 * commissions are returned to the available pool so the affiliate can re-request.
 */
export async function rejectPayout(payoutId: string, now = new Date()): Promise<void> {
  const db = await getDb()
  await db.exec('BEGIN IMMEDIATE')
  try {
    const result = await db.run("UPDATE affiliate_payouts SET status='rejected' WHERE id=? AND status IN ('requested','approved')", [payoutId])
    if (!result.changes) throw new Error('Payout can only be rejected while requested or approved')
    await db.run("UPDATE affiliate_commissions SET status='available',updated_at=? WHERE id IN (SELECT commission_id FROM affiliate_payout_items WHERE payout_id=?) AND status='reserved'",
      [now.toISOString(), payoutId])
    await db.run(`INSERT INTO affiliate_audit_log (id,actor_type,action,entity_type,entity_id,created_at) VALUES (?,'admin','payout.rejected','payout',?,?)`,
      [randomUUID(), payoutId, now.toISOString()])
    await db.exec('COMMIT')
  } catch (error) { await db.exec('ROLLBACK'); throw error }
}

export async function cancelPayout(payoutId: string, now = new Date()): Promise<void> {
  const db = await getDb()
  await db.exec('BEGIN IMMEDIATE')
  try {
    const result = await db.run("UPDATE affiliate_payouts SET status='cancelled' WHERE id=? AND status IN ('requested','approved')", [payoutId])
    if (!result.changes) throw new Error('Payout can only be cancelled while requested or approved')
    await db.run("UPDATE affiliate_commissions SET status='available',updated_at=? WHERE id IN (SELECT commission_id FROM affiliate_payout_items WHERE payout_id=?) AND status='reserved'",
      [now.toISOString(), payoutId])
    await db.run(`INSERT INTO affiliate_audit_log (id,actor_type,action,entity_type,entity_id,created_at) VALUES (?,'admin','payout.cancelled','payout',?,?)`,
      [randomUUID(), payoutId, now.toISOString()])
    await db.exec('COMMIT')
  } catch (error) { await db.exec('ROLLBACK'); throw error }
}
