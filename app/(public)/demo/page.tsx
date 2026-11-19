import type { Metadata } from 'next'
import { DemoForm } from './DemoForm'
import { PageContainer, PublicHero } from '@/components/public-page'
import { demoMetadata } from '@/lib/seo'
import { getAllProducts } from '@/lib/catalog'
import { CheckCircle } from 'lucide-react'

export const metadata: Metadata = demoMetadata()

const benefits = [
  'Demo langsung dengan tim ahli kami',
  'Disesuaikan dengan kebutuhan bisnis Anda',
  'Tanpa komitmen, 100% gratis',
  'Konsultasi awal untuk solusi terbaik',
]

export default async function DemoPage() {
  // Options are derived from the catalog so the submitted slug always matches a
  // real product (the hardcoded list had drifted from the actual slugs).
  const products = await getAllProducts()
  const productOptions = products.map((p) => ({ slug: p.slug, name: p.name }))

  return (
    <>
      <PublicHero
        eyebrow="Demo Produk"
        title="Lihat produknya langsung."
        accent="Temukan yang cocok untuk usaha."
        description="Jadwalkan demo bersama tim BantuGrow. Kenali cara kerja produk dan diskusikan kebutuhan operasional usaha Anda."
      />
      <PageContainer className="grid items-start gap-10 py-12 lg:grid-cols-5 lg:gap-16 lg:py-20">
        <section
          className="space-y-6 lg:col-span-2"
          aria-labelledby="demo-benefits-heading"
        >
          <h2
            id="demo-benefits-heading"
            className="text-balance text-3xl font-medium lg:text-4xl"
          >
            Apa yang Anda dapatkan
          </h2>
          <ul className="space-y-5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <CheckCircle
                  className="mt-1 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="text-base leading-8 text-muted-foreground">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 rounded-2xl bg-secondary p-6">
            <h3 className="font-sans text-sm font-semibold">
              Setelah Anda mengirim
            </h3>
            <p className="text-base leading-8 text-muted-foreground">
              Tim kami akan menghubungi Anda dalam 1×24 jam setelah pengajuan
              demo diterima.
            </p>
          </div>
        </section>
        <section
          className="min-w-0 space-y-6 rounded-3xl border p-6 sm:p-10 lg:col-span-3"
          aria-labelledby="demo-form-heading"
        >
          <h2 id="demo-form-heading" className="text-3xl font-medium">
            Jadwalkan demo Anda
          </h2>
          <DemoForm products={productOptions} />
        </section>
      </PageContainer>
    </>
  )
}
