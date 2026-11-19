import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { HeroSection } from '@/components/hero'
import { FeatureSection } from '@/components/feature-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { CallToAction } from '@/components/cta'
import { getAllProducts, buildCatalogView } from '@/lib/catalog'
import { homeMetadata } from '@/lib/seo'
import { homeProductCopy } from '@/content/home'
import { copy } from '@/content/copy'

export const metadata: Metadata = homeMetadata()

export default async function HomePage() {
  const products = await getAllProducts()
  const catalogCards = buildCatalogView(products)

  return (
    <div className="bg-background">
      <HeroSection products={products} />
      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-22" aria-labelledby="products-heading">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-4">
            <h2 id="products-heading" className="text-balance text-3xl leading-tight font-medium lg:text-4xl">Temukan solusi untuk usaha Anda</h2>
            <p className="text-pretty text-base leading-7 text-muted-foreground">Dari toko hingga biro umroh dan komunitas, mulai dari kebutuhan yang paling dekat dengan aktivitas Anda.</p>
          </div>
          <Link href="/produk" className="shrink-0 self-start rounded-sm py-2 text-sm font-semibold underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring md:self-auto">Lihat semua produk</Link>
        </div>
        {catalogCards.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {catalogCards.map((card) => (
              <article key={card.slug} className="flex flex-col overflow-hidden rounded-2xl border">
                <div className="flex flex-col gap-5 bg-secondary p-7">
                  <p className="text-xs font-semibold text-muted-foreground">{card.niche}</p>
                  <h3 className="text-balance text-2xl leading-tight font-medium md:min-h-16">{card.name}</h3>
                </div>
                <div className="flex flex-1 flex-col gap-7 p-7">
                  <p className="flex-1 text-pretty text-base leading-7 text-muted-foreground">{homeProductCopy[card.slug]?.description ?? card.shortDescription}</p>
                  <Link href={card.href} className="mt-auto flex min-h-12 items-center justify-between gap-3 border-t pt-5 text-sm font-semibold outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
                    {homeProductCopy[card.slug]?.action ?? `Lihat ${card.name}`}
                    <ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-muted p-8">
            <p className="text-muted-foreground">{copy.emptyCatalogMessage}</p>
            <Link href="/kontak" className="mt-4 inline-block font-semibold underline underline-offset-4">Diskusikan kebutuhan Anda</Link>
          </div>
        )}
      </section>
      <FeatureSection />
      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-22" aria-labelledby="testimonials-heading">
        <div className="mb-10 max-w-2xl space-y-4">
          <h2 id="testimonials-heading" className="text-balance text-3xl leading-tight font-medium lg:text-4xl">Dari pekerjaan harian, terasa manfaatnya</h2>
          <p className="text-pretty text-base leading-7 text-muted-foreground">Simak pengalaman pengguna BantuGrow saat mengelola toko, komunitas, dan perjalanan umroh.</p>
        </div>
        <TestimonialsSection />
      </section>
      <CallToAction variant="home" />
    </div>
  )
}
