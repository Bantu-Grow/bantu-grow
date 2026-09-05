import { retryFailedEmails } from '@/lib/email'
import { isCronAuthorized, unauthorizedCronResponse } from '@/lib/email/cron-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Retries emails that failed due to transient SMTP problems. */
export async function POST(request: Request): Promise<Response> {
  if (!isCronAuthorized(request)) return unauthorizedCronResponse()
  const result = await retryFailedEmails()
  return Response.json(result)
}
