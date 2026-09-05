import { createSqliteBackup } from '@/lib/affiliate/backup'
import { isCronAuthorized, unauthorizedCronResponse } from '@/lib/email/cron-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Creates a consistent SQLite snapshot (retention-capped) on a schedule. */
export async function POST(request: Request): Promise<Response> {
  if (!isCronAuthorized(request)) return unauthorizedCronResponse()
  const snapshot = await createSqliteBackup()
  return Response.json({ path: snapshot.path, bytes: snapshot.bytes })
}
