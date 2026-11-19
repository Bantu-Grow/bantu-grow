import { PageContainer } from '@/components/public-page'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AffiliateLoginForm } from '@/components/affiliate/affiliate-forms'

export const metadata: Metadata = { title: 'Login Affiliate — BantuGrow' }
export default function AffiliateLoginPage() {
  return (
    <div className="bg-secondary">
      <PageContainer className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div className="space-y-6">
          <p className="text-sm font-semibold text-primary">
            Affiliate BantuGrow
          </p>
          <h2 className="text-balance text-4xl leading-tight font-medium lg:text-5xl">
            Lanjutkan langkah pertumbuhan Anda
          </h2>
          <p className="text-pretty text-base leading-8 text-muted-foreground">
            Akses tautan referral, performa, komisi, dan payout Anda dari satu
            tempat.
          </p>
        </div>
        <section
          className="min-w-0 space-y-6 rounded-3xl border bg-background p-6 sm:p-10"
          aria-labelledby="login-heading"
        >
          <h1 id="login-heading" className="text-3xl font-medium">
            Login Affiliate
          </h1>
          <AffiliateLoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Belum terdaftar?{' '}
            <Link
              href="/affiliate/daftar"
              className="rounded-sm font-semibold text-foreground underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Daftar sekarang
            </Link>
          </p>
        </section>
      </PageContainer>
    </div>
  )
}
