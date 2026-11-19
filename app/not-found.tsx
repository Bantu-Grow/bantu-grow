import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/public-page'
import { copy } from '@/content/copy'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function GlobalNotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-secondary">
        <PageContainer className="flex flex-col items-center gap-6 py-20 text-center lg:py-24">
          <p
            aria-hidden="true"
            className="font-heading text-8xl leading-none font-medium text-primary tabular-nums"
          >
            404
          </p>
          <h1 className="text-balance text-4xl leading-tight font-medium lg:text-5xl">
            {copy.notFoundHeadline}
          </h1>
          <p className="text-base leading-8 text-muted-foreground">
            {copy.notFoundMessage}
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/produk"
              className={cn(
                buttonVariants({ variant: 'brand', size: 'pill-sm' })
              )}
            >
              {copy.notFoundCatalogLink}
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'pill-sm' })
              )}
            >
              {copy.notFoundHomeLink}
            </Link>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </>
  )
}
