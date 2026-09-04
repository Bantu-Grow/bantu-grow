import { describe, it, expect } from 'vitest'
import { formatDate, parseLooseDate, normalizeDateInput } from '../format-date'

describe('formatDate with invalid input', () => {
  it('returns the raw string instead of throwing on unparsable input', () => {
    // Intl.DateTimeFormat.format throws RangeError on an invalid date, which
    // previously turned one bad blog row into a 500 across /blog.
    expect(() => formatDate('bukan tanggal')).not.toThrow()
    expect(formatDate('bukan tanggal')).toBe('bukan tanggal')
  })

  it('returns empty string unchanged', () => {
    expect(formatDate('')).toBe('')
  })

  it('still formats valid ISO dates', () => {
    expect(formatDate('2026-06-24')).toContain('2026')
  })
})

describe('parseLooseDate / normalizeDateInput', () => {
  it('keeps unparsable values instead of producing NaN dates', () => {
    expect(parseLooseDate('sembarang')).toBe('sembarang')
    expect(normalizeDateInput('sembarang')).toBe('sembarang')
  })

  it('normalizes loose but valid dates to ISO', () => {
    expect(normalizeDateInput('24 Jun 2026')).toBe('2026-06-24')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeDateInput('  2026-06-24  ')).toBe('2026-06-24')
  })
})
