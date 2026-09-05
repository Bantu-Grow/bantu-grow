import { dueReminderEmail, overdueEmail, sendEmail } from '@/lib/email'
import { getInvoicesDueForReminder, getOverdueInvoices, invoicePublicUrl, recordInvoiceReminder } from '@/lib/affiliate/billing'
import { INVOICE_OVERDUE_CODE, INVOICE_REMINDER_SCHEDULE } from '@/lib/affiliate/constants'
import { isCronAuthorized, unauthorizedCronResponse } from '@/lib/email/cron-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ReminderTargets { invoiceId: string; email: string; invoiceNumber: string; dueAt?: string; publicToken?: string | null }

/**
 * Sends due-date reminders (H-14, H-7, H-1) and overdue notices. Each reminder
 * code is sent at most once per invoice (idempotent), retried automatically by
 * the email-retry cron when SMTP is unavailable.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isCronAuthorized(request)) return unauthorizedCronResponse()
  const now = new Date()
  let sent = 0
  const failed: string[] = []

  const db = await import('@/lib/db').then((module) => module.getDb())
  const targets = async (): Promise<Map<string, ReminderTargets>> => {
    const rows = await db.all<{ id: string; email: string; invoice_number: string; due_at: string; public_token: string | null }[]>(`
      SELECT i.id, c.email, i.invoice_number, i.due_at, i.public_token FROM affiliate_invoices i
      JOIN affiliate_subscriptions s ON s.id=i.subscription_id JOIN affiliate_customers c ON c.id=s.customer_id
      WHERE i.status IN ('sent','overdue')`)
    return new Map(rows.map((row) => [row.id, { invoiceId: row.id, email: row.email, invoiceNumber: row.invoice_number, dueAt: row.due_at, publicToken: row.public_token }]))
  }

  for (const reminder of INVOICE_REMINDER_SCHEDULE) {
    const due = await getInvoicesDueForReminder(reminder.code, reminder.daysAhead, now)
    const map = await targets()
    for (const invoice of due) {
      const meta = map.get(invoice.invoiceId)
      if (!meta) continue
      try {
        await sendEmail(dueReminderEmail(meta.email, {
          customerName: '',
          invoiceNumber: meta.invoiceNumber,
          amount: 0,
          dueDate: meta.dueAt ? new Date(meta.dueAt).toLocaleDateString('id-ID') : '',
          reminderCode: reminder.code,
          publicUrl: meta.publicToken ? invoicePublicUrl(meta.publicToken) : undefined,
        }))
        await recordInvoiceReminder(invoice.invoiceId, reminder.code, 'sent', null, now)
        sent += 1
      } catch (error) {
        await recordInvoiceReminder(invoice.invoiceId, reminder.code, 'failed', error instanceof Error ? error.message : 'unknown', now)
        failed.push(`${invoice.invoiceId}:${reminder.code}`)
      }
    }
  }

  const overdue = await getOverdueInvoices(now)
  const map = await targets()
  for (const invoice of overdue) {
    const meta = map.get(invoice.invoiceId)
    if (!meta) continue
    try {
      await sendEmail(overdueEmail(meta.email, {
        customerName: '',
        invoiceNumber: meta.invoiceNumber,
        amount: 0,
        dueDate: meta.dueAt ? new Date(meta.dueAt).toLocaleDateString('id-ID') : '',
        publicUrl: meta.publicToken ? invoicePublicUrl(meta.publicToken) : undefined,
      }))
      await recordInvoiceReminder(invoice.invoiceId, INVOICE_OVERDUE_CODE, 'sent', null, now)
      sent += 1
    } catch (error) {
      await recordInvoiceReminder(invoice.invoiceId, INVOICE_OVERDUE_CODE, 'failed', error instanceof Error ? error.message : 'unknown', now)
      failed.push(`${invoice.invoiceId}:${INVOICE_OVERDUE_CODE}`)
    }
  }

  return Response.json({ sent, failed }, { status: failed.length ? 207 : 200 })
}
