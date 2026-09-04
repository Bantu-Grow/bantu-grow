/* eslint-disable @next/next/no-img-element -- test mock intentionally renders a raw img */
/**
 * Integration tests for SSR delivery and image pipeline.
 * Validates: Requirements 9.3 (SSR primary content) and 8.2 (responsive images)
 */
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { render } from '@testing-library/react'
import React from 'react'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock next/navigation (used by ProductDetailPage via notFound())
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
  redirect: () => {
    throw new Error('NEXT_REDIRECT')
  },
}))

// Mock next/image to emit a standard <img> with responsive props intact
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    sizes,
    fill,
    ...rest
  }: {
    src: string
    alt: string
    width?: number
    height?: number
    sizes?: string
    fill?: boolean
    [key: string]: unknown
  }) => {
    if (fill) {
      return <img src={src as string} alt={alt} data-fill="true" sizes={sizes} {...rest} />
    }
    return (
      <img src={src as string} alt={alt} width={width} height={height} sizes={sizes} {...rest} />
    )
  },
}))

import HomePage from '@/app/(public)/page'
import CatalogPage from '@/app/(public)/produk/page'
import ProductDetailPage from '@/app/(public)/produk/[slug]/page'
import { getAllProducts } from '@/lib/catalog'
import { copy } from '@/content/copy'

/**
 * Parse an HTML string produced by renderToString into a DOM node so that
 * assertions can use decoded textContent instead of raw HTML entities.
 */
function htmlToText(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent ?? ''
}

// ── SSR Delivery tests (Requirements 9.3) ─────────────────────────────────────
// Verifies that primary content is present in the initial server-rendered HTML.
// We use renderToString to produce HTML exactly as the server does, then parse
// it back through the DOM so text-content assertions are encoding-agnostic.

describe('SSR Delivery – primary content in server-rendered HTML (Req 9.3)', () => {
  it('Home page: h1 headline and product names appear in server HTML', async () => {
    const jsx = await HomePage()
    const html = renderToString(jsx)
    const text = htmlToText(html)
    expect(text).toContain('Tumbuhkan Bisnis UMKM')
    expect(text).toContain("Mutaba'ah Digital")
    expect(text).toContain('Management Travel Umroh')
    expect(text).toContain('Point of Sale')
    expect(text).toContain(copy.valuePropHeadline)
  })

  it('Catalog page: h1 and all product cards appear in server HTML', async () => {
    const jsx = await CatalogPage()
    const html = renderToString(jsx)
    const text = htmlToText(html)
    expect(text).toContain(copy.catalogHeadline)
    expect(text).toContain("Mutaba'ah Digital")
    expect(text).toContain('Management Travel Umroh')
    expect(text).toContain('Point of Sale')
  })

  it('Product Detail (mutabaah-digital): name and first feature in server HTML', async () => {
    const jsx = await ProductDetailPage({
      params: Promise.resolve({ slug: 'mutabaah-digital' }),
    })
    const html = renderToString(jsx as React.ReactElement)
    const text = htmlToText(html)
    expect(text).toContain("Mutaba'ah Digital")
    expect(text).toContain('Pencatatan amalan harian')
  })

  it('Product Detail (management-travel-umroh): name and first feature in server HTML', async () => {
    const jsx = await ProductDetailPage({
      params: Promise.resolve({ slug: 'management-travel-umroh' }),
    })
    const html = renderToString(jsx as React.ReactElement)
    const text = htmlToText(html)
    expect(text).toContain('Management Travel Umroh')
    expect(text).toContain('Pendaftaran jamaah')
  })

  it('Product Detail (pos): name and first feature in server HTML', async () => {
    const jsx = await ProductDetailPage({
      params: Promise.resolve({ slug: 'pos' }),
    })
    const html = renderToString(jsx as React.ReactElement)
    const text = htmlToText(html)
    expect(text).toContain('Point of Sale')
    expect(text).toContain('Transaksi penjualan')
  })

  it('All product detail pages: each product name is present in server HTML', async () => {
    const products = await getAllProducts()
    for (const product of products) {
      const jsx = await ProductDetailPage({
        params: Promise.resolve({ slug: product.slug }),
      })
      const html = renderToString(jsx as React.ReactElement)
      const text = htmlToText(html)
      expect(text, `"${product.slug}" must have its name in server HTML`).toContain(product.name)
    }
  })
})

// ── Image Pipeline tests (Requirements 8.2) ───────────────────────────────────
// Verifies that any <img> elements in rendered pages carry responsive attributes.
// next/image emits width+height for fixed images or fill+sizes for fluid images.
// No bare, unoptimized <img> tags (without any sizing hint) are permitted.

function assertAllImagesOptimized(container: HTMLElement, pageName: string) {
  const imgs = Array.from(container.querySelectorAll('img'))
  for (const img of imgs) {
    const hasWidth = img.hasAttribute('width')
    const hasSrcSet = img.hasAttribute('srcset')
    const hasSizes = img.hasAttribute('sizes')
    const isFill = img.dataset['fill'] === 'true'
    const isOptimized = hasWidth || hasSrcSet || hasSizes || isFill
    expect(
      isOptimized,
      `${pageName}: <img src="${img.getAttribute('src')}"> must have responsive attributes`,
    ).toBe(true)
  }
}

describe('Image pipeline – all <img> tags have responsive attributes (Req 8.2)', () => {
  it('Home page contains no unoptimized <img> tags', async () => {
    const jsx = await HomePage()
    const { container } = render(jsx)
    assertAllImagesOptimized(container, 'HomePage')
  })

  it('Catalog page contains no unoptimized <img> tags', async () => {
    const jsx = await CatalogPage()
    const { container } = render(jsx)
    assertAllImagesOptimized(container, 'CatalogPage')
  })

  it('Product Detail (pos) contains no unoptimized <img> tags', async () => {
    const jsx = await ProductDetailPage({
      params: Promise.resolve({ slug: 'pos' }),
    })
    const { container } = render(jsx as React.ReactElement)
    assertAllImagesOptimized(container, 'ProductDetailPage(pos)')
  })

  it('All product detail pages contain no unoptimized <img> tags', async () => {
    const products = await getAllProducts()
    for (const product of products) {
      const jsx = await ProductDetailPage({
        params: Promise.resolve({ slug: product.slug }),
      })
      const { container } = render(jsx as React.ReactElement)
      assertAllImagesOptimized(container, `ProductDetailPage(${product.slug})`)
    }
  })
})
