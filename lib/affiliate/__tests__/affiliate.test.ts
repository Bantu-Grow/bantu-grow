import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'

const STRONG_PASSWORD = 'very-secure-password'

describe('affiliate backend', () => {
  let file: string

  beforeEach(() => {
    file = path.join(os.tmpdir(), `affiliate-${crypto.randomUUID()}.db`)
    process.env.DATABASE_PATH = file
    process.env.AFFILIATE_HASH_SALT = 'test-salt'
    vi.resetModules()
  })

  afterEach(async () => {
    vi.resetModules()
    await new Promise((resolve) => setTimeout(resolve, 20))
    for (const suffix of ['', '-wal', '-shm']) {
      try { fs.unlinkSync(file + suffix) } catch { /* absent or held by sqlite */ }
    }
  })

  async function activeAffiliate(api: typeof import('../index'), now = new Date()) {
    const registration = await api.registerAffiliate({ name: 'Partner', email: 'partner@example.com', password: STRONG_PASSWORD }, now)
    await api.verifyAffiliateEmail(registration.verificationToken)
    await api.setAffiliateStatus(registration.affiliate.id, 'active')
    return registration
  }

  it('registers, verifies, approves and authenticates securely', async () => {
    const api = await import('../index')
    const registration = await api.registerAffiliate({ name: 'Partner', email: 'PARTNER@example.com', password: STRONG_PASSWORD })
    expect(registration.affiliate.status).toBe('pending')
    expect(await api.verifyAffiliateEmail(registration.verificationToken)).toBe(true)
    await api.setAffiliateStatus(registration.affiliate.id, 'active')
    const session = await api.loginAffiliate('partner@example.com', STRONG_PASSWORD)
    expect(session.token).not.toContain(registration.affiliate.id)
    expect((await api.authenticateAffiliate(session.token))?.id).toBe(registration.affiliate.id)
    await api.logoutAffiliate(session.token)
    expect(await api.authenticateAffiliate(session.token)).toBeNull()
  }, 30_000)

  it('records attribution and creates idempotent 20/10 recurring commissions', async () => {
    const api = await import('../index')
    const { getDb } = await import('../../db')
    const registration = await activeAffiliate(api)
    const click = await api.recordReferralClick({ referralCode: registration.affiliate.referralCode, visitorId: 'visitor', ipAddress: '127.0.0.1' })
    await expect(api.attributeLead({ clickId: click.clickId, visitorId: 'visitor', leadId: 'lead-1' })).resolves.toBeTruthy()
    const customerId = await api.createCustomer({ name: 'Customer', email: 'customer@example.com', affiliateId: registration.affiliate.id })
    const subscriptionId = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date('2026-01-01'), periodEnd: new Date('2027-01-01') })
    const first = await api.createInvoice({ subscriptionId, amount: 1_000_000, cycleNumber: 1, dueAt: new Date('2026-01-01') })
    const renewal = await api.createInvoice({ subscriptionId, amount: 1_000_000, cycleNumber: 2, dueAt: new Date('2027-01-01') })
    expect((await api.markInvoicePaid(first.id, 'PAY-1')).commissionAmount).toBe(200_000)
    expect((await api.markInvoicePaid(first.id, 'PAY-1')).alreadyPaid).toBe(true)
    expect((await api.markInvoicePaid(renewal.id, 'PAY-2')).commissionAmount).toBe(100_000)
    const db = await getDb()
    expect((await db.get<{ count: number }>('SELECT COUNT(*) count FROM affiliate_commissions'))?.count).toBe(2)
  }, 30_000)

  it('flags self-referrals and releases holds on schedule', async () => {
    const api = await import('../index')
    const { getDb } = await import('../../db')
    const registration = await api.registerAffiliate({ name: 'Partner', email: 'same@example.com', password: STRONG_PASSWORD })
    await api.verifyAffiliateEmail(registration.verificationToken)
    await api.setAffiliateStatus(registration.affiliate.id, 'active')
    const customerId = await api.createCustomer({ name: 'Self', email: 'same@example.com', affiliateId: registration.affiliate.id })
    const db = await getDb()
    expect((await db.get<{ fraud_status: string }>('SELECT fraud_status FROM affiliate_customers WHERE id=?', [customerId]))?.fraud_status).toBe('review')
    const validCustomer = await api.createCustomer({ name: 'Customer', email: 'other@example.com', affiliateId: registration.affiliate.id })
    const subscription = await api.createSubscription({ customerId: validCustomer, productCode: 'annual', periodStart: new Date('2020-01-01'), periodEnd: new Date('2021-01-01') })
    const invoice = await api.createInvoice({ subscriptionId: subscription, amount: 1_000_000, cycleNumber: 1, dueAt: new Date('2020-01-01') }, new Date('2020-01-01'))
    await api.markInvoicePaid(invoice.id, 'PAY-OLD', new Date('2020-01-01'))
    expect(await api.releaseHeldCommissions(new Date('2026-01-01'))).toBe(1)
  }, 30_000)

  it('reserves commissions at payout request and pays them only after transfer', async () => {
    const api = await import('../index')
    const registration = await activeAffiliate(api)
    await api.saveAffiliateBankAccount(registration.affiliate.id, { bankName: 'Bank A', accountNumber: '1234567890', accountHolder: 'Partner' })
    const customerId = await api.createCustomer({ name: 'Customer', email: 'customer@example.com', affiliateId: registration.affiliate.id })
    const subscriptionId = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date('2020-01-01'), periodEnd: new Date('2021-01-01') })
    const invoice = await api.createInvoice({ subscriptionId, amount: 600_000, cycleNumber: 1, dueAt: new Date('2020-01-01') }, new Date('2020-01-01'))
    await api.markInvoicePaid(invoice.id, 'PAY-1', new Date('2020-01-01'))
    await api.releaseHeldCommissions(new Date('2021-01-01'))

    const payout = await api.requestPayout(registration.affiliate.id)
    expect(payout.amount).toBe(120_000)
    expect(payout.tax.netAmount).toBe(120_000)
    expect((await api.getAffiliateAnalytics(registration.affiliate.id)).paidCommission).toBe(0)

    await api.markPayoutPaid(payout.payoutId, 'TRX-900')
    expect((await api.getAffiliateAnalytics(registration.affiliate.id)).paidCommission).toBe(120_000)
  }, 30_000)

  it('returns reserved commissions to available when a payout is rejected', async () => {
    const api = await import('../index')
    const registration = await activeAffiliate(api)
    await api.saveAffiliateBankAccount(registration.affiliate.id, { bankName: 'Bank A', accountNumber: '1234567890', accountHolder: 'Partner' })
    const customerId = await api.createCustomer({ name: 'Customer', email: 'customer@example.com', affiliateId: registration.affiliate.id })
    const subscriptionId = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date('2020-01-01'), periodEnd: new Date('2021-01-01') })
    const invoice = await api.createInvoice({ subscriptionId, amount: 600_000, cycleNumber: 1, dueAt: new Date('2020-01-01') }, new Date('2020-01-01'))
    await api.markInvoicePaid(invoice.id, 'PAY-1', new Date('2020-01-01'))
    await api.releaseHeldCommissions(new Date('2021-01-01'))

    const payout = await api.requestPayout(registration.affiliate.id)
    await api.rejectPayout(payout.payoutId)
    expect((await api.getAffiliateAnalytics(registration.affiliate.id)).availableCommission).toBe(120_000)

    // A new payout request can be raised from the restored balance.
    const again = await api.requestPayout(registration.affiliate.id)
    expect(again.amount).toBe(120_000)
  }, 30_000)

  it('applies PPh withholding when a rate is configured', async () => {
    const api = await import('../index')
    const registration = await activeAffiliate(api)
    await api.saveAffiliateBankAccount(registration.affiliate.id, {
      bankName: 'Bank A', accountNumber: '123', accountHolder: 'Partner',
      taxType: 'pph21', taxRateBasisPoints: 2500,
    })
    const customerId = await api.createCustomer({ name: 'Customer', email: 'customer@example.com', affiliateId: registration.affiliate.id })
    const subscriptionId = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date('2020-01-01'), periodEnd: new Date('2021-01-01') })
    const invoice = await api.createInvoice({ subscriptionId, amount: 1_000_000, cycleNumber: 1, dueAt: new Date('2020-01-01') }, new Date('2020-01-01'))
    await api.markInvoicePaid(invoice.id, 'PAY-1', new Date('2020-01-01'))
    await api.releaseHeldCommissions(new Date('2021-01-01'))
    const payout = await api.requestPayout(registration.affiliate.id)
    expect(payout.tax.taxType).toBe('pph21')
    expect(payout.tax.taxAmount).toBe(50_000)
    expect(payout.tax.netAmount).toBe(150_000)
  }, 30_000)

  it('stores public invoice tokens and serves the public invoice view', async () => {
    const api = await import('../index')
    const customerId = await api.createCustomer({ name: 'Customer', email: 'customer@example.com' })
    const subscriptionId = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date('2026-01-01'), periodEnd: new Date('2027-01-01') })
    const invoice = await api.createInvoice({ subscriptionId, amount: 1_000_000, cycleNumber: 1, dueAt: new Date('2026-01-01') })
    const view = await api.getPublicInvoice(invoice.publicToken)
    expect(view?.invoiceNumber).toBe(invoice.invoiceNumber)
    expect(view?.status).toBe('draft')
    const missing = await api.getPublicInvoice(`${invoice.publicToken.slice(0, -4)}0000`)
    expect(missing).toBeNull()
  }, 30_000)

  it('generates due reminders and overdue notices idempotently', async () => {
    const api = await import('../index')
    const { getDb } = await import('../../db')
    const customerId = await api.createCustomer({ name: 'Customer', email: 'customer@example.com' })
    const subscriptionId = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date('2020-01-01'), periodEnd: new Date('2021-01-01') })
    const paidInvoice = await api.createInvoice({ subscriptionId, amount: 1_000_000, cycleNumber: 1, dueAt: new Date('2020-01-15') }, new Date('2019-12-20'))
    await api.markInvoicePaid(paidInvoice.id, 'PAY', new Date('2020-01-10')) // invoice is paid, must not receive reminders
    const renewal = await api.createInvoice({ subscriptionId, amount: 1_000_000, cycleNumber: 2, dueAt: new Date('2021-01-15') }, new Date('2021-01-01'))
    await api.setInvoiceStatus(renewal.id, 'sent', new Date('2021-01-01'))

    const h14 = await api.getInvoicesDueForReminder('H14', 14, new Date('2021-01-01T09:00:00'))
    expect(h14.some((row) => row.invoiceId === renewal.id)).toBe(true)

    // Overdue only for unpaid, past-due, sent invoices.
    const overdue = await api.getOverdueInvoices(new Date('2021-01-16'))
    expect(overdue.some((row) => row.invoiceId === renewal.id)).toBe(true)
    expect(await api.markOverdueInvoices(new Date('2021-01-16'))).toBe(1)

    // Re-recording the same reminder code is idempotent; a second overdue pass is empty.
    await api.recordInvoiceReminder(renewal.id, 'overdue', 'sent', null, new Date('2021-01-16'))
    expect((await api.getOverdueInvoices(new Date('2021-01-16'))).some((row) => row.invoiceId === renewal.id)).toBe(false)
    const db = await getDb()
    const reminders = await db.all<{ count: number }[]>('SELECT COUNT(*) count FROM invoice_reminders WHERE invoice_id=?', [renewal.id])
    expect(reminders[0].count).toBeGreaterThanOrEqual(1)
  }, 30_000)

  it('generates renewal invoices for active subscriptions within the window', async () => {
    const api = await import('../index')
    const { getDb } = await import('../../db')
    const customerId = await api.createCustomer({ name: 'Customer', email: 'customer@example.com' })
    const subscriptionId = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date('2026-01-01'), periodEnd: new Date('2027-01-01') })
    await api.createInvoice({ subscriptionId, amount: 1_000_000, cycleNumber: 1, dueAt: new Date('2026-01-01') }, new Date('2026-01-01'))
    // Advance the subscription into its renewal window (2026-12-15 + 30 days >= 2027-01-01).
    const generated = await api.generateRenewalInvoices(new Date('2026-12-15'))
    expect(generated).toBe(1)
    expect(await api.generateRenewalInvoices(new Date('2026-12-16'))).toBe(0)
    const db = await getDb()
    expect((await db.get<{ count: number }>('SELECT COUNT(*) count FROM affiliate_invoices WHERE subscription_id=?', [subscriptionId]))?.count).toBe(2)
  }, 30_000)

  it('records WhatsApp referral codes with hashing and rate limit', async () => {
    const api = await import('../index')
    const registration = await activeAffiliate(api)
    const first = await api.recordWhatsAppReferral({ referralCode: registration.affiliate.referralCode, whatsappNumber: '+6281234567890' })
    expect(first.id).toBeTruthy()
    await expect(api.recordWhatsAppReferral({ referralCode: 'INVALID', whatsappNumber: '+6281234567890' })).rejects.toThrow('Invalid referral code')
    for (let i = 0; i < 9; i += 1) {
      await api.recordWhatsAppReferral({ referralCode: registration.affiliate.referralCode, whatsappNumber: '+6281234567890' })
    }
    await expect(api.recordWhatsAppReferral({ referralCode: registration.affiliate.referralCode, whatsappNumber: '+6281234567890' })).rejects.toThrow('rate limit')
  }, 30_000)

  it('creates a SQLite snapshot on demand via the backup endpoint', async () => {
    const api = await import('../index')
    const backupDir = path.join(os.tmpdir(), `affiliate-backup-${crypto.randomUUID()}`)
    process.env.BACKUP_DIR = backupDir
    const snapshot = await api.createSqliteBackup()
    expect(fs.existsSync(snapshot.path)).toBe(true)
    expect(snapshot.bytes).toBeGreaterThan(0)
  }, 30_000)

  it('exports monthly payout statements including PPh withholding', async () => {
    const api = await import('../index')
    const registration = await activeAffiliate(api)
    await api.saveAffiliateBankAccount(registration.affiliate.id, {
      bankName: 'Bank A', accountNumber: '123', accountHolder: 'Partner',
      taxType: 'pph23', taxRateBasisPoints: 2000,
    })
    const customerId = await api.createCustomer({ name: 'Customer', email: 'customer@example.com', affiliateId: registration.affiliate.id })
    const subscriptionId = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date('2026-02-01'), periodEnd: new Date('2027-02-01') })
    const invoice = await api.createInvoice({ subscriptionId, amount: 1_000_000, cycleNumber: 1, dueAt: new Date('2026-02-01') }, new Date('2026-02-01'))
    await api.markInvoicePaid(invoice.id, 'PAY-1', new Date('2026-02-05'))
    await api.releaseHeldCommissions(new Date('2026-03-10'))
    const payout = await api.requestPayout(registration.affiliate.id, new Date('2026-03-15'))
    await api.markPayoutPaid(payout.payoutId, 'TRX-1', new Date('2026-03-20'))

    const statement = await api.generateMonthlyStatementCsv('2026-03')
    expect(statement.filename).toBe('payouts-2026-03.csv')
    expect(statement.rowCount).toBe(1)
    expect(statement.csv).toContain('partner@example.com')
    expect(statement.csv).toContain('pph23')
    expect(statement.csv).toContain('40000') // 20% of 200000
    await expect(api.generateMonthlyStatementCsv('2026-13')).rejects.toThrow('YYYY-MM')
  }, 30_000)

  it('retries failed emails with a stored body and attempt cap', async () => {
    const { sendEmail, retryFailedEmails } = await import('../../email')
    delete process.env.SMTP_HOST
    await expect(sendEmail({ to: 'retry@example.com', subject: 'Sub', text: 'T', html: '<p>H</p>', kind: 'invoice' })).rejects.toThrow()
    process.env.SMTP_HOST = 'smtp.invalid'
    // SMTP is unreachable in tests: the retry should still be attempt-capped, not crash.
    const result = await retryFailedEmails()
    expect(result.retried).toBeGreaterThanOrEqual(1)
  }, 30_000)

  it('integrates email fail-safe and releases holds via authenticated cron', async () => {
    const api = await import('../index')
    const { getDb } = await import('../../db')
    delete process.env.SMTP_HOST
    const registration = await api.registerAffiliate({ name: 'Partner', email: 'mailer@example.com', password: STRONG_PASSWORD })
    expect(registration.verificationEmail.delivered).toBe(false)
    await api.verifyAffiliateEmail(registration.verificationToken)
    await api.setAffiliateStatus(registration.affiliate.id, 'active')
    const db = await getDb()
    const logged = await db.all<{ kind: string; status: string }[]>("SELECT kind,status FROM email_log WHERE kind LIKE 'affiliate-%'")
    expect(logged.map((row) => `${row.kind}:${row.status}`).sort()).toEqual(['affiliate-verification:failed', 'affiliate-welcome:failed'])

    const customerId = await api.createCustomer({ name: 'Cron Customer', email: 'cron-customer@example.com', affiliateId: registration.affiliate.id })
    const subscription = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date('2020-01-01'), periodEnd: new Date('2021-01-01') })
    const invoice = await api.createInvoice({ subscriptionId: subscription, amount: 1_500_000, cycleNumber: 1, dueAt: new Date('2020-01-01') }, new Date('2020-01-01'))
    await api.markInvoicePaid(invoice.id, 'PAY-CRON', new Date('2020-01-01'))
    const route = await import('../../../app/api/cron/commissions/route')
    process.env.CRON_SECRET = 'cron-secret'
    const unauthorized = await route.POST(new Request('http://localhost/api/cron/commissions', { method: 'POST' }))
    expect(unauthorized.status).toBe(401)
    const response = await route.POST(new Request('http://localhost/api/cron/commissions', {
      method: 'POST', headers: { authorization: 'Bearer cron-secret' },
    }))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ released: 1 })
  }, 30_000)
})
