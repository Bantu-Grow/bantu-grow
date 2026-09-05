'use server'

import { insertDemoRequest, type DemoRequest } from '@/lib/db'
import { cookies } from 'next/headers'
import { attributeLead } from '@/lib/affiliate'

export interface DemoRequestInput {
  name: string
  email: string
  phone?: string
  company?: string
  productInterest?: string
  preferredTime?: string
}

export type DemoRequestResult =
  | { status: 'success' }
  | { status: 'validation_error'; message: string }
  | { status: 'server_error'; message: string }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Simple in-memory rate limiting: max 3 demo requests per 60 seconds per email
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 3
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(sessionKey: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(sessionKey) ?? []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  rateLimitMap.set(sessionKey, recent)

  if (recent.length >= RATE_LIMIT_MAX) {
    return true
  }
  recent.push(now)
  rateLimitMap.set(sessionKey, recent)
  return false
}

export async function requestDemo(
  input: DemoRequestInput,
  honeypot: string = ''
): Promise<DemoRequestResult> {
  // Honeypot check
  if (honeypot) {
    return { status: 'success' }
  }

  // Validate required fields
  if (!input.name || input.name.trim() === '') {
    return { status: 'validation_error', message: 'Nama wajib diisi.' }
  }

  if (!input.email || input.email.trim() === '') {
    return { status: 'validation_error', message: 'Email wajib diisi.' }
  }

  if (!emailRegex.test(input.email)) {
    return { status: 'validation_error', message: 'Format email tidak valid.' }
  }

  // Rate limiting
  const sessionKey = input.email.toLowerCase().trim()
  if (isRateLimited(sessionKey)) {
    return {
      status: 'server_error',
      message: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa saat.',
    }
  }

  const demoRequest: DemoRequest = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || undefined,
    company: input.company?.trim() || undefined,
    productInterest: input.productInterest?.trim() || undefined,
    preferredTime: input.preferredTime?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }

  try {
    await insertDemoRequest(demoRequest)
    try {
      const store = await cookies()
      const clickId = store.get('bg_referral')?.value
      const visitorId = store.get('bg_visitor')?.value
      if (clickId && visitorId) await attributeLead({ clickId, visitorId, demoRequestId: demoRequest.id })
    } catch {
      // A stale or invalid referral must never prevent the demo request from saving.
    }
    // Avoid logging PII (name, email, phone, company) to server logs
    console.log('[BantuGrow Demo Request] received', { id: demoRequest.id })
    return { status: 'success' }
  } catch (error) {
    console.error('[BantuGrow] Demo request error:', error)
    return {
      status: 'server_error',
      message: 'Terjadi kesalahan server. Silakan coba lagi.',
    }
  }
}
