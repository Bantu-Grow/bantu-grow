'use server'

import { getDb } from '@/lib/db'

export type SubscribeResult =
  | { status: 'success' }
  | { status: 'error'; message: string }

// Simple in-memory rate limiting: max 3 subscriptions per 60 seconds per email,
// mirroring the protection already used by the lead and demo actions.
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

export async function subscribeNewsletter(
  email: string,
  honeypot: string = ''
): Promise<SubscribeResult> {
  // Honeypot check: bots fill hidden fields, humans never see them.
  if (honeypot) {
    return { status: 'success' }
  }

  // Basic email validation
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { status: 'error', message: 'Format email tidak valid.' }
  }

  if (isRateLimited(trimmed)) {
    return {
      status: 'error',
      message: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa saat.',
    }
  }

  try {
    const db = await getDb()

    // Check if already subscribed
    const existing = await db.get<{ email: string }>(
      'SELECT email FROM newsletter_subscribers WHERE email = ?',
      [trimmed]
    )

    if (existing) {
      return { status: 'success' } // Already subscribed, return success silently
    }

    await db.run(
      'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, ?)',
      [trimmed, new Date().toISOString()]
    )

    return { status: 'success' }
  } catch (error) {
    console.error('[BantuGrow] Newsletter subscription error:', error)
    return { status: 'error', message: 'Terjadi kesalahan server. Silakan coba lagi.' }
  }
}
