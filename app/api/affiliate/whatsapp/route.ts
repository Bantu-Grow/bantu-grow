import { z } from 'zod'
import { recordWhatsAppReferral } from '@/lib/affiliate/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  referralCode: z.string().trim().min(1).max(24),
  whatsappNumber: z.string().trim().regex(/^[0-9+ -]{8,20}$/),
})

/**
 * Records a code that an affiliate shared over WhatsApp. The visitor supplies
 * their WhatsApp number with the code; attribution is resolved on conversion.
 */
export async function POST(request: Request): Promise<Response> {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid payload' }, { status: 400 })
  try {
    const result = await recordWhatsAppReferral(parsed.data)
    return Response.json({ ok: true, id: result.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('rate limit')) return Response.json({ error: message }, { status: 429 })
    return Response.json({ error: message }, { status: 400 })
  }
}
