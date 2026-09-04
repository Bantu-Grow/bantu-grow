import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { isValidEmail, validateContact, type ContactInput } from '../contact-validation'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Generates valid RFC-like email strings */
const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-zA-Z0-9._+-]+$/),
    fc.stringMatching(/^[a-zA-Z0-9-]+$/),
    fc.stringMatching(/^[a-zA-Z]{2,6}$/)
  )
  .filter(([local, domain]) => local.length > 0 && domain.length > 0)
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

/** Generates strings that are definitely NOT valid emails */
const invalidEmailArb = fc.oneof(
  fc.constant(''),
  fc.constant('   '),
  fc.constant('no-at-sign'),
  fc.constant('@nodomain.com'),
  fc.constant('missing@'),
  fc.constant('missing@domain'),
  fc.constant('spaces in@email.com'),
  fc.string({ minLength: 1, maxLength: 30 }).filter((s) => !emailRegex.test(s))
)

/** Generates a ContactInput where all required fields are non-empty and email is valid */
const validInputArb: fc.Arbitrary<ContactInput> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 80 }).map((s) => s.trim()).filter((s) => s.length > 0),
  email: validEmailArb,
  message: fc.string({ minLength: 1, maxLength: 500 }).map((s) => s.trim()).filter((s) => s.length > 0),
  productSlug: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
})

/** Generates arbitrary ContactInput (may be invalid) */
const anyInputArb: fc.Arbitrary<ContactInput> = fc.record({
  name: fc.string({ maxLength: 80 }),
  email: fc.string({ maxLength: 80 }),
  message: fc.string({ maxLength: 500 }),
  productSlug: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
})

// ─── Property 5: Email format validation ─────────────────────────────────────
// Feature: bantugrow-company-profile, Property 5: Email format validation
describe('isValidEmail', () => {
  it(
    'Property 5: returns true for well-formed email addresses',
    () => {
      // Validates: Requirements 5.4
      fc.assert(
        fc.property(validEmailArb, (email) => {
          expect(isValidEmail(email)).toBe(true)
        }),
        { numRuns: 100 }
      )
    }
  )

  it(
    'Property 5: returns false for malformed strings',
    () => {
      // Validates: Requirements 5.4
      fc.assert(
        fc.property(invalidEmailArb, (email) => {
          expect(isValidEmail(email)).toBe(false)
        }),
        { numRuns: 100 }
      )
    }
  )

  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('returns false for whitespace-only string', () => {
    expect(isValidEmail('   ')).toBe(false)
  })

  it('returns false for missing @', () => {
    expect(isValidEmail('nodomain.com')).toBe(false)
  })

  it('returns true for standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })
})

// ─── Property 6: Validation completeness and value retention ─────────────────
// Feature: bantugrow-company-profile, Property 6: Contact validation completeness and value retention
describe('validateContact', () => {
  it(
    'Property 6: returns ok=true when all required fields are valid',
    () => {
      // Validates: Requirements 5.2, 5.3, 5.4
      fc.assert(
        fc.property(validInputArb, (input) => {
          const result = validateContact(input)
          expect(result.ok).toBe(true)
          expect(result.errors).toHaveLength(0)
        }),
        { numRuns: 100 }
      )
    }
  )

  it(
    'Property 6: values always echoed back unchanged',
    () => {
      // Validates: Requirements 5.2, 5.3, 5.4
      fc.assert(
        fc.property(anyInputArb, (input) => {
          const result = validateContact(input)
          expect(result.values).toEqual(input)
        }),
        { numRuns: 100 }
      )
    }
  )

  it(
    'Property 6: identifies exactly the offending fields (no spurious, no missing errors)',
    () => {
      // Validates: Requirements 5.2, 5.3, 5.4
      fc.assert(
        fc.property(anyInputArb, (input) => {
          const result = validateContact(input)

          const nameEmpty = !input.name || input.name.trim() === ''
          const emailEmpty = !input.email || input.email.trim() === ''
          const emailInvalid = !emailEmpty && !isValidEmail(input.email)
          const messageEmpty = !input.message || input.message.trim() === ''

          const expectedErrors: Array<{ field: string; code: string }> = []
          if (nameEmpty) expectedErrors.push({ field: 'name', code: 'required' })
          if (emailEmpty) expectedErrors.push({ field: 'email', code: 'required' })
          if (emailInvalid) expectedErrors.push({ field: 'email', code: 'invalid_email' })
          if (messageEmpty) expectedErrors.push({ field: 'message', code: 'required' })

          expect(result.errors).toHaveLength(expectedErrors.length)
          for (const expected of expectedErrors) {
            expect(result.errors).toContainEqual(expected)
          }

          const shouldBeOk = expectedErrors.length === 0
          expect(result.ok).toBe(shouldBeOk)
        }),
        { numRuns: 100 }
      )
    }
  )

  it('returns ok=false and name error when name is empty', () => {
    const result = validateContact({ name: '', email: 'user@example.com', message: 'Hello' })
    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual({ field: 'name', code: 'required' })
  })

  it('returns ok=false and email required error when email is empty', () => {
    const result = validateContact({ name: 'Budi', email: '', message: 'Hello' })
    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual({ field: 'email', code: 'required' })
  })

  it('returns ok=false and invalid_email error when email is malformed', () => {
    const result = validateContact({ name: 'Budi', email: 'not-an-email', message: 'Hello' })
    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual({ field: 'email', code: 'invalid_email' })
  })

  it('returns ok=false and message error when message is empty', () => {
    const result = validateContact({ name: 'Budi', email: 'user@example.com', message: '' })
    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual({ field: 'message', code: 'required' })
  })
})
