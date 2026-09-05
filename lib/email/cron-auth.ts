import { createHash, timingSafeEqual } from 'crypto'

function safeEqual(left: string, right: string): boolean {
  return timingSafeEqual(createHash('sha256').update(left).digest(), createHash('sha256').update(right).digest())
}

export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const authorization = request.headers.get('authorization')
  return authorization?.startsWith('Bearer ') === true && safeEqual(authorization.slice(7), secret)
}

export function unauthorizedCronResponse(): Response {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
