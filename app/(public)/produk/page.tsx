import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, Search } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandHeroBackground } from '@/components/brand-hero-background'
import { CallToAction } from '@/components/cta'
import { cn } from '@/lib/utils'
import { getAllProducts } from '@/lib/catalog'
import { catalogMetadata } from '@/lib/seo'
import { copy } from '@/content/copy'
import { homeProductCopy } from '@/content/home'

export const metadata: Metadata = catalogMetadata()

interface PageProps {
  searchParams?: Promise<{ niche?: string | string[]; q?: string | string[] }>
}

export default async function CatalogPage({ searchParams }: PageProps = {}) {
  const params = searchParams ? await searchParams : {}
  const selectedNiche = (Array.isArray(params.niche) ? params.niche[0] : params.niche) || ''
  const searchQuery = ((Array.isArray(params.q) ? params.q[0] : params.q) || '').trim()
  const allProducts = await getAllProducts()
  const niches = Array.from(new Set(allProducts.map((product) => product.niche))).sort()
  const hasFilters = Boolean(searchQuery || selectedNiche)

  let filteredProducts = selectedNiche
    ? allProducts.filter((product) => product.niche === selectedNiche)
    : allProducts

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredProducts = filteredProducts.filter((product) =>
      [product.name, product.shortDescription, product.fullDescription].some((text) => text.toLowerCase().includes(query))
    )
  }

  function buildUrl(overrides: { niche?: string; q?: string }) {
    const params = new URLSearchParams()
    const niche = overrides.niche !== undefined ? overrides.niche : selectedNiche
    const query = overrides.q !== undefined ? overrides.q : searchQuery
    if (niche) params.set('niche', niche)
    if (query) params.set('q', query)
    const queryString = params.toString()
    return `/produk${queryString ? `?${queryString}` : ''}`
  }

  const resultsHeading = searchQuery
    ? `Hasil pencarian “${searchQuery}”`
    : selectedNiche ? `Produk untuk ${selectedNiche}` : 'Mulai dari kebutuhan Anda'

  return (
    <div className="bg-background">
      <section className="relative isolate overflow-hidden bg-secondary" aria-labelledby="catalog-heading">
        <BrandHeroBackground />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-14 sm:px-8 lg:px-10 lg:py-18">
          <div className="flex max-w-3xl flex-col gap-5">
            <p className="text-sm font-semibold text-muted-foreground">Produk BantuGrow</p>
            <h1 id="catalog-heading" className="text-balance text-4xl leading-tight font-medium sm:text-5xl lg:text-6xl">
              {copy.catalogHeadline}{' '}
              <span className="block text-primary">{copy.catalogHeadlineAccent}</span>
            </h1>
            <p className="max-w-3xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">{copy.catalogDescription}</p>
          </div>
          <form action="/produk" method="get" role="search" className="flex w-full max-w-3xl items-center gap-2 rounded-full border bg-background p-2 pl-4 shadow-sm focus-within:ring-2 focus-within:ring-ring sm:gap-4 sm:pl-6">
            {selectedNiche && <input type="hidden" name="niche" value={selectedNiche} />}
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input key={searchQuery} type="search" name="q" id="produk-search" defaultValue={searchQuery} placeholder="Cari nama produk atau kebutuhan Anda..." aria-label="Cari produk" className="h-12 min-w-0 flex-1 rounded-none border-0 px-0 focus-visible:ring-0" />
            <Button type="submit" variant="brand" size="pill-sm">Cari produk</Button>
          </form>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-16 sm:px-8 lg:px-10 lg:py-20" aria-labelledby="catalog-results-heading">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end md:gap-8">
            <h2 id="catalog-results-heading" className="text-balance text-3xl leading-tight font-medium break-words lg:text-4xl">{resultsHeading}</h2>
            <p className="shrink-0 text-sm text-muted-foreground" role="status">{filteredProducts.length} produk {hasFilters ? 'ditemukan' : 'tersedia'}</p>
          </div>
          <nav aria-label="Filter kategori produk" className="flex flex-wrap gap-3">
            <Link href={buildUrl({ niche: '' })} aria-current={!selectedNiche ? 'page' : undefined} className={cn(buttonVariants({ variant: !selectedNiche ? 'brand' : 'outline', size: 'pill-sm' }), 'border-border')}>Semua produk</Link>
            {niches.map((niche) => (
              <Link key={niche} href={buildUrl({ niche })} aria-current={selectedNiche === niche ? 'page' : undefined} className={cn(buttonVariants({ variant: selectedNiche === niche ? 'brand' : 'outline', size: 'pill-sm' }), 'border-border', selectedNiche !== niche && 'text-muted-foreground')}>{niche}</Link>
            ))}
          </nav>
        </div>
        {filteredProducts.length === 0 ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-5 rounded-3xl border bg-muted px-6 py-16 text-center sm:px-10">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><Search className="size-6" aria-hidden="true" /></span>
            <h3 className="text-balance text-2xl leading-tight font-medium sm:text-3xl">{hasFilters ? 'Tidak ada produk yang ditemukan.' : copy.emptyCatalogMessage}</h3>
            <p className="max-w-lg text-pretty text-base leading-7 text-muted-foreground">{hasFilters ? 'Coba kata kunci lain atau reset pencarian untuk melihat semua produk BantuGrow.' : 'Ceritakan kebutuhan Anda, tim kami siap membantu mencari solusi yang sesuai.'}</p>
            <Link href={hasFilters ? '/produk' : '/kontak'} className={cn(buttonVariants({ variant: 'brand', size: 'pill-sm' }), 'mt-2')}>{hasFilters ? 'Reset pencarian' : 'Diskusikan kebutuhan'}</Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const presentation = homeProductCopy[product.slug]
              const features = (presentation?.featureIndexes ?? [0, 1, 2]).flatMap((index) => product.features[index] ? [product.features[index]] : [])
              return (
                <article key={product.slug} aria-labelledby={`product-${product.slug}`} className="flex min-w-0 flex-col overflow-hidden rounded-3xl border bg-background">
                  {product.image && <Image src={product.image} alt={product.name} width={400} height={200} sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw" className="aspect-2/1 w-full object-cover" />}
                  <div className="flex flex-col gap-5 bg-secondary p-7">
                    <p className="text-xs font-semibold text-muted-foreground">{product.niche}</p>
                    <h3 id={`product-${product.slug}`} className="text-balance text-2xl leading-tight font-medium sm:min-h-16">{product.name}</h3>
                  </div>
                  <div className="flex flex-1 flex-col gap-6 p-7">
                    <p className="text-pretty text-base leading-7 text-muted-foreground sm:min-h-35">{presentation?.description ?? product.shortDescription}</p>
                    {features.length > 0 && (
                      <div className="space-y-4 border-t pt-5">
                        <h4 className="font-sans text-sm font-semibold text-secondary-foreground">Yang bisa Anda kelola</h4>
                        <ul className="space-y-4">
                          {features.map((feature) => <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-secondary-foreground" aria-hidden="true" />{feature}</li>)}
                        </ul>
                      </div>
                    )}
                    <Link href={`/produk/${product.slug}`} aria-label={`Lihat detail ${product.name}`} className={cn(buttonVariants({ variant: 'brandOutline', size: 'pill-sm' }), 'mt-auto justify-between')}>Lihat detail<ArrowRight className="size-4.5" aria-hidden="true" /></Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
      <CallToAction variant="catalog" />
    </div>
  )
}
