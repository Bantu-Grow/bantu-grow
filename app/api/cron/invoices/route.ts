import { getDb } from '@/lib/db'
import { invoiceEmail, sendEmail } from '@/lib/email'
import { invoicePublicUrl, setInvoiceStatus } from '@/lib/affiliate/billing'
import { isCronAuthorized, unauthorizedCronResponse } from '@/lib/email/cron-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface PendingInvoice {
  invoice_id: string
  invoice_number: string
  customer_name: string
  customer_email: string
  amount: number
  due_date: string
  public_token: string | null
  payment_instructions: string
}

/** Sends the invoice email for every draft (never-delivered) invoice. */
export async function POST(request: Request): Promise<Response> {
  if (!isCronAuthorized(request)) return unauthorizedCronResponse()
  const db = await getDb()
  const table = await db.get<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'affiliate_invoices'")
  if (!table) return Response.json({ processed: 0, skipped: 'affiliate_invoices table is not available' })

  const invoices = await db.all<PendingInvoice[]>(`
    SELECT i.id invoice_id, i.invoice_number, c.name customer_name, c.email customer_email, i.amount, i.due_at due_date, i.public_token,
      ? AS payment_instructions
    FROM affiliate_invoices i JOIN affiliate_subscriptions s ON s.id=i.subscription_id JOIN affiliate_customers c ON c.id=s.customer_id
    WHERE i.status = 'draft' ORDER BY i.due_at LIMIT 100`,
    [process.env.INVOICE_PAYMENT_INSTRUCTIONS ?? 'Hubungi tim BantuGrow untuk instruksi pembayaran.'])
  let sent = 0
  const failed: string[] = []
  for (const invoice of invoices) {
    try {
      await sendEmail(invoiceEmail(invoice.customer_email, {
        customerName: invoice.customer_name,
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        dueDate: new Date(invoice.due_date).toLocaleDateString('id-ID'),
        paymentInstructions: invoice.payment_instructions,
        publicUrl: invoice.public_token ? invoicePublicUrl(invoice.public_token) : undefined,
      }))
      await setInvoiceStatus(invoice.invoice_id, 'sent')
      sent += 1
    } catch {
      failed.push(invoice.invoice_id)
    }
  }
  return Response.json({ processed: invoices.length, sent, failed }, { status: failed.length ? 207 : 200 })
}
