import Link from 'next/link'
import { ArrowRight, PhoneCall } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { ProductNeedsSelector } from '@/components/product-needs-selector'
import { copy } from '@/content/copy'
import type { Product } from '@/content/products'
import { cn } from '@/lib/utils'
import { BrandHeroBackground } from '@/components/brand-hero-background'

export function HeroSection({ products }: { products: Product[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-secondary">
      <BrandHeroBackground />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 pt-14 pb-14 text-center sm:px-8 lg:px-10 lg:pt-18">
        <p className="text-sm font-semibold text-muted-foreground">Solusi digital untuk UMKM Indonesia</p>
        <h1 className="text-balance text-4xl leading-tight font-medium sm:text-5xl lg:text-6xl">
          Kurangi kerja manual.{' '}
          <span className="block text-primary">Fokus tumbuhkan usaha.</span>
        </h1>
        <p className="max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {copy.heroDescription}
        </p>
        <div className="mt-2 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
          <Link href="/demo" className={cn(buttonVariants({ variant: 'brand', size: 'pill' }))}>
            <PhoneCall className="size-4.5" aria-hidden="true" />
            Minta Demo Gratis
          </Link>
          <Link href="#solusi" className={cn(buttonVariants({ variant: 'brandOutline', size: 'pill' }))}>
            Temukan Solusi Anda
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </Link>
        </div>
        <ProductNeedsSelector products={products} />
      </div>
    </section>
  )
}
