export const COMMISSION_FIRST_YEAR_BPS = 2_000
export const COMMISSION_RENEWAL_BPS = 1_000
export const COMMISSION_HOLD_DAYS = 30
export const MINIMUM_PAYOUT_RUPIAH = 100_000
export const REFERRAL_ATTRIBUTION_DAYS = 90
export const SESSION_TTL_DAYS = 30
export const CLICK_RATE_LIMIT_PER_HOUR = 30
export const AFFILIATE_SESSION_COOKIE = 'bg_affiliate_session'
export const REFERRAL_COOKIE = 'bg_referral'
export const VISITOR_COOKIE = 'bg_visitor'
/** Bytes of entropy (url-safe base64) used for the public invoice token. */
export const INVOICE_TOKEN_BYTES = 32

/** Due-date reminders at D-14, D-7, D-1 and the D+1 overdue notice. */
export const INVOICE_REMINDER_SCHEDULE = [
  { code: 'H14', daysAhead: 14 },
  { code: 'H7', daysAhead: 7 },
  { code: 'H1', daysAhead: 1 },
] as const
export const INVOICE_OVERDUE_CODE = 'overdue'
/** Daily cap for the failed-email retry cron. */
export const EMAIL_RETRY_DAILY_LIMIT = 20
export const EMAIL_MAX_ATTEMPTS = 3
/** SQLite backups rotate, deleting older snapshots beyond this count. */
export const BACKUP_RETENTION_COUNT = 7

export function addDays(date: Date, days: number): string {
  return new Date(date.getTime() + days * 86_400_000).toISOString()
}
