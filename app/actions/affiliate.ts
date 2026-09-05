'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  AFFILIATE_SESSION_COOKIE,
  authenticateAffiliate,
  loginAffiliate,
  logoutAffiliate,
  registerAffiliate,
  requestPayout,
  saveAffiliateBankAccount,
} from '@/lib/affiliate'

export type AffiliateActionState = { status: 'idle' | 'success' | 'error'; message: string }

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(120),
  email: z.email('Format email tidak valid.').max(254),
  password: z.string().min(10, 'Kata sandi minimal 10 karakter.').max(200),
  terms: z.literal('on', { error: 'Anda harus menyetujui ketentuan program.' }),
})
const loginSchema = z.object({ email: z.email(), password: z.string().min(1) })
const bankSchema = z.object({
  bankName: z.string().trim().min(2).max(80),
  accountNumber: z.string().trim().regex(/^[0-9 -]{5,50}$/, 'Nomor rekening tidak valid.'),
  accountHolder: z.string().trim().min(2).max(120),
  taxId: z.string().trim().max(30).optional().or(z.literal('')),
  taxType: z.enum(['pph21', 'pph23']).optional().or(z.literal('')),
  taxRateBasisPoints: z.coerce.number().int().min(0).max(10_000).optional(),
})

export async function registerAffiliateAction(_previous: AffiliateActionState, formData: FormData): Promise<AffiliateActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }
  try {
    // The backend stores a one-day verification token. Delivery is added when SMTP
    // is configured; never expose the token in this public action response.
    await registerAffiliate(parsed.data)
    return { status: 'success', message: 'Pendaftaran diterima. Periksa email Anda untuk verifikasi, lalu tunggu persetujuan tim kami.' }
  } catch (error) {
    const duplicate = error instanceof Error && error.message.includes('UNIQUE')
    return { status: 'error', message: duplicate ? 'Email tersebut sudah terdaftar.' : 'Pendaftaran belum dapat diproses. Silakan coba lagi.' }
  }
}

export async function loginAffiliateAction(_previous: AffiliateActionState, formData: FormData): Promise<AffiliateActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: 'error', message: 'Email atau kata sandi tidak valid.' }
  try {
    const session = await loginAffiliate(parsed.data.email, parsed.data.password)
    const store = await cookies()
    store.set(AFFILIATE_SESSION_COOKIE, session.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 })
  } catch {
    return { status: 'error', message: 'Kredensial salah atau akun belum aktif dan terverifikasi.' }
  }
  redirect('/affiliate/dashboard')
}

async function requireActionAffiliate() {
  const store = await cookies()
  const token = store.get(AFFILIATE_SESSION_COOKIE)?.value
  const affiliate = token ? await authenticateAffiliate(token) : null
  if (!affiliate) throw new Error('Sesi tidak valid')
  return { affiliate, token: token! }
}

export async function saveBankAccountAction(_previous: AffiliateActionState, formData: FormData): Promise<AffiliateActionState> {
  const parsed = bankSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Data rekening tidak valid.' }
  try {
    const { affiliate } = await requireActionAffiliate()
    const taxType = parsed.data.taxType === '' ? undefined : parsed.data.taxType
    await saveAffiliateBankAccount(affiliate.id, {
      bankName: parsed.data.bankName,
      accountNumber: parsed.data.accountNumber,
      accountHolder: parsed.data.accountHolder,
      taxId: parsed.data.taxId === '' ? undefined : parsed.data.taxId,
      taxType,
      taxRateBasisPoints: parsed.data.taxRateBasisPoints,
    })
    return { status: 'success', message: 'Data rekening berhasil disimpan.' }
  } catch {
    return { status: 'error', message: 'Data rekening gagal disimpan. Silakan masuk kembali.' }
  }
}

export async function requestAffiliatePayoutAction(): Promise<void> {
  const { affiliate } = await requireActionAffiliate()
  await requestPayout(affiliate.id)
  redirect('/affiliate/dashboard?status=payout-requested')
}

export async function logoutAffiliateAction(): Promise<void> {
  const store = await cookies()
  const token = store.get(AFFILIATE_SESSION_COOKIE)?.value
  if (token) await logoutAffiliate(token)
  store.delete(AFFILIATE_SESSION_COOKIE)
  redirect('/affiliate/login')
}
