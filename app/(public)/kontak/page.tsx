import type { Metadata } from 'next'
import { contactMetadata } from '@/lib/seo'
import { getAllProducts } from '@/lib/catalog'
import { parseContactSubject, parsePricingPackage } from '@/lib/contact-link'
import { pricingTiers } from '@/content/pricing'
import { copy } from '@/content/copy'
import { ContactForm } from './ContactForm'
import { DecorIcon } from '@/components/decor-icon'

export const metadata: Metadata = contactMetadata()

interface PageProps {
  searchParams: Promise<{ produk?: string; paket?: string }>
}

export default async function ContactPage({ searchParams }: PageProps) {
  const params = await searchParams
  const products = await getAllProducts()

  // Determine pre-selected product from query param
  const urlParams = new URLSearchParams()
  if (params.produk) urlParams.set('produk', params.produk)
  if (params.paket) urlParams.set('paket', params.paket)

  const preSelected = parseContactSubject(urlParams, products)
  // Pricing CTAs send a package instead of a product; carry that context into
  // the message so the enquiry is not stripped of what the visitor clicked.
  const packageName = parsePricingPackage(urlParams, pricingTiers)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 md:px-8 py-12 md:py-16">
      <div className="relative border-y border-border/80 py-12 px-6 md:px-8 bg-card rounded-lg shadow-sm">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3 md:text-4xl">
          {copy.contactHeadline}
        </h1>
        <p className="text-muted-foreground mb-8 text-sm md:text-base leading-relaxed">
          {copy.contactDescription}
        </p>

        <ContactForm
          products={products}
          preSelectedSlug={preSelected?.slug}
          preFilledMessage={
            packageName ? `Halo, saya tertarik dengan paket ${packageName}.` : undefined
          }
        />
      </div>
    </div>
  )
}
