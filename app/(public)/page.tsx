import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroSection } from '@/components/hero'
import { FeatureSection } from '@/components/feature-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { CallToAction } from '@/components/cta'
import { DecorIcon } from '@/components/decor-icon'
import { getAllProducts, buildCatalogView } from '@/lib/catalog'
import { homeMetadata } from '@/lib/seo'

export const metadata: Metadata = homeMetadata()

export default async function HomePage() {
  const products = await getAllProducts()
  const catalogCards = buildCatalogView(products)

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20 overflow-x-hidden bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Product highlights */}
      <section className="relative mx-auto w-full max-w-5xl px-4 md:px-8">
        <div className="relative border-y border-border/80 py-16 md:py-20">
          <DecorIcon className="size-4" position="top-left" />
          <DecorIcon className="size-4" position="top-right" />
          <DecorIcon className="size-4" position="bottom-left" />
          <DecorIcon className="size-4" position="bottom-right" />

          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold md:text-3xl lg:text-4xl text-foreground mb-3">Produk Kami</h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Solusi digital untuk berbagai kebutuhan operasional UMKM Indonesia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-dashed divide-border/80 border border-dashed border-border/80 rounded-lg overflow-hidden bg-card">
            {catalogCards.map((card) => (
              <div key={card.slug} className="flex flex-col p-6 md:p-8 hover:bg-muted/10 transition-colors">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  {card.niche}
                </span>
                <h3 className="text-lg font-bold text-foreground mb-3">{card.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">{card.shortDescription}</p>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={card.href} />}
                  nativeButton={false}
                  className="self-start mt-auto"
                >
                  Pelajari Lebih Lanjut
                  <ArrowRight className="ml-1 h-3.5 w-3.5 text-primary" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition (Feature Section) */}
      <FeatureSection />

      {/* Testimonials Section */}
      <section className="relative mx-auto w-full max-w-5xl px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-extrabold md:text-3xl lg:text-4xl text-foreground mb-3">Kata Mereka</h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Bagaimana BantuGrow membantu pelaku UMKM mengembangkan bisnis mereka secara nyata
          </p>
        </div>
        <div className="pb-16 md:pb-24">
          <TestimonialsSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto w-full max-w-5xl px-4 md:px-8">
        <CallToAction />
      </section>
    </div>
  )
}
