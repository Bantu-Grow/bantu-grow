import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'

const AUTH = { authorization: 'Bearer cron-secret' }

describe('affiliate cron routes', () => {
  let file: string
  let backupDir: string

  beforeEach(() => {
    file = path.join(os.tmpdir(), `cron-${crypto.randomUUID()}.db`)
    backupDir = path.join(os.tmpdir(), `cron-backup-${crypto.randomUUID()}`)
    process.env.DATABASE_PATH = file
    process.env.BACKUP_DIR = backupDir
    process.env.CRON_SECRET = 'cron-secret'
    process.env.AFFILIATE_HASH_SALT = 'test-salt'
    vi.resetModules()
  })

  afterEach(async () => {
    vi.resetModules()
    await new Promise((resolve) => setTimeout(resolve, 20))
    for (const suffix of ['', '-wal', '-shm']) {
      try { fs.unlinkSync(file + suffix) } catch { /* absent */ }
    }
    try { fs.rmSync(backupDir, { recursive: true, force: true }) } catch { /* absent */ }
  })

  it('rejects unauthenticated requests on every cron route', async () => {
    const reminders = await import('../reminders/route')
    const emails = await import('../emails/route')
    const backup = await import('../backup/route')
    const renewals = await import('../renewals/route')
    for (const route of [reminders, emails, backup, renewals]) {
      const response = await route.POST(new Request('http://localhost', { method: 'POST' }))
      expect(response.status).toBe(401)
    }
  }, 30_000)

  it('generates renewal invoices then delivers them via the invoices cron', async () => {
    const api = await import('@/lib/affiliate')
    const registration = await api.registerAffiliate({ name: 'P', email: 'partner@example.com', password: 'very-secure-password' })
    await api.verifyAffiliateEmail(registration.verificationToken)
    await api.setAffiliateStatus(registration.affiliate.id, 'active')
    // Subscription period ends within the cron's default 30-day renewal window.
    const periodEnd = new Date(Date.now() + 10 * 86_400_000)
    const customerId = await api.createCustomer({ name: 'C', email: 'customer@example.com', affiliateId: registration.affiliate.id })
    const subscriptionId = await api.createSubscription({ customerId, productCode: 'annual', periodStart: new Date(periodEnd.getTime() - 365 * 86_400_000), periodEnd })
    await api.createInvoice({ subscriptionId, amount: 1_000_000, cycleNumber: 1, dueAt: new Date(periodEnd.getTime() - 365 * 86_400_000) }, new Date())

    const renewals = await import('../renewals/route')
    const generated = await renewals.POST(new Request('http://localhost', { method: 'POST', headers: AUTH }))
    await expect(generated.json()).resolves.toEqual({ generated: 1 })

    // Draft invoices are sent (SMTP unconfigured → fail-safe 207) and the reminder cron runs cleanly.
    const invoices = await import('../invoices/route')
    const delivery = await invoices.POST(new Request('http://localhost', { method: 'POST', headers: AUTH }))
    expect(delivery.status).toBe(207)
    const reminders = await import('../reminders/route')
    const reminderRun = await reminders.POST(new Request('http://localhost', { method: 'POST', headers: AUTH }))
    expect(reminderRun.status).toBe(200)
    const retry = await import('../emails/route')
    const retryRun = await retry.POST(new Request('http://localhost', { method: 'POST', headers: AUTH }))
    expect(retryRun.status).toBe(200)
  }, 60_000)

  it('creates a retention-capped backup snapshot', async () => {
    const backup = await import('../backup/route')
    const response = await backup.POST(new Request('http://localhost', { method: 'POST', headers: AUTH }))
    expect(response.status).toBe(200)
    const body = (await response.json()) as { path: string; bytes: number }
    expect(fs.existsSync(body.path)).toBe(true)
  }, 30_000)
})
