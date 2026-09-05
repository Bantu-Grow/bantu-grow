import { describe, expect, it, vi } from 'vitest'
import { GET } from '../route'
import { REFERRAL_COOKIE, VISITOR_COOKIE } from '@/lib/affiliate'

vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '127.0.0.1', 'user-agent': 'test' })) }))
vi.mock('@/lib/affiliate', () => ({ REFERRAL_ATTRIBUTION_DAYS: 90, REFERRAL_COOKIE: 'bg_referral', VISITOR_COOKIE: 'bg_visitor', recordReferralClick: vi.fn(async () => ({ clickId: 'click-1', expiresAt: '2026-12-01' })) }))

describe('affiliate referral route', () => {
  it('records a click and returns 90-day secure attribution cookies', async () => {
    const response = await GET(new Request('https://bantugrow.id/r/CODE'), { params: Promise.resolve({ code: 'CODE' }) } as RouteContext<'/r/[code]'>)
    expect(response.status).toBe(307)
    const cookie = response.headers.get('set-cookie') ?? ''
    expect(cookie).toContain(`${REFERRAL_COOKIE}=click-1`)
    expect(cookie).toContain(`${VISITOR_COOKIE}=`)
    expect(cookie).toContain('Max-Age=7776000')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=lax')
  })
})
