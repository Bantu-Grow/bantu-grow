import type { Metadata } from 'next'
import Link from 'next/link'
import { verifyAffiliateEmail } from '@/lib/affiliate'

export const metadata: Metadata = { title: 'Verifikasi Affiliate — BantuGrow' }
export default async function VerifyAffiliatePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token
  let verified = false
  if (token) { try { verified = await verifyAffiliateEmail(token) } catch { verified = false } }
  return <div className="mx-auto max-w-xl px-4 py-20 text-center"><div className="rounded-2xl border bg-card p-8"><h1 className="text-3xl font-extrabold">{verified ? 'Email berhasil diverifikasi' : 'Tautan verifikasi tidak valid'}</h1><p className="my-5 text-muted-foreground">{verified ? 'Email Anda sudah terverifikasi. Akun dapat digunakan setelah disetujui tim BantuGrow.' : 'Tautan mungkin sudah digunakan atau kedaluwarsa. Hubungi tim BantuGrow bila Anda memerlukan bantuan.'}</p><Link href={verified ? '/affiliate/login' : '/kontak'} className="text-primary underline">{verified ? 'Ke halaman login' : 'Hubungi kami'}</Link></div></div>
}
