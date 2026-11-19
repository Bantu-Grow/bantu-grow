'use client'

import Link from 'next/link'
import { Tabs } from '@base-ui/react/tabs'
import { ArrowRight, Check } from 'lucide-react'
import { homeProductCopy } from '@/content/home'
import type { Product } from '@/content/products'

const preferredOrder = ['pos', 'management-travel-umroh', 'mutabaah-digital']

export function ProductNeedsSelector({ products }: { products: Product[] }) {
  const options = [...products].sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a.slug)
    const bIndex = preferredOrder.indexOf(b.slug)
    return (aIndex < 0 ? preferredOrder.length : aIndex) - (bIndex < 0 ? preferredOrder.length : bIndex)
  })

  if (options.length === 0) return null

  return (
    <Tabs.Root defaultValue={options[0].slug} id="solusi" className="mt-8 w-full max-w-240 scroll-mt-28 rounded-3xl border bg-background p-5 text-left shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h2 className="font-sans text-lg font-semibold">Apa yang ingin Anda kelola?</h2>
        <p className="text-xs text-muted-foreground">Pilih kebutuhan Anda</p>
      </div>
      <Tabs.List activateOnFocus aria-label="Pilih kebutuhan usaha" className="flex gap-2 overflow-x-auto rounded-3xl bg-muted p-1.5 sm:rounded-full">
        {options.map((product) => (
          <Tabs.Tab key={product.slug} value={product.slug} className="min-h-12 min-w-0 flex-1 cursor-pointer rounded-full border border-transparent px-3 py-2 text-center text-xs font-semibold text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 data-active:border-primary data-active:bg-secondary data-active:text-foreground motion-reduce:transition-none sm:text-sm">
            {homeProductCopy[product.slug]?.label ?? product.niche}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {options.map((product) => (
        <Tabs.Panel key={product.slug} value={product.slug} className="mt-6 grid gap-6 rounded-xl p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-2 md:gap-12">
          <div className="flex flex-col items-start gap-3">
            <h3 className="text-balance text-2xl font-medium sm:text-3xl">{product.name}</h3>
            <p className="text-pretty text-sm leading-7 text-muted-foreground">
              {homeProductCopy[product.slug]?.benefit ?? product.shortDescription}
            </p>
            <Link href={`/produk/${product.slug}`} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
              {homeProductCopy[product.slug]?.action ?? `Lihat ${product.name}`}
              <ArrowRight className="size-4.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="flex flex-col justify-center gap-4">
            {product.features.slice(0, 3).map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-secondary-foreground">
                <Check className="mt-1 size-4 shrink-0" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
