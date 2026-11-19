import type { Metadata } from 'next'
import { contactMetadata } from '@/lib/seo'
import { getAllProducts } from '@/lib/catalog'
import { parseContactSubject, parsePricingPackage } from '@/lib/contact-link'
import { pricingTiers } from '@/content/pricing'
import { copy } from '@/content/copy'
import { ContactForm } from './ContactForm'
import Link from 'next/link'
import { Mail, MessageCircle } from 'lucide-react'
import { PageContainer, PublicHero } from '@/components/public-page'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <>
      <PublicHero
        eyebrow="Kontak BantuGrow"
        title="Ceritakan kebutuhan Anda."
        accent="Kita cari langkah berikutnya."
        description="Ingin merapikan usaha atau bertanya tentang produk? Sampaikan kebutuhan Anda, lalu tim BantuGrow akan membantu menentukan solusi yang relevan."
      />
      <PageContainer className="grid items-start gap-10 py-12 lg:grid-cols-5 lg:gap-16 lg:py-20">
        <section
          className="space-y-8 lg:col-span-2"
          aria-labelledby="contact-channels-heading"
        >
          <h2
            id="contact-channels-heading"
            className="text-balance text-3xl font-medium lg:text-4xl"
          >
            Mulai dari percakapan
          </h2>
          <p className="text-pretty text-base leading-8 text-muted-foreground">
            Pilih kanal yang nyaman untuk Anda. Untuk pertanyaan produk,
            sertakan kebutuhan usaha agar tim kami bisa membantu dengan lebih
            tepat.
          </p>
          <a
            href={`mailto:${copy.contactEmail}`}
            className="flex flex-col gap-3 rounded-2xl bg-secondary p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail className="size-6 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold">Email kami</span>
            <span className="text-xl font-medium break-all">
              {copy.contactEmail}
            </span>
          </a>
          <a
            href={`https://wa.me/${copy.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-3 rounded-2xl border p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MessageCircle className="size-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-medium">Chat via WhatsApp</span>
            <span className="text-base leading-8 text-muted-foreground">
              Diskusikan kebutuhan usaha langsung dengan tim kami.
            </span>
          </a>
          <p className="text-base leading-8 text-muted-foreground">
            Ingin melihat produknya lebih dulu?
          </p>
          <Link
            href="/demo"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'pill-sm' }),
              'w-full'
            )}
          >
            Minta Demo Gratis
          </Link>
        </section>
        <section
          className="min-w-0 space-y-6 rounded-3xl border p-6 sm:p-10 lg:col-span-3"
          aria-labelledby="contact-form-heading"
        >
          <h2
            id="contact-form-heading"
            className="text-balance text-3xl font-medium"
          >
            Kirim pesan kepada kami
          </h2>
          <ContactForm
            products={products}
            preSelectedSlug={preSelected?.slug}
            preFilledMessage={
              packageName
                ? `Halo, saya tertarik dengan paket ${packageName}.`
                : undefined
            }
          />
        </section>
      </PageContainer>
    </>
  )
}
