import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageContainer, PublicHero } from '@/components/public-page'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Program Affiliate — BantuGrow',
  description:
    'Dapatkan komisi recurring dengan merekomendasikan solusi SaaS BantuGrow.',
}

const benefits = [
  {
    value: '20%',
    title: 'Tahun pertama',
    body: 'Dapatkan 20% dari pembayaran pertama pelanggan yang tervalidasi.',
  },
  {
    value: '10%',
    title: 'Saat perpanjangan',
    body: 'Tetap dapatkan 10% saat pelanggan memperpanjang langganan.',
  },
  {
    value: '90 hari',
    title: 'Atribusi referral',
    body: 'Referral terakhir tersimpan selama 90 hari untuk kontak dan permintaan demo.',
  },
]

export default function AffiliatePage() {
  return (
    <>
      <PublicHero
        eyebrow="Program Affiliate BantuGrow"
        title="Bagikan solusi berguna."
        accent="Bangun penghasilan recurring."
        description="Rekomendasikan BantuGrow kepada jaringan Anda. Dapatkan komisi dari pembayaran pelanggan yang tervalidasi dan perpanjangan langganan mereka."
      >
        <div className="flex flex-col gap-3 pt-3 sm:flex-row">
          <Link
            href="/affiliate/daftar"
            className={cn(
              buttonVariants({ variant: 'brand', size: 'pill-sm' })
            )}
          >
            Mulai sekarang <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/affiliate/login"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'pill-sm' })
            )}
          >
            Login affiliate
          </Link>
        </div>
      </PublicHero>
      <PageContainer className="py-12 lg:py-20">
        <section aria-labelledby="affiliate-benefits-heading">
          <h2
            id="affiliate-benefits-heading"
            className="mb-10 text-balance text-3xl font-medium lg:text-4xl"
          >
            Nilai yang terus bertumbuh
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((item) => (
              <article
                key={item.title}
                className="space-y-5 rounded-3xl border p-6 lg:p-8"
              >
                <p className="font-heading text-5xl font-medium tabular-nums">
                  {item.value}
                </p>
                <h3 className="font-sans text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-pretty text-base leading-8 text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </PageContainer>
      <PageContainer className="pb-12 lg:pb-20">
        <section className="flex flex-col gap-6 rounded-3xl bg-secondary p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <h2 className="text-balance text-3xl font-medium">
              Pahami ketentuannya sebelum mulai
            </h2>
            <p className="text-base leading-8 text-muted-foreground">
              Payout minimum Rp100.000. Komisi ditahan 30 hari untuk validasi.
            </p>
          </div>
          <Link
            href="/affiliate/ketentuan"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'pill-sm' })
            )}
          >
            Baca ketentuan
          </Link>
        </section>
      </PageContainer>
    </>
  )
}
