import { randomUUID } from 'crypto'
import nodemailer from 'nodemailer'
import { getDb } from '@/lib/db'
import { EMAIL_MAX_ATTEMPTS, EMAIL_RETRY_DAILY_LIMIT } from '@/lib/affiliate/constants'
import type { EmailMessage, SendEmailResult } from './types'

function smtpConfig() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  const from = process.env.EMAIL_FROM
  if (!host || !user || !pass || !from) {
    throw new Error('SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM are required')
  }
  const port = Number(process.env.SMTP_PORT ?? '587')
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('SMTP_PORT is invalid')
  return { host, port, secure: process.env.SMTP_SECURE === 'true', auth: { user, pass }, from }
}

interface EmailLogRow {
  id: string
  kind: string
  recipient: string
  subject: string
  reference_id: string | null
  attempts: number
  text_body: string | null
  html_body: string | null
}

async function ensureEmailLog(): Promise<void> {
  const db = await getDb()
  await db.exec(`CREATE TABLE IF NOT EXISTS email_log (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    reference_id TEXT,
    status TEXT NOT NULL CHECK(status IN ('sending', 'sent', 'failed')),
    provider_message_id TEXT,
    error_message TEXT,
    attempts INTEGER NOT NULL DEFAULT 1,
    text_body TEXT,
    html_body TEXT,
    created_at TEXT NOT NULL,
    sent_at TEXT
  ); CREATE INDEX IF NOT EXISTS idx_email_log_reference ON email_log(kind, reference_id, status);`)
  const columns = await db.all<{ name: string }[]>('PRAGMA table_info(email_log)')
  const names = new Set(columns.map((column) => column.name))
  if (columns.length) {
    if (!names.has('attempts')) await db.exec('ALTER TABLE email_log ADD COLUMN attempts INTEGER NOT NULL DEFAULT 1')
    if (!names.has('text_body')) await db.exec('ALTER TABLE email_log ADD COLUMN text_body TEXT')
    if (!names.has('html_body')) await db.exec('ALTER TABLE email_log ADD COLUMN html_body TEXT')
  }
}

async function deliver(message: EmailMessage): Promise<string | undefined> {
  const config = smtpConfig()
  const transporter = nodemailer.createTransport(config)
  const info = await transporter.sendMail({
    from: config.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  })
  return info.messageId
}

export async function sendEmail(message: EmailMessage): Promise<SendEmailResult> {
  await ensureEmailLog()
  const db = await getDb()
  const logId = randomUUID()
  const createdAt = new Date().toISOString()
  await db.run(
    'INSERT INTO email_log (id, kind, recipient, subject, reference_id, status, attempts, text_body, html_body, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)',
    [logId, message.kind, message.to, message.subject, message.referenceId ?? null, 'sending', message.text, message.html, createdAt],
  )

  try {
    const messageId = await deliver(message)
    await db.run('UPDATE email_log SET status = ?, provider_message_id = ?, sent_at = ? WHERE id = ?', [
      'sent', messageId, new Date().toISOString(), logId,
    ])
    return { logId, messageId, status: 'sent' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message.slice(0, 1000) : 'Unknown email delivery error'
    await db.run('UPDATE email_log SET status = ?, error_message = ? WHERE id = ?', ['failed', errorMessage, logId])
    throw error
  }
}

/** Failed emails (SMTP down, rate limited) are retried up to EMAIL_MAX_ATTEMPTS. */
export async function retryFailedEmails(now = new Date()): Promise<{ retried: number; sent: number; failed: number }> {
  await ensureEmailLog()
  const db = await getDb()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const attemptedToday = await db.get<{ count: number }>(
    "SELECT COUNT(*) count FROM email_log WHERE status IN ('sending','failed') AND created_at >= ?",
    [dayStart],
  )
  const remaining = EMAIL_RETRY_DAILY_LIMIT - (attemptedToday?.count ?? 0)
  if (remaining <= 0) return { retried: 0, sent: 0, failed: 0 }

  const rows = await db.all<EmailLogRow[]>(
    `SELECT id, kind, recipient, subject, reference_id, attempts, text_body, html_body FROM email_log
     WHERE status = 'failed' AND attempts < ? ORDER BY created_at LIMIT ?`,
    [EMAIL_MAX_ATTEMPTS, remaining],
  )
  let sent = 0
  let failed = 0
  for (const row of rows) {
    await db.run('UPDATE email_log SET status=?,attempts=? WHERE id=?', ['sending', row.attempts + 1, row.id])
    try {
      if (!row.text_body || !row.html_body) throw new Error('Stored email bodies are missing')
      const messageId = await deliver({
        to: row.recipient, subject: row.subject, text: row.text_body, html: row.html_body, kind: row.kind as EmailMessage['kind'], referenceId: row.reference_id ?? undefined,
      })
      await db.run('UPDATE email_log SET status=?,provider_message_id=?,sent_at=? WHERE id=?', ['sent', messageId, now.toISOString(), row.id])
      sent += 1
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message.slice(0, 1000) : 'Unknown retry error'
      await db.run('UPDATE email_log SET status=?,error_message=? WHERE id=?', ['failed', errorMessage, row.id])
      failed += 1
    }
  }
  return { retried: rows.length, sent, failed }
}
