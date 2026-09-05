import { getDb } from '@/lib/db'
import type { AffiliateStatus, CommissionStatus, InvoiceStatus } from './types'

export interface AdminAffiliateRow { id: string; name: string; email: string; referralCode: string; status: AffiliateStatus; emailVerifiedAt: string | null; createdAt: string; clicks: number; leads: number; customers: number }
export interface AdminCustomerRow { id: string; name: string; email: string; affiliateId: string | null; affiliateName: string | null; fraudStatus: string; createdAt: string }
export interface AdminSubscriptionRow { id: string; customerId: string; customerName: string; productCode: string; status: string; periodStart: string; periodEnd: string }
export interface AdminInvoiceRow { id: string; invoiceNumber: string; customerName: string; customerEmail: string; subscriptionId: string; amount: number; status: InvoiceStatus; cycleNumber: number; dueAt: string; paidAt: string | null; publicToken?: string }
export interface AdminCommissionRow { id: string; invoiceId: string; invoiceNumber: string; affiliateName: string; customerName: string; amount: number; rateBasisPoints: number; status: CommissionStatus; holdUntil: string; fraudReason: string | null }
export interface AdminPayoutRow { id: string; affiliateName: string; amount: number; status: string; bankAccountSnapshot: string; transferReference: string | null; taxType: string | null; taxAmount: number; netAmount: number; requestedAt: string; paidAt: string | null }

/** Read models used only by the authenticated administration interface. */
export async function listAdminAffiliates(): Promise<AdminAffiliateRow[]> {
  const db = await getDb()
  const rows = await db.all<Array<{ id:string; name:string; email:string; referral_code:string; status:AffiliateStatus; email_verified_at:string|null; created_at:string; clicks:number; leads:number; customers:number }>>(`SELECT a.id,a.name,a.email,a.referral_code,a.status,a.email_verified_at,a.created_at,
    (SELECT COUNT(*) FROM referral_clicks r WHERE r.affiliate_id=a.id) clicks,
    (SELECT COUNT(*) FROM affiliate_attributions t WHERE t.affiliate_id=a.id) leads,
    (SELECT COUNT(*) FROM affiliate_customers c WHERE c.affiliate_id=a.id) customers FROM affiliates a ORDER BY a.created_at DESC`)
  return rows.map(r => ({ id:r.id,name:r.name,email:r.email,referralCode:r.referral_code,status:r.status,emailVerifiedAt:r.email_verified_at,createdAt:r.created_at,clicks:r.clicks,leads:r.leads,customers:r.customers }))
}

export async function listAdminCustomers(): Promise<AdminCustomerRow[]> {
  const db = await getDb()
  const rows = await db.all<Array<{ id:string; name:string; email:string; affiliate_id:string|null; affiliate_name:string|null; fraud_status:string; created_at:string }>>(`SELECT c.id,c.name,c.email,c.affiliate_id,a.name affiliate_name,c.fraud_status,c.created_at FROM affiliate_customers c LEFT JOIN affiliates a ON a.id=c.affiliate_id ORDER BY c.created_at DESC`)
  return rows.map(r => ({ id:r.id,name:r.name,email:r.email,affiliateId:r.affiliate_id,affiliateName:r.affiliate_name,fraudStatus:r.fraud_status,createdAt:r.created_at }))
}

export async function listAdminSubscriptions(): Promise<AdminSubscriptionRow[]> {
  const db = await getDb()
  const rows = await db.all<Array<{ id:string; customer_id:string; customer_name:string; product_code:string; status:string; current_period_start:string; current_period_end:string }>>(`SELECT s.id,s.customer_id,c.name customer_name,s.product_code,s.status,s.current_period_start,s.current_period_end FROM affiliate_subscriptions s JOIN affiliate_customers c ON c.id=s.customer_id ORDER BY s.created_at DESC`)
  return rows.map(r => ({ id:r.id,customerId:r.customer_id,customerName:r.customer_name,productCode:r.product_code,status:r.status,periodStart:r.current_period_start,periodEnd:r.current_period_end }))
}

export async function listAdminInvoices(): Promise<AdminInvoiceRow[]> {
  const db = await getDb()
  const rows = await db.all<Array<{ id:string; invoice_number:string; customer_name:string; customer_email:string; subscription_id:string; amount:number; status:InvoiceStatus; cycle_number:number; due_at:string; paid_at:string|null; public_token:string|null }>>(`SELECT i.id,i.invoice_number,c.name customer_name,c.email customer_email,i.subscription_id,i.amount,i.status,i.cycle_number,i.due_at,i.paid_at,i.public_token FROM affiliate_invoices i JOIN affiliate_subscriptions s ON s.id=i.subscription_id JOIN affiliate_customers c ON c.id=s.customer_id ORDER BY i.created_at DESC`)
  return rows.map(r => ({ id:r.id,invoiceNumber:r.invoice_number,customerName:r.customer_name,customerEmail:r.customer_email,subscriptionId:r.subscription_id,amount:r.amount,status:r.status,cycleNumber:r.cycle_number,dueAt:r.due_at,paidAt:r.paid_at,publicToken:r.public_token ?? undefined }))
}

export async function listAdminCommissions(): Promise<AdminCommissionRow[]> {
  const db = await getDb()
  const rows = await db.all<Array<{ id:string; invoice_id:string; invoice_number:string; affiliate_name:string; customer_name:string; amount:number; rate_basis_points:number; status:CommissionStatus; hold_until:string; fraud_reason:string|null }>>(`SELECT m.id,m.invoice_id,i.invoice_number,a.name affiliate_name,c.name customer_name,m.amount,m.rate_basis_points,m.status,m.hold_until,m.fraud_reason FROM affiliate_commissions m JOIN affiliates a ON a.id=m.affiliate_id JOIN affiliate_customers c ON c.id=m.customer_id JOIN affiliate_invoices i ON i.id=m.invoice_id ORDER BY m.created_at DESC`)
  return rows.map(r => ({ id:r.id,invoiceId:r.invoice_id,invoiceNumber:r.invoice_number,affiliateName:r.affiliate_name,customerName:r.customer_name,amount:r.amount,rateBasisPoints:r.rate_basis_points,status:r.status,holdUntil:r.hold_until,fraudReason:r.fraud_reason }))
}

export async function listAdminPayouts(): Promise<AdminPayoutRow[]> {
  const db = await getDb()
  const rows = await db.all<Array<{ id:string; affiliate_name:string; amount:number; status:string; bank_account_snapshot:string; transfer_reference:string|null; tax_type:string|null; tax_amount:number; net_amount:number; requested_at:string; paid_at:string|null }>>(`SELECT p.id,a.name affiliate_name,p.amount,p.status,p.bank_account_snapshot,p.transfer_reference,p.tax_type,p.tax_amount,p.net_amount,p.requested_at,p.paid_at FROM affiliate_payouts p JOIN affiliates a ON a.id=p.affiliate_id ORDER BY p.requested_at DESC`)
  return rows.map(r => ({ id:r.id,affiliateName:r.affiliate_name,amount:r.amount,status:r.status,bankAccountSnapshot:r.bank_account_snapshot,transferReference:r.transfer_reference,taxType:r.tax_type,taxAmount:r.tax_amount,netAmount:r.net_amount,requestedAt:r.requested_at,paidAt:r.paid_at }))
}

/** Converts an attributed lead/demo into a customer while locking attribution. */
export async function resolveConversionAffiliate(sourceId: string): Promise<string | undefined> {
  const db = await getDb()
  const row = await db.get<{ affiliate_id:string }>(`SELECT affiliate_id FROM affiliate_attributions WHERE (lead_id=? OR demo_request_id=?) AND locked_at IS NULL AND expires_at>?`, [sourceId, sourceId, new Date().toISOString()])
  return row?.affiliate_id
}

export async function lockConversion(sourceId: string, customerId: string): Promise<void> {
  const db = await getDb()
  await db.run(`UPDATE affiliate_attributions SET customer_id=?,locked_at=? WHERE (lead_id=? OR demo_request_id=?) AND locked_at IS NULL`, [customerId,new Date().toISOString(),sourceId,sourceId])
}

export async function setSubscriptionStatus(subscriptionId: string, status: 'active' | 'past_due' | 'cancelled' | 'expired', now = new Date()): Promise<void> {
  const db = await getDb()
  const cancelledAt = status === 'cancelled' ? now.toISOString() : null
  const result = await db.run('UPDATE affiliate_subscriptions SET status=?,cancelled_at=?,updated_at=? WHERE id=?', [status, cancelledAt, now.toISOString(), subscriptionId])
  if (!result.changes) throw new Error('Subscription not found')
}

export async function approvePayout(payoutId: string): Promise<void> {
  const db = await getDb()
  const result = await db.run("UPDATE affiliate_payouts SET status='approved' WHERE id=? AND status='requested'", [payoutId])
  if (!result.changes) throw new Error('Payout cannot be approved')
}

export async function getInvoiceForEmail(id: string): Promise<AdminInvoiceRow | null> {
  return (await listAdminInvoices()).find(invoice => invoice.id === id) ?? null
}
