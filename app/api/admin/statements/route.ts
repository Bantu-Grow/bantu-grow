import { cookies } from 'next/headers'
import { isAdminSessionValid } from '@/lib/db'
import { generateMonthlyStatementCsv } from '@/lib/affiliate/csv'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ADMIN_COOKIE_NAME = 'bantugrow_admin_session'

function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

/** Monthly payout/tax statement (gross, PPh, net) as a downloadable CSV. */
export async function GET(request: Request): Promise<Response> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  if (!session || !(await isAdminSessionValid(session))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(request.url)
  const month = url.searchParams.get('month') ?? new Date().toISOString().slice(0, 7)
  try {
    const result = await generateMonthlyStatementCsv(month)
    return csvResponse('\uFEFF' + result.csv, result.filename)
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Invalid month' }, { status: 400 })
  }
}
