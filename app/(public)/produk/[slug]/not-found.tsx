import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { copy } from '@/content/copy'
import { ArrowRightIcon, PackageX } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-8 py-20 text-center">
      {/* Illustration */}
      <div className="mx-auto mb-8 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex size-24 items-center justify-center rounded-full border border-border/60 bg-muted/30">
            <PackageX className="size-10 text-muted-foreground/60" aria-hidden="true" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4 md:text-4xl">
        {copy.notFoundHeadline}
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
        {copy.notFoundProductMessage}
      </p>
      {/* Styled as a button but kept a real link, so it stays announced as a
          link and does not trigger the Base UI nativeButton warning. */}
      <Link href="/produk" className={buttonVariants()}>
        {copy.notFoundCatalogLink}
        <ArrowRightIcon className="ml-1.5 h-4 w-4 shrink-0" data-icon="inline-end" />
      </Link>
    </div>
  )
}
