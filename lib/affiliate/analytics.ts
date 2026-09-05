import { getDb } from '@/lib/db'
import type {
  AffiliateBankAccount,
  AffiliateCommissionSummary,
  AffiliatePayoutSummary,
  AffiliateReferralSummary,
} from './types'

export interface AffiliateAnalytics {
  clicks: number
  attributedLeads: number
  customers: number
  paidRevenue: number
  heldCommission: number
  availableCommission: number
  paidCommission: number
}

export async function getAffiliateAnalytics(affiliateId: string): Promise<AffiliateAnalytics> {
  const db = await getDb()
  const row = await db.get<AffiliateAnalytics>(`
    SELECT
      (SELECT COUNT(*) FROM referral_clicks WHERE affiliate_id=?) clicks,
      (SELECT COUNT(*) FROM affiliate_attributions WHERE affiliate_id=?) attributedLeads,
      (SELECT COUNT(*) FROM affiliate_customers WHERE affiliate_id=?) customers,
      COALESCE((SELECT SUM(i.amount) FROM affiliate_invoices i JOIN affiliate_subscriptions s ON s.id=i.subscription_id JOIN affiliate_customers c ON c.id=s.customer_id WHERE c.affiliate_id=? AND i.status='paid'),0) paidRevenue,
      COALESCE((SELECT SUM(amount) FROM affiliate_commissions WHERE affiliate_id=? AND status='held'),0) heldCommission,
      COALESCE((SELECT SUM(amount) FROM affiliate_commissions WHERE affiliate_id=? AND status='available'),0) availableCommission,
      COALESCE((SELECT SUM(amount) FROM affiliate_commissions WHERE affiliate_id=? AND status='paid'),0) paidCommission`,
    [affiliateId, affiliateId, affiliateId, affiliateId, affiliateId, affiliateId, affiliateId])
  return row ?? { clicks: 0, attributedLeads: 0, customers: 0, paidRevenue: 0, heldCommission: 0, availableCommission: 0, paidCommission: 0 }
}

export async function getAffiliatePortalData(affiliateId: string): Promise<{
  analytics: AffiliateAnalytics
  bankAccount: AffiliateBankAccount | null
  referrals: AffiliateReferralSummary[]
  commissions: AffiliateCommissionSummary[]
  payouts: AffiliatePayoutSummary[]
}> {
  const db = await getDb()
  const [analytics, affiliate, referralRows, commissionRows, payoutRows] = await Promise.all([
    getAffiliateAnalytics(affiliateId),
    db.get<{ bank_account_json: string | null }>('SELECT bank_account_json FROM affiliates WHERE id=?', [affiliateId]),
    db.all<{ id: string; lead_id: string | null; created_at: string }[]>('SELECT id,lead_id,created_at FROM affiliate_attributions WHERE affiliate_id=? ORDER BY created_at DESC LIMIT 50', [affiliateId]),
    db.all<{ id: string; amount: number; status: AffiliateCommissionSummary['status']; rate_basis_points: number; hold_until: string; created_at: string }[]>('SELECT id,amount,status,rate_basis_points,hold_until,created_at FROM affiliate_commissions WHERE affiliate_id=? ORDER BY created_at DESC LIMIT 50', [affiliateId]),
    db.all<{ id: string; amount: number; status: AffiliatePayoutSummary['status']; requested_at: string; paid_at: string | null }[]>('SELECT id,amount,status,requested_at,paid_at FROM affiliate_payouts WHERE affiliate_id=? ORDER BY requested_at DESC LIMIT 20', [affiliateId]),
  ])

  let bankAccount: AffiliateBankAccount | null = null
  if (affiliate?.bank_account_json) {
    try {
      const parsed: unknown = JSON.parse(affiliate.bank_account_json)
      if (parsed && typeof parsed === 'object') {
        const value = parsed as Record<string, unknown>
        if (typeof value.bankName === 'string' && typeof value.accountNumber === 'string' && typeof value.accountHolder === 'string') {
          bankAccount = {
            bankName: value.bankName,
            accountNumber: value.accountNumber,
            accountHolder: value.accountHolder,
            taxId: typeof value.taxId === 'string' ? value.taxId : undefined,
            taxType: value.taxType === 'pph21' || value.taxType === 'pph23' ? value.taxType : undefined,
            taxRateBasisPoints: typeof value.taxRateBasisPoints === 'number' ? value.taxRateBasisPoints : undefined,
          }
        }
      }
    } catch { /* Invalid legacy data is treated as missing and can be replaced. */ }
  }

  return {
    analytics,
    bankAccount,
    referrals: referralRows.map((row) => ({ id: row.id, kind: row.lead_id ? 'lead' : 'demo', createdAt: row.created_at })),
    commissions: commissionRows.map((row) => ({ id: row.id, amount: row.amount, status: row.status, rateBasisPoints: row.rate_basis_points, holdUntil: row.hold_until, createdAt: row.created_at })),
    payouts: payoutRows.map((row) => ({ id: row.id, amount: row.amount, status: row.status, requestedAt: row.requested_at, paidAt: row.paid_at })),
  }
}

export async function saveAffiliateBankAccount(affiliateId: string, account: AffiliateBankAccount, now = new Date()): Promise<void> {
  const values = [account.bankName, account.accountNumber, account.accountHolder].map((value) => value.trim())
  if (values.some((value) => !value) || values[0].length > 80 || values[1].length > 50 || values[2].length > 120) {
    throw new Error('Invalid bank account')
  }
  const taxId = account.taxId?.trim() || null
  if (taxId && taxId.length > 30) throw new Error('Invalid tax id')
  const taxType = account.taxType ?? null
  if (taxType && taxType !== 'pph21' && taxType !== 'pph23') throw new Error('Invalid tax type')
  const taxRate = account.taxRateBasisPoints ?? 0
  if (!Number.isInteger(taxRate) || taxRate < 0 || taxRate > 10_000) throw new Error('Invalid tax rate')

  const db = await getDb()
  const result = await db.run(
    'UPDATE affiliates SET bank_account_json=?,tax_id=?,tax_type=?,tax_rate_basis_points=?,updated_at=? WHERE id=? AND status=\'active\'',
    [
      JSON.stringify({ bankName: values[0], accountNumber: values[1], accountHolder: values[2] }),
      taxId,
      taxType,
      taxRate,
      now.toISOString(),
      affiliateId,
    ],
  )
  if (!result.changes) throw new Error('Affiliate is not active')
}

export async function getProgramAnalytics(): Promise<AffiliateAnalytics & { activeAffiliates: number }> {
  const db = await getDb()
  const totals = await db.get<{ clicks: number; attributedLeads: number; customers: number; paidRevenue: number; heldCommission: number; availableCommission: number; paidCommission: number; activeAffiliates: number }>(`
    SELECT (SELECT COUNT(*) FROM referral_clicks) clicks,(SELECT COUNT(*) FROM affiliate_attributions) attributedLeads,
    (SELECT COUNT(*) FROM affiliate_customers) customers,(SELECT COALESCE(SUM(amount),0) FROM affiliate_invoices WHERE status='paid') paidRevenue,
    (SELECT COALESCE(SUM(amount),0) FROM affiliate_commissions WHERE status='held') heldCommission,
    (SELECT COALESCE(SUM(amount),0) FROM affiliate_commissions WHERE status='available') availableCommission,
    (SELECT COALESCE(SUM(amount),0) FROM affiliate_commissions WHERE status='paid') paidCommission,
    (SELECT COUNT(*) FROM affiliates WHERE status='active') activeAffiliates`)
  return totals ?? { clicks: 0, attributedLeads: 0, customers: 0, paidRevenue: 0, heldCommission: 0, availableCommission: 0, paidCommission: 0, activeAffiliates: 0 }
}
