import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { DecorIcon } from '@/components/decor-icon'
import { CallToAction } from '@/components/cta'
import { cn } from '@/lib/utils'
import { getAllProducts } from '@/lib/catalog'
import { catalogMetadata } from '@/lib/seo'
import { copy } from '@/content/copy'

export const metadata: Metadata = catalogMetadata()

interface PageProps {
  searchParams?: Promise<{ niche?: string; q?: string }>
}

export default async function CatalogPage({ searchParams }: PageProps = {}) {
  const params = searchParams ? await searchParams : {}
  const selectedNiche = params.niche || ''
  const searchQuery = params.q || ''

  const allProducts = await getAllProducts()

  // Get unique niches for filter
  const niches = Array.from(new Set(allProducts.map((p) => p.niche))).sort()

  // Filter by niche
  let filteredProducts = selectedNiche
    ? allProducts.filter((p) => p.niche === selectedNiche)
    : allProducts

  // Filter by search query
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.fullDescription.toLowerCase().includes(q)
    )
  }

  // Build URL helper
  function buildUrl(overrides: { niche?: string; q?: string }) {
    const p = new URLSearchParams()
    const niche = overrides.niche !== undefined ? overrides.niche : selectedNiche
    const query = overrides.q !== undefined ? overrides.q : searchQuery
    if (niche) p.set('niche', niche)
    if (query) p.set('q', query)
    const qs = p.toString()
    return `/produk${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-8 py-12 md:py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3 md:text-4xl">
          {copy.catalogHeadline}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">{copy.catalogDescription}</p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <form action="/produk" method="get" role="search" className="flex gap-2">
          {selectedNiche && <input type="hidden" name="niche" value={selectedNiche} />}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              name="q"
              id="produk-search"
              defaultValue={searchQuery}
              placeholder="Cari produk..."
              aria-label="Cari produk"
              className="block w-full rounded-lg border border-input bg-transparent py-2.5 pl-10 pr-4 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Niche filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <Link
          href={buildUrl({ niche: '' })}
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !selectedNiche
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Semua
        </Link>
        {niches.map((niche) => (
          <Link
            key={niche}
            href={buildUrl({ niche })}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedNiche === niche
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {niche}
          </Link>
        ))}
      </div>

      <div className="relative border-y border-border/80 py-12 mb-16">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        {filteredProducts.length === 0 ? (
          <div
            role="status"
            aria-live="polite"
            className="text-center py-16 text-muted-foreground"
          >
            <p>{searchQuery || selectedNiche ? 'Tidak ada produk yang ditemukan.' : copy.emptyCatalogMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-dashed divide-border/80 border border-dashed border-border/80 rounded-lg overflow-hidden bg-card">
            {filteredProducts.map((product) => (
              <div key={product.slug} className="flex flex-col p-6 md:p-8 hover:bg-muted/10 transition-colors">
                {/* Product image */}
                {product.image && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-border/40">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={200}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  {product.niche}
                </span>
                <h2 className="text-lg font-bold text-foreground mb-3">{product.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">{product.shortDescription}</p>
                <Link
                  href={`/produk/${product.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start mt-auto")}
                >
                  Lihat Detail
                  <ArrowRight className="ml-1 h-3.5 w-3.5 text-primary" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <CallToAction />
      </div>
    </div>
  )
}
