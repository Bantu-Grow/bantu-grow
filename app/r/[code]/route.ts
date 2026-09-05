import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { recordReferralClick, REFERRAL_ATTRIBUTION_DAYS, REFERRAL_COOKIE, VISITOR_COOKIE } from '@/lib/affiliate'

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params
  const headerStore = await headers()
  const forwarded = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ipAddress = forwarded || headerStore.get('x-real-ip') || 'unknown'
  const existingVisitor = request.headers.get('cookie')?.match(/(?:^|; )bg_visitor=([^;]+)/)?.[1]
  const visitorId = existingVisitor ? decodeURIComponent(existingVisitor) : crypto.randomUUID()
  try {
    const click = await recordReferralClick({ referralCode: code, visitorId, ipAddress, userAgent: headerStore.get('user-agent') ?? undefined, landingPath: '/' })
    const response = NextResponse.redirect(new URL('/', request.url))
    const options = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: REFERRAL_ATTRIBUTION_DAYS * 86_400 }
    response.cookies.set(REFERRAL_COOKIE, click.clickId, options)
    response.cookies.set(VISITOR_COOKIE, visitorId, options)
    return response
  } catch {
    return NextResponse.redirect(new URL('/?ref=invalid', request.url))
  }
}
