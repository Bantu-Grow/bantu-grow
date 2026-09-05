import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgePercent, Clock3, ShieldCheck } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Program Affiliate — BantuGrow', description: 'Dapatkan komisi recurring dengan merekomendasikan solusi SaaS BantuGrow.' }

const benefits = [
  { icon: BadgePercent, title: '20% tahun pertama', body: 'Dapatkan 20% dari pembayaran pertama pelanggan yang tervalidasi.' },
  { icon: Clock3, title: 'Komisi recurring', body: 'Tetap dapatkan 10% saat pelanggan memperpanjang langganan.' },
  { icon: ShieldCheck, title: 'Atribusi 90 hari', body: 'Referral terakhir tersimpan selama 90 hari untuk kontak dan permintaan demo.' },
]

export default function AffiliatePage() {
  return <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-8 md:py-24">
    <section className="rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-14">
      <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-primary">Program Affiliate BantuGrow</p>
      <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">Tumbuh bersama bisnis Indonesia.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Bagikan solusi SaaS yang relevan kepada jaringan Anda dan bangun penghasilan recurring selama pelanggan tetap berlangganan.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/affiliate/daftar" className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>Mulai sekarang <ArrowRight /></Link><Link href="/affiliate/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>Login affiliate</Link></div>
    </section>
    <section className="grid gap-5 py-14 md:grid-cols-3" aria-label="Keuntungan program">{benefits.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-2xl border bg-card p-6"><Icon className="mb-5 size-8 text-primary" aria-hidden="true" /><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></article>)}</section>
    <p className="text-center text-sm text-muted-foreground">Payout minimum Rp100.000. Komisi ditahan 30 hari untuk validasi. <Link className="text-primary underline" href="/affiliate/ketentuan">Baca ketentuan lengkap</Link>.</p>
  </div>
}
