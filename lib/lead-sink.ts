import type { ContactInput } from './contact-validation'
import { insertLead } from './db'

export interface Lead extends ContactInput {
  id: string // UUID
  receivedAt: string // ISO timestamp
}

export interface LeadSink {
  record(lead: Lead): Promise<void>
}

/**
 * Default lead sink: logs the lead to the console and writes it to the database.
 * Also logs placeholder notifications (admin email + auto-reply).
 */
export const defaultLeadSink: LeadSink = {
  async record(lead: Lead): Promise<void> {
    // Only non-identifying metadata is logged: the full payload (name, email,
    // phone, message) is PII and must not end up in server logs.
    console.log('[BantuGrow Lead] received', { id: lead.id, productSlug: lead.productSlug ?? null })
    await insertLead(lead)

    // TODO: Send email notification to admin when an email provider is configured
    // Example: await sendEmail({ to: 'admin@bantugrow.id', subject: `New lead: ${lead.name}`, body: ... })

    // TODO: Send auto-reply email to the lead when an email provider is configured
    // Example: await sendEmail({ to: lead.email, subject: 'Terima kasih telah menghubungi BantuGrow', body: ... })
  },
}
