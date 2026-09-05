import { createHash, randomUUID } from 'crypto'
import { getDb } from '@/lib/db'
import { CLICK_RATE_LIMIT_PER_HOUR, REFERRAL_ATTRIBUTION_DAYS, addDays } from './constants'
import type { ReferralClickInput } from './types'

const digest = (value: string) => createHash('sha256').update(`${process.env.AFFILIATE_HASH_SALT ?? 'local-development'}:${value}`).digest('hex')

export async function recordReferralClick(input: ReferralClickInput): Promise<{ clickId: string; expiresAt: string }> {
  const now = input.now ?? new Date()
  const db = await getDb()
  const affiliate = await db.get<{ id: string }>("SELECT id FROM affiliates WHERE referral_code=? AND status='active'", [input.referralCode.trim()])
  if (!affiliate) throw new Error('Invalid referral code')
  const ipHash = digest(input.ipAddress)
  const since = new Date(now.getTime() - 3_600_000).toISOString()
  const count = await db.get<{ count: number }>('SELECT COUNT(*) count FROM referral_clicks WHERE ip_hash=? AND created_at>=?', [ipHash, since])
  if ((count?.count ?? 0) >= CLICK_RATE_LIMIT_PER_HOUR) throw new Error('Referral click rate limit exceeded')
  const clickId = randomUUID()
  const expiresAt = addDays(now, REFERRAL_ATTRIBUTION_DAYS)
  await db.run(`INSERT INTO referral_clicks (id,affiliate_id,visitor_hash,ip_hash,user_agent,landing_path,created_at)
    VALUES (?,?,?,?,?,?,?)`, [clickId, affiliate.id, digest(input.visitorId), ipHash, input.userAgent?.slice(0, 500) ?? null, input.landingPath?.slice(0, 500) ?? null, now.toISOString()])
  return { clickId, expiresAt }
}

export async function attributeLead(input: { clickId: string; visitorId: string; leadId?: string; demoRequestId?: string; now?: Date }): Promise<string> {
  if (!input.leadId && !input.demoRequestId) throw new Error('Lead or demo request is required')
  const now = input.now ?? new Date()
  const db = await getDb()
  const click = await db.get<{ affiliate_id: string; created_at: string; visitor_hash: string }>('SELECT affiliate_id,created_at,visitor_hash FROM referral_clicks WHERE id=?', [input.clickId])
  if (!click || click.visitor_hash !== digest(input.visitorId) || addDays(new Date(click.created_at), REFERRAL_ATTRIBUTION_DAYS) <= now.toISOString()) throw new Error('Referral attribution expired or invalid')
  const id = randomUUID()
  await db.run(`INSERT INTO affiliate_attributions (id,affiliate_id,lead_id,demo_request_id,source_click_id,visitor_hash,expires_at,created_at)
    VALUES (?,?,?,?,?,?,?,?)`, [id, click.affiliate_id, input.leadId ?? null, input.demoRequestId ?? null, input.clickId, click.visitor_hash, addDays(new Date(click.created_at), REFERRAL_ATTRIBUTION_DAYS), now.toISOString()])
  return id
}
