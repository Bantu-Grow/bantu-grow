/**
 * Formats an ISO date string (e.g., '2026-06-24') to a human-readable format.
 * Default locale is 'id-ID' with day + short month + year (e.g., '24 Jun 2026').
 *
 * The admin form accepts free-format dates, so an unparsable value must never
 * throw here: `Intl.DateTimeFormat.format` raises RangeError on an invalid date
 * and would turn one bad row into a 500 on /blog and every post page.
 */
export function formatDate(isoString: string, locale: string = 'id-ID'): string {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return isoString
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * Converts a free-format date string like '24 Jun 2026' to ISO format '2026-06-24'.
 * Useful for migration/seeding purposes.
 */
export function parseLooseDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    return dateStr
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Normalizes a user-supplied date to ISO format when it is parsable, and returns
 * the original string untouched when it is not. Used on write so stored blog
 * dates stay renderable.
 */
export function normalizeDateInput(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return parseLooseDate(trimmed)
}
