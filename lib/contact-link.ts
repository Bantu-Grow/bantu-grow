import type { Product } from '@/content/products'

/**
 * Build the href for the contact CTA button.
 * If a productSlug is provided, includes it as a query param.
 * e.g. /kontak?produk=pos
 */
export function buildContactHref(productSlug?: string): string {
  if (productSlug) {
    return `/kontak?produk=${encodeURIComponent(productSlug)}`
  }
  return '/kontak'
}

/**
 * Parse the `produk` query param from a URLSearchParams and find the matching product.
 * Returns the Product if found, undefined otherwise.
 */
export function parseContactSubject(
  query: URLSearchParams,
  products: Product[]
): Product | undefined {
  const slug = query.get('produk')
  if (!slug) return undefined
  return products.find((p) => p.slug === slug)
}

/**
 * Build the href for a pricing tier CTA. Packages are not products, so they use
 * their own query param — sending them as `produk` silently matched nothing.
 * e.g. /kontak?paket=growth
 */
export function buildPricingContactHref(tierSlug: string): string {
  return `/kontak?paket=${encodeURIComponent(tierSlug)}`
}

/**
 * Resolve the `paket` query param to a pricing tier name, so the contact form
 * can pre-fill the message with the package the visitor picked.
 */
export function parsePricingPackage(
  query: URLSearchParams,
  tiers: { slug: string; name: string }[]
): string | undefined {
  const slug = query.get('paket')
  if (!slug) return undefined
  return tiers.find((t) => t.slug === slug)?.name
}
