import type { Metadata } from 'next'
import Link from 'next/link'
import { AffiliateRegisterForm } from '@/components/affiliate/affiliate-forms'

export const metadata: Metadata = { title: 'Daftar Affiliate — BantuGrow' }
export default function AffiliateRegisterPage() { return <div className="mx-auto w-full max-w-lg px-4 py-16"><div className="rounded-2xl border bg-card p-7 shadow-sm"><h1 className="text-3xl font-extrabold">Daftar Affiliate</h1><p className="mb-7 mt-2 text-sm text-muted-foreground">Buat akun, verifikasi email, lalu tim kami akan meninjau pendaftaran Anda.</p><AffiliateRegisterForm /><p className="mt-6 text-center text-sm text-muted-foreground">Sudah punya akun? <Link href="/affiliate/login" className="text-primary underline">Masuk</Link></p></div></div> }
