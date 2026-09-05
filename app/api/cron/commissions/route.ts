import { releaseHeldCommissions } from '@/lib/affiliate/commissions'
import { isCronAuthorized, unauthorizedCronResponse } from '@/lib/email/cron-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Releases affiliate commissions whose 30-day hold has elapsed. */
export async function POST(request: Request): Promise<Response> {
  if (!isCronAuthorized(request)) return unauthorizedCronResponse()
  const released = await releaseHeldCommissions()
  return Response.json({ released })
}
