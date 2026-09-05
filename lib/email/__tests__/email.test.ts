import { describe, expect, it } from 'vitest'
import {
  affiliateVerificationEmail,
  affiliateWelcomeEmail,
  commissionApprovedEmail,
  commissionReleasedEmail,
  dueReminderEmail,
  invoiceEmail,
  invoicePaidEmail,
  overdueEmail,
  payoutProcessedEmail,
  payoutRejectedEmail,
  renewalReminderEmail,
} from '../templates'
import { isCronAuthorized } from '../cron-auth'

describe('email templates', () => {
  it('renders invoice content and escapes untrusted HTML', () => {
    const email = invoiceEmail('buyer@example.com', {
      customerName: '<script>alert(1)</script>', invoiceNumber: 'INV-1', amount: 1_000_000,
      dueDate: '2026-10-01', paymentInstructions: 'Transfer ke rekening BantuGrow',
    })
    expect(email.kind).toBe('invoice')
    expect(email.text.replace(/\u00A0/g, ' ')).toContain('Rp 1.000.000')
    expect(email.html).not.toContain('<script>alert')
    expect(email.html).toContain('&lt;script&gt;')
    expect(email.html).not.toContain('background:#2563eb') // no CTA without publicUrl
  })

  it('renders the invoice CTA link when a publicUrl is provided', () => {
    const email = invoiceEmail('buyer@example.com', {
      customerName: 'Andi', invoiceNumber: 'INV-1', amount: 2_000_000, dueDate: '2026-10-01',
      paymentInstructions: 'Transfer', publicUrl: 'https://www.bantugrow.com/invoice/abc123',
    })
    expect(email.html).toContain('https://www.bantugrow.com/invoice/abc123')
    expect(email.text).toContain('https://www.bantugrow.com/invoice/abc123')
  })

  it('renders each affiliate and lifecycle email kind', () => {
    expect(renewalReminderEmail('a@b.com', { customerName: 'A', productName: 'CRM', renewalDate: '2026-10-01', amount: 2 }).kind).toBe('renewal-reminder')
    expect(affiliateWelcomeEmail('a@b.com', { affiliateName: 'A', referralCode: 'REF', dashboardUrl: 'https://example.com' }).kind).toBe('affiliate-welcome')
    expect(affiliateVerificationEmail('a@b.com', { affiliateName: 'A', verificationUrl: 'https://example.com/verify' }).kind).toBe('affiliate-verification')
    expect(commissionApprovedEmail('a@b.com', { affiliateName: 'A', amount: 2, customerName: 'B' }).kind).toBe('commission-approved')
    expect(dueReminderEmail('a@b.com', { customerName: 'A', invoiceNumber: 'INV-1', amount: 2, dueDate: '2026-10-01', reminderCode: 'H7' }).kind).toBe('invoice-due-reminder')
    expect(overdueEmail('a@b.com', { customerName: 'A', invoiceNumber: 'INV-1', amount: 2, dueDate: '2026-10-01' }).kind).toBe('invoice-overdue')
    expect(invoicePaidEmail('a@b.com', { customerName: 'A', invoiceNumber: 'INV-1', amount: 2, paidDate: '2026-10-01' }).kind).toBe('invoice-paid')
    expect(commissionReleasedEmail('a@b.com', { affiliateName: 'A', amount: 2, releasedCount: 3 }).kind).toBe('commission-released')
    expect(payoutProcessedEmail('a@b.com', { affiliateName: 'A', grossAmount: 200_000, taxAmount: 50_000, netAmount: 150_000, transferReference: 'TRX' }).kind).toBe('payout-processed')
    expect(payoutRejectedEmail('a@b.com', { affiliateName: 'A', amount: 200_000 }).kind).toBe('payout-rejected')
  })

  it('shows tax breakdown on the payout processed template', () => {
    const email = payoutProcessedEmail('a@b.com', { affiliateName: 'A', grossAmount: 200_000, taxAmount: 50_000, netAmount: 150_000, transferReference: 'TRX-001' })
    expect(email.text.replace(/\u00A0/g, ' ')).toContain('Rp 150.000')
    expect(email.text).toContain('TRX-001')
  })
})

describe('cron authentication', () => {
  it('requires the configured bearer secret', () => {
    process.env.CRON_SECRET = 'strong-secret'
    expect(isCronAuthorized(new Request('https://example.com', { headers: { authorization: 'Bearer strong-secret' } }))).toBe(true)
    expect(isCronAuthorized(new Request('https://example.com', { headers: { authorization: 'Bearer wrong' } }))).toBe(false)
    delete process.env.CRON_SECRET
    expect(isCronAuthorized(new Request('https://example.com'))).toBe(false)
  })
})

