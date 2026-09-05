'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { checkAdminSession } from './admin'
import { approvePayout, cancelPayout, createCustomer, createInvoice, createSubscription, getInvoiceForEmail, lockConversion, markInvoicePaid, markPayoutPaid, rejectPayout, releaseHeldCommissions, resolveConversionAffiliate, setAffiliateStatus, setInvoiceStatus, setSubscriptionStatus, voidCommission } from '@/lib/affiliate'
import { invoiceEmail, sendEmail } from '@/lib/email'
import { invoicePublicUrl } from '@/lib/affiliate/billing'

export interface AdminOperationResult { success: boolean; error?: string }
const id = z.string().uuid('ID tidak valid')
const date = z.coerce.date()
const email = z.string().email('Email tidak valid').max(254)
const text = z.string().trim().min(1, 'Kolom wajib diisi').max(200)

async function mutate(operation: () => Promise<void>): Promise<AdminOperationResult> {
  if (!(await checkAdminSession())) return { success: false, error: 'Tidak terotorisasi' }
  try {
    await operation()
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan sistem' }
  }
}

export async function updateAffiliateStatusAction(affiliateId: string, status: string): Promise<AdminOperationResult> {
  return mutate(async () => {
    const input = z.object({ affiliateId:id, status:z.enum(['pending','active','suspended','rejected']) }).parse({ affiliateId, status })
    await setAffiliateStatus(input.affiliateId, input.status)
  })
}

export async function createCustomerAction(input: { name:string; email:string; affiliateId?:string; sourceId?:string }): Promise<AdminOperationResult> {
  return mutate(async () => {
    const parsed = z.object({ name:text, email, affiliateId:id.optional(), sourceId:id.optional() }).parse(input)
    const affiliateId = parsed.affiliateId ?? (parsed.sourceId ? await resolveConversionAffiliate(parsed.sourceId) : undefined)
    const customerId = await createCustomer({ name:parsed.name, email:parsed.email, affiliateId })
    if (parsed.sourceId) await lockConversion(parsed.sourceId, customerId)
  })
}

export async function createSubscriptionAction(input: { customerId:string; productCode:string; periodStart:string; periodEnd:string }): Promise<AdminOperationResult> {
  return mutate(async () => {
    const parsed = z.object({ customerId:id, productCode:text, periodStart:date, periodEnd:date }).parse(input)
    await createSubscription(parsed)
  })
}

export async function setSubscriptionStatusAction(subscriptionId:string, status:string): Promise<AdminOperationResult> {
  return mutate(async () => setSubscriptionStatus(id.parse(subscriptionId), z.enum(['active','past_due','cancelled','expired']).parse(status)))
}

export async function createInvoiceAction(input: { subscriptionId:string; amount:number; cycleNumber:number; dueAt:string }): Promise<AdminOperationResult> {
  return mutate(async () => {
    const parsed = z.object({ subscriptionId:id, amount:z.coerce.number().int().positive(), cycleNumber:z.coerce.number().int().positive(), dueAt:date }).parse(input)
    await createInvoice(parsed)
  })
}

export async function sendInvoiceAction(invoiceId: string): Promise<AdminOperationResult> {
  return mutate(async () => {
    const invoice = await getInvoiceForEmail(id.parse(invoiceId))
    if (!invoice) throw new Error('Invoice tidak ditemukan')
    if (invoice.status === 'paid' || invoice.status === 'void') throw new Error('Invoice tidak dapat dikirim')
    await sendEmail(invoiceEmail(invoice.customerEmail, {
      customerName: invoice.customerName,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      dueDate: new Date(invoice.dueAt).toLocaleDateString('id-ID'),
      paymentInstructions: process.env.INVOICE_PAYMENT_INSTRUCTIONS ?? 'Hubungi tim BantuGrow untuk instruksi pembayaran.',
      publicUrl: invoice.publicToken ? invoicePublicUrl(invoice.publicToken) : undefined,
    }))
    await setInvoiceStatus(invoice.id, 'sent')
  })
}

export async function setInvoiceStatusAction(invoiceId:string, status:string): Promise<AdminOperationResult> {
  return mutate(async () => setInvoiceStatus(id.parse(invoiceId), z.enum(['sent','overdue','void']).parse(status)))
}

export async function markInvoicePaidAction(invoiceId:string, paymentReference:string): Promise<AdminOperationResult> {
  return mutate(async () => { await markInvoicePaid(id.parse(invoiceId), text.parse(paymentReference)) })
}

export async function releaseCommissionsAction(): Promise<AdminOperationResult> {
  return mutate(async () => { await releaseHeldCommissions() })
}

export async function voidCommissionAction(invoiceId:string, reason:string): Promise<AdminOperationResult> {
  return mutate(async () => voidCommission(id.parse(invoiceId), text.parse(reason)))
}

export async function approvePayoutAction(payoutId:string): Promise<AdminOperationResult> {
  return mutate(async () => approvePayout(id.parse(payoutId)))
}

export async function rejectPayoutAction(payoutId:string): Promise<AdminOperationResult> {
  return mutate(async () => rejectPayout(id.parse(payoutId)))
}

export async function cancelPayoutAction(payoutId:string): Promise<AdminOperationResult> {
  return mutate(async () => cancelPayout(id.parse(payoutId)))
}

export async function markPayoutPaidAction(payoutId:string, reference:string): Promise<AdminOperationResult> {
  return mutate(async () => markPayoutPaid(id.parse(payoutId), text.parse(reference)))
}
