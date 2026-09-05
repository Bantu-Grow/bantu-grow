import { createHash, randomBytes, randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { SESSION_TTL_DAYS, addDays } from './constants'
import { sendAffiliateVerificationEmail, sendAffiliateWelcomeEmail } from './email'
import type { SafeEmailResult } from './email'
import type { AffiliateAccount, AffiliateRegistration, SessionResult } from './types'

const normalizeEmail = (email: string) => email.trim().toLowerCase()
const hashToken = (value: string) => createHash('sha256').update(value).digest('hex')

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

function accountFromRow(row: {
  id: string; name: string; email: string; referral_code: string; status: AffiliateAccount['status'];
  email_verified_at: string | null; created_at: string
}): AffiliateAccount {
  return { id: row.id, name: row.name, email: row.email, referralCode: row.referral_code,
    status: row.status, emailVerifiedAt: row.email_verified_at, createdAt: row.created_at }
}

export async function registerAffiliate(input: AffiliateRegistration, now = new Date()): Promise<{ affiliate: AffiliateAccount; verificationToken: string; verificationEmail: SafeEmailResult }> {
  const email = normalizeEmail(input.email)
  if (!input.name.trim() || input.name.trim().length > 120) throw new Error('Invalid name')
  if (!validEmail(email)) throw new Error('Invalid email')
  if (input.password.length < 10 || input.password.length > 200) throw new Error('Password must contain 10-200 characters')
  const db = await getDb()
  const id = randomUUID()
  const referralCode = randomBytes(6).toString('hex').toUpperCase()
  const verificationToken = randomBytes(32).toString('base64url')
  const timestamp = now.toISOString()
  const passwordHash = await bcrypt.hash(input.password, 12)
  await db.exec('BEGIN IMMEDIATE')
  try {
    await db.run(`INSERT INTO affiliates (id,name,email,password_hash,referral_code,status,created_at,updated_at)
      VALUES (?,?,?,?,?,'pending',?,?)`, [id, input.name.trim(), email, passwordHash, referralCode, timestamp, timestamp])
    await db.run(`INSERT INTO affiliate_verification_tokens (token_hash,affiliate_id,expires_at) VALUES (?,?,?)`,
      [hashToken(verificationToken), id, addDays(now, 1)])
    await db.exec('COMMIT')
  } catch (error) {
    await db.exec('ROLLBACK')
    throw error
  }
  const affiliate: AffiliateAccount = { id, name: input.name.trim(), email, referralCode, status: 'pending', emailVerifiedAt: null, createdAt: timestamp }
  const verificationEmail = await sendAffiliateVerificationEmail(affiliate, verificationToken)
  return { affiliate, verificationToken, verificationEmail }
}

export async function verifyAffiliateEmail(token: string, now = new Date()): Promise<boolean> {
  const db = await getDb()
  const timestamp = now.toISOString()
  const row = await db.get<{ affiliate_id: string }>(`SELECT affiliate_id FROM affiliate_verification_tokens
    WHERE token_hash=? AND used_at IS NULL AND expires_at>?`, [hashToken(token), timestamp])
  if (!row) return false
  await db.exec('BEGIN IMMEDIATE')
  try {
    await db.run('UPDATE affiliate_verification_tokens SET used_at=? WHERE token_hash=?', [timestamp, hashToken(token)])
    await db.run('UPDATE affiliates SET email_verified_at=?,updated_at=? WHERE id=?', [timestamp, timestamp, row.affiliate_id])
    await db.exec('COMMIT')
    return true
  } catch (error) { await db.exec('ROLLBACK'); throw error }
}

export async function setAffiliateStatus(id: string, status: AffiliateAccount['status'], now = new Date()): Promise<void> {
  const db = await getDb()
  const result = await db.run('UPDATE affiliates SET status=?,updated_at=? WHERE id=?', [status, now.toISOString(), id])
  if (!result.changes) throw new Error('Affiliate not found')
  await db.run(`INSERT INTO affiliate_audit_log (id,actor_type,action,entity_type,entity_id,created_at)
    VALUES (?,'admin','affiliate.status_changed','affiliate',?,?)`, [randomUUID(), id, now.toISOString()])
  if (status === 'active') {
    const row = await db.get<{ id: string; name: string; email: string; referral_code: string; status: AffiliateAccount['status']; email_verified_at: string | null; created_at: string }>(
      'SELECT id,name,email,referral_code,status,email_verified_at,created_at FROM affiliates WHERE id=?', [id])
    if (row) await sendAffiliateWelcomeEmail(accountFromRow(row))
  }
}

export async function loginAffiliate(emailInput: string, password: string, now = new Date()): Promise<SessionResult> {
  const db = await getDb()
  const row = await db.get<{ id: string; name: string; email: string; referral_code: string; status: AffiliateAccount['status']; email_verified_at: string | null; created_at: string; password_hash: string }>(
    'SELECT * FROM affiliates WHERE email=?', [normalizeEmail(emailInput)])
  if (!row || !(await bcrypt.compare(password, row.password_hash))) throw new Error('Invalid credentials')
  if (row.status !== 'active' || !row.email_verified_at) throw new Error('Affiliate account is not active')
  const token = randomBytes(32).toString('base64url')
  await db.run('INSERT INTO affiliate_sessions (token_hash,affiliate_id,expires_at,created_at) VALUES (?,?,?,?)',
    [hashToken(token), row.id, addDays(now, SESSION_TTL_DAYS), now.toISOString()])
  return { token, affiliate: accountFromRow(row) }
}

export async function authenticateAffiliate(token: string, now = new Date()): Promise<AffiliateAccount | null> {
  const db = await getDb()
  const row = await db.get<{ id: string; name: string; email: string; referral_code: string; status: AffiliateAccount['status']; email_verified_at: string | null; created_at: string }>(
    `SELECT a.* FROM affiliate_sessions s JOIN affiliates a ON a.id=s.affiliate_id
     WHERE s.token_hash=? AND s.expires_at>? AND a.status='active'`, [hashToken(token), now.toISOString()])
  return row ? accountFromRow(row) : null
}

export async function logoutAffiliate(token: string): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM affiliate_sessions WHERE token_hash=?', [hashToken(token)])
}
