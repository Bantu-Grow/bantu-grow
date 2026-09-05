'use server'

import { validateContact, type ContactInput, type ValidationResult } from '@/lib/contact-validation'
import { defaultLeadSink, type Lead, type LeadSink } from '@/lib/lead-sink'
import { cookies } from 'next/headers'
import { attributeLead } from '@/lib/affiliate'

export type SubmitLeadResult =
  | { status: 'success' }
  | { status: 'validation_error'; result: ValidationResult }
  | { status: 'server_error'; message: string; values: ContactInput }

// Simple in-memory rate limiting: max 5 submissions per 60 seconds per session key
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(sessionKey: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(sessionKey) ?? []
  // Remove entries outside the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  rateLimitMap.set(sessionKey, recent)

  if (recent.length >= RATE_LIMIT_MAX) {
    return true
  }
  recent.push(now)
  rateLimitMap.set(sessionKey, recent)
  return false
}

/**
 * Submit a lead.
 * @param input - Contact form input
 * @param honeypotOrSink - Either a honeypot string (from form) or a LeadSink (for testing)
 * @param sinkOverride - Optional LeadSink when honeypot string is provided as second arg
 */
export async function submitLead(
  input: ContactInput,
  honeypotOrSink: string | LeadSink = '',
  sinkOverride?: LeadSink
): Promise<SubmitLeadResult> {
  // Determine honeypot value and sink based on second argument type
  let honeypot = ''
  let sink: LeadSink = defaultLeadSink

  if (typeof honeypotOrSink === 'string') {
    honeypot = honeypotOrSink
    sink = sinkOverride ?? defaultLeadSink
  } else {
    // Second arg is a LeadSink (backward compat with tests)
    sink = honeypotOrSink
  }

  // 0. Honeypot check - silently reject bot submissions
  if (honeypot) {
    // Return success to not reveal detection to bots
    return { status: 'success' }
  }

  // 0b. Rate limiting by email as session key
  const sessionKey = input.email?.toLowerCase().trim() || 'anonymous'
  if (isRateLimited(sessionKey)) {
    return {
      status: 'server_error',
      message: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa saat.',
      values: input,
    }
  }

  // 1. Validate input
  const validation = validateContact(input)

  if (!validation.ok) {
    return { status: 'validation_error', result: validation }
  }

  // 2. Build Lead and record via sink
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
  }

  try {
    await sink.record(lead)
    try {
      const store = await cookies()
      const clickId = store.get('bg_referral')?.value
      const visitorId = store.get('bg_visitor')?.value
      if (clickId && visitorId) await attributeLead({ clickId, visitorId, leadId: lead.id })
    } catch {
      // A stale or invalid referral must never prevent the lead from being saved.
    }
    return { status: 'success' }
  } catch (error) {
    console.error('[BantuGrow] Lead sink error:', error)
    return {
      status: 'server_error',
      message: 'Terjadi kesalahan server. Silakan coba lagi.',
      values: input,
    }
  }
}
