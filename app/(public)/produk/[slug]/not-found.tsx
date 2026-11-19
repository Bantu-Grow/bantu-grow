import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { PageContainer } from '@/components/public-page'
import { cn } from '@/lib/utils'
import { copy } from '@/content/copy'
import { ArrowRightIcon, PackageX } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="bg-secondary">
      <PageContainer className="flex flex-col items-center gap-6 py-20 text-center lg:py-24">
        <div className="flex size-24 items-center justify-center rounded-full border bg-background">
          <PackageX className="size-10 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-balance text-4xl leading-tight font-medium lg:text-5xl">
          {copy.notFoundHeadline}
        </h1>
        <p className="text-base leading-8 text-muted-foreground">
          {copy.notFoundProductMessage}
        </p>
        <Link
          href="/produk"
          className={cn(buttonVariants({ variant: 'brand', size: 'pill-sm' }))}
        >
          {copy.notFoundCatalogLink}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </PageContainer>
    </div>
  )
}
