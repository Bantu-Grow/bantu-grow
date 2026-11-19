'use client'

import { buttonVariants } from '@/components/ui/button'
import { DecorIcon } from '@/components/decor-icon'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { copy } from '@/content/copy'
import { cn } from '@/lib/utils'

export function CallToAction({
  variant = 'default',
  title,
  description,
  primaryHref = '/kontak',
  primaryLabel = 'Diskusikan kebutuhan',
  hideSecondary = false,
}: {
  variant?: 'default' | 'home' | 'catalog'
  title?: string
  description?: string
  primaryHref?: string
  primaryLabel?: string
  hideSecondary?: boolean
}) {
  if (variant === 'catalog') {
    return (
      <section
        className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-10"
        aria-labelledby="catalog-consultation-heading"
      >
        <div className="flex flex-col gap-8 rounded-3xl bg-foreground p-7 text-background sm:p-10 lg:flex-row lg:items-center lg:gap-16 lg:p-14">
          <div className="flex-1 space-y-5">
            <h2
              id="catalog-consultation-heading"
              className="max-w-xl text-balance text-3xl leading-tight font-medium lg:text-4xl"
            >
              {title ?? 'Belum tahu harus mulai dari mana?'}
            </h2>
            <p className="max-w-2xl text-pretty text-base leading-7 text-border">
              {description ??
                'Ceritakan kebutuhan usaha Anda. Tim BantuGrow akan membantu menemukan produk yang paling relevan dengan pekerjaan sehari-hari Anda.'}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-4 lg:w-65">
            <Link
              href={primaryHref}
              className={cn(buttonVariants({ variant: 'brand', size: 'pill' }))}
            >
              {primaryLabel}{' '}
              <ArrowRightIcon className="size-4.5" aria-hidden="true" />
            </Link>
            {!hideSecondary && (
              <Link
                href="/produk"
                className={cn(
                  buttonVariants({ variant: 'brandOutline', size: 'pill' }),
                  'border-border text-background hover:bg-background/10'
                )}
              >
                Lihat semua produk
              </Link>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'home') {
    return (
      <section className="bg-secondary" aria-labelledby="demo-heading">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between lg:gap-16 lg:px-10 lg:py-18">
          <div className="max-w-2xl space-y-4">
            <h2
              id="demo-heading"
              className="max-w-xl text-balance text-3xl leading-tight font-medium lg:text-4xl"
            >
              Lihat cara BantuGrow membantu usaha Anda
            </h2>
            <p className="text-pretty text-base leading-7 text-muted-foreground">
              Ceritakan kebutuhan bisnis Anda. Tim kami akan memperlihatkan
              produk yang relevan dan menjawab pertanyaan Anda dalam sesi demo.
            </p>
            <p className="text-sm font-medium text-secondary-foreground">
              Gratis, tanpa komitmen. Disesuaikan dengan kebutuhan usaha Anda.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-4 md:w-60">
            <Link
              href="/demo"
              className={cn(buttonVariants({ variant: 'brand', size: 'pill' }))}
            >
              Minta Demo Gratis{' '}
              <ArrowRightIcon className="size-4.5" aria-hidden="true" />
            </Link>
            <Link
              href="/kontak"
              className={cn(
                buttonVariants({ variant: 'brandOutline', size: 'pill' })
              )}
            >
              Diskusikan Kebutuhan
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-y-6 border-y border-border/80 px-6 py-12 dark:bg-[radial-gradient(35%_80%_at_25%_0%,--theme(--color-foreground/.08),transparent)]">
      <DecorIcon className="size-4" position="top-left" />
      <DecorIcon className="size-4" position="top-right" />
      <DecorIcon className="size-4" position="bottom-left" />
      <DecorIcon className="size-4" position="bottom-right" />

      <div className="pointer-events-none absolute -inset-y-6 -left-px w-px border-l border-border/60" />
      <div className="pointer-events-none absolute -inset-y-6 -right-px w-px border-r border-border/60" />

      <div className="absolute top-0 left-1/2 -z-10 h-full border-l border-dashed border-border/40" />

      <h2 className="text-center font-extrabold text-2xl md:text-3xl lg:text-4xl text-foreground">
        Siap Tumbuh Bersama BantuGrow?
      </h2>
      <p className="text-balance text-center text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg mx-auto">
        Hubungi kami sekarang dan temukan solusi digital terbaik untuk
        operasional bisnis UMKM Anda.
      </p>

      <div className="flex items-center justify-center gap-4 pt-2">
        <Link
          href="/produk"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Jelajahi Produk
        </Link>
        <Link
          href="/kontak"
          className={cn(
            buttonVariants({ variant: 'default' }),
            'flex items-center gap-1.5'
          )}
        >
          {copy.heroCta}
          <ArrowRightIcon className="h-4 w-4" data-icon="inline-end" />
        </Link>
      </div>
    </div>
  )
}
