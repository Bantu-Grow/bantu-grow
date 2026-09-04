import { z } from 'zod'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContactInput {
  name: string
  email: string
  message: string
  productSlug?: string
  phone?: string
  companyName?: string
}

export interface FieldError {
  field: 'name' | 'email' | 'message'
  code: 'required' | 'invalid_email'
}

export interface ValidationResult {
  ok: boolean
  errors: FieldError[]
  values: ContactInput
}

// ─── Zod schema ──────────────────────────────────────────────────────────────

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const contactSchema = z.object({
  name: z.string().min(1, 'required'),
  email: z
    .string()
    .min(1, 'required')
    .refine((v) => emailRegex.test(v), { message: 'invalid_email' }),
  message: z.string().min(1, 'required'),
  productSlug: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the string is a well-formed email address.
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') return false
  return emailRegex.test(email)
}

// ─── Validate ────────────────────────────────────────────────────────────────

/**
 * Validates a ContactInput.
 * Always echoes values back in result.values regardless of validity.
 */
export function validateContact(input: ContactInput): ValidationResult {
  const errors: FieldError[] = []

  // name: required
  if (!input.name || input.name.trim() === '') {
    errors.push({ field: 'name', code: 'required' })
  }

  // email: required then format
  if (!input.email || input.email.trim() === '') {
    errors.push({ field: 'email', code: 'required' })
  } else if (!isValidEmail(input.email)) {
    errors.push({ field: 'email', code: 'invalid_email' })
  }

  // message: required
  if (!input.message || input.message.trim() === '') {
    errors.push({ field: 'message', code: 'required' })
  }

  return {
    ok: errors.length === 0,
    errors,
    values: { ...input },
  }
}
