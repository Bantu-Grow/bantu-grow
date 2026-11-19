import { PageContainer } from '@/components/public-page'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AffiliateRegisterForm } from '@/components/affiliate/affiliate-forms'

export const metadata: Metadata = { title: 'Daftar Affiliate — BantuGrow' }
export default function AffiliateRegisterPage() {
  return (
    <div className="bg-secondary">
      <PageContainer className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div className="space-y-6">
          <p className="text-sm font-semibold text-primary">
            Program Affiliate
          </p>
          <h2 className="text-balance text-4xl leading-tight font-medium lg:text-5xl">
            Mulai rekomendasikan. Tumbuh bersama BantuGrow.
          </h2>
          <p className="text-pretty text-base leading-8 text-muted-foreground">
            Buat akun, verifikasi email, lalu tim kami akan meninjau pendaftaran
            Anda.
          </p>
          <ol className="space-y-5 pt-3">
            {[
              'Daftar dengan email Anda',
              'Verifikasi email',
              'Tunggu persetujuan tim BantuGrow',
            ].map((step, index) => (
              <li key={step} className="flex items-center gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums">
                  {index + 1}
                </span>
                <span className="text-base text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <section
          className="min-w-0 space-y-6 rounded-3xl border bg-background p-6 sm:p-10"
          aria-labelledby="register-heading"
        >
          <h1 id="register-heading" className="text-3xl font-medium">
            Daftar Affiliate
          </h1>
          <AffiliateRegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link
              href="/affiliate/login"
              className="rounded-sm font-semibold text-foreground underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Masuk
            </Link>
          </p>
        </section>
      </PageContainer>
    </div>
  )
}
