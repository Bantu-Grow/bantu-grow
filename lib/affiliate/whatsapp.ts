import { createHash, randomUUID } from 'crypto'
import { getDb } from '@/lib/db'

const digest = (value: string) => createHash('sha256').update(`${process.env.AFFILIATE_HASH_SALT ?? 'local-development'}:${value}`).digest('hex')

/**
 * Records a WhatsApp referral code submission. Affiliates include their code in
 * a WhatsApp message (e.g. /r/REFCODE); when the visitor later converts, the
 * code is resolved during attribution the same way as a URL click.
 */
export async function recordWhatsAppReferral(input: { referralCode: string; whatsappNumber: string; now?: Date }): Promise<{ id: string }> {
  const code = input.referralCode.trim()
  const whatsappNumber = input.whatsappNumber.trim()
  if (!code || !/^[0-9+ -]{8,20}$/.test(whatsappNumber)) throw new Error('Invalid WhatsApp referral')
  const now = input.now ?? new Date()
  const db = await getDb()
  const affiliate = await db.get<{ id: string }>("SELECT id FROM affiliates WHERE referral_code=? AND status='active'", [code])
  if (!affiliate) throw new Error('Invalid referral code')

  const since = new Date(now.getTime() - 3_600_000).toISOString()
  const count = await db.get<{ count: number }>('SELECT COUNT(*) count FROM whatsapp_referrals WHERE whatsapp_number=? AND created_at>=?', [digest(whatsappNumber), since])
  if ((count?.count ?? 0) >= 10) throw new Error('WhatsApp referral rate limit exceeded')

  const id = randomUUID()
  await db.run('INSERT INTO whatsapp_referrals (id,affiliate_id,referral_code,whatsapp_number,created_at) VALUES (?,?,?,?,?)',
    [id, affiliate.id, code, digest(whatsappNumber), now.toISOString()])
  return { id }
}
