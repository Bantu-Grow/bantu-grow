import type { Metadata } from 'next'
import Link from 'next/link'
import { AffiliateLoginForm } from '@/components/affiliate/affiliate-forms'

export const metadata: Metadata = { title: 'Login Affiliate — BantuGrow' }
export default function AffiliateLoginPage() { return <div className="mx-auto w-full max-w-lg px-4 py-16"><div className="rounded-2xl border bg-card p-7 shadow-sm"><h1 className="text-3xl font-extrabold">Login Affiliate</h1><p className="mb-7 mt-2 text-sm text-muted-foreground">Akses tautan referral, performa, komisi, dan payout Anda.</p><AffiliateLoginForm /><p className="mt-6 text-center text-sm text-muted-foreground">Belum terdaftar? <Link href="/affiliate/daftar" className="text-primary underline">Daftar sekarang</Link></p></div></div> }
