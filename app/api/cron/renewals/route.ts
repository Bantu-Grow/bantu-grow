import { getDb } from '@/lib/db'
import { generateRenewalInvoices } from '@/lib/affiliate/billing'
import { isCronAuthorized, unauthorizedCronResponse } from '@/lib/email/cron-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Generates next-cycle invoices for active subscriptions approaching their
 * period end. Invoice delivery is handled by /api/cron/invoices.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isCronAuthorized(request)) return unauthorizedCronResponse()
  const db = await getDb()
  const table = await db.get<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table' AND name='affiliate_subscriptions'")
  if (!table) return Response.json({ processed: 0, skipped: 'affiliate_subscriptions table is not available' })
  const generated = await generateRenewalInvoices()
  return Response.json({ generated })
}
