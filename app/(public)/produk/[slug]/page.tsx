import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageContainer, PublicHero } from '@/components/public-page'
import { CallToAction } from '@/components/cta'
import { homeProductCopy } from '@/content/home'
import { cn } from '@/lib/utils'
import {
  getAllProducts,
  getProductBySlug,
  buildDetailView,
} from '@/lib/catalog'
import { buildContactHref } from '@/lib/contact-link'
import { productMetadata } from '@/lib/seo'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) {
    return { title: 'Produk Tidak Ditemukan — BantuGrow' }
  }
  return productMetadata(product)
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const vm = buildDetailView(product)
  const contactHref = buildContactHref(product.slug)

  // Related products: all other products excluding current
  const allProducts = await getAllProducts()
  const relatedProducts = allProducts.filter((p) => p.slug !== product.slug)

  return (
    <>
      <PublicHero
        eyebrow={product.niche}
        title={vm.name}
        description={vm.fullDescription}
        beforeTitle={
          <nav
            aria-label="Breadcrumb"
            className="text-sm text-muted-foreground"
          >
            <ol className="flex flex-wrap gap-3">
              <li>
                <Link
                  href="/produk"
                  className="rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Produk
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{vm.name}</li>
            </ol>
          </nav>
        }
        afterTitle={
          homeProductCopy[product.slug] && (
            <p className="max-w-2xl text-pretty text-xl leading-8 font-medium text-primary">
              {homeProductCopy[product.slug].benefit}
            </p>
          )
        }
      >
        {product.image && (
          <Image
            src={product.image}
            alt={vm.name}
            width={1000}
            height={563}
            className="h-auto w-full rounded-3xl object-cover"
            preload
          />
        )}
        <div className="flex flex-col gap-3 pt-3 sm:flex-row">
          <Link
            href={contactHref}
            className={cn(
              buttonVariants({ variant: 'brand', size: 'pill-sm' })
            )}
          >
            Hubungi Kami <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/produk"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'pill-sm' })
            )}
          >
            Lihat semua produk
          </Link>
        </div>
      </PublicHero>
      <PageContainer className="py-12 lg:py-20">
        <section aria-labelledby="features-heading">
          <h2
            id="features-heading"
            className="text-balance text-3xl font-medium lg:text-4xl"
          >
            Satu sistem untuk pekerjaan harian
          </h2>
          <p className="mt-4 mb-10 text-base leading-8 text-muted-foreground">
            Fitur utama {vm.name} untuk membantu operasional Anda.
          </p>
          <ul className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            {vm.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-4 border-t pt-6">
                <CheckCircle
                  className="mt-1 size-6 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="text-lg leading-8">{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      </PageContainer>
      {relatedProducts.length > 0 && (
        <section
          className="bg-secondary"
          aria-labelledby="related-products-heading"
        >
          <PageContainer className="py-12 lg:py-20">
            <h2
              id="related-products-heading"
              className="mb-10 text-3xl font-medium lg:text-4xl"
            >
              Produk Lainnya
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedProducts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/produk/${related.slug}`}
                  className="group flex min-w-0 flex-col gap-4 rounded-3xl border bg-background p-6 outline-none hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring lg:p-8"
                >
                  {related.image && (
                    <Image
                      src={related.image}
                      alt={related.name}
                      width={600}
                      height={338}
                      className="aspect-video w-full rounded-2xl object-cover"
                    />
                  )}
                  <p className="text-sm font-semibold text-primary">
                    {related.niche}
                  </p>
                  <h3 className="text-balance text-3xl leading-snug font-medium">
                    {related.name}
                  </h3>
                  <p className="text-pretty text-base leading-8 text-muted-foreground">
                    {related.shortDescription}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-3 text-sm font-semibold">
                    Lihat Detail{' '}
                    <ArrowRight
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </PageContainer>
        </section>
      )}
      <div className="pt-12 lg:pt-20">
        <CallToAction
          variant="catalog"
          title={`Tertarik dengan ${vm.name}?`}
          description="Diskusikan kebutuhan operasional atau kustomisasi produk dengan tim BantuGrow."
          primaryHref={contactHref}
          primaryLabel="Hubungi Kami"
          hideSecondary
        />
      </div>
    </>
  )
}
