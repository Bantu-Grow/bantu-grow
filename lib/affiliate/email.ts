import { affiliateVerificationEmail, affiliateWelcomeEmail, sendEmail } from '@/lib/email'
import type { AffiliateAccount } from './types'

/**
 * Affiliate email integrations are best-effort: a missing or broken SMTP
 * configuration must never break registration or approval flows. Failures are
 * persisted in email_log by sendEmail and reported via the returned status.
 */
export interface SafeEmailResult {
  delivered: boolean
  reason?: string
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bantugrow.com'
}

export async function sendAffiliateVerificationEmail(affiliate: AffiliateAccount, token: string): Promise<SafeEmailResult> {
  const verificationUrl = `${siteUrl()}/affiliate/verifikasi?token=${encodeURIComponent(token)}`
  try {
    await sendEmail(affiliateVerificationEmail(affiliate.email, { affiliateName: affiliate.name, verificationUrl }))
    return { delivered: true }
  } catch (error) {
    return { delivered: false, reason: error instanceof Error ? error.message : 'unknown email error' }
  }
}

export async function sendAffiliateWelcomeEmail(affiliate: AffiliateAccount): Promise<SafeEmailResult> {
  const dashboardUrl = `${siteUrl()}/affiliate/dashboard`
  try {
    await sendEmail(affiliateWelcomeEmail(affiliate.email, { affiliateName: affiliate.name, referralCode: affiliate.referralCode, dashboardUrl }))
    return { delivered: true }
  } catch (error) {
    return { delivered: false, reason: error instanceof Error ? error.message : 'unknown email error' }
  }
}
