import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock react for useActionState
vi.mock('react', async (importOriginal) => {
  const React = await importOriginal<typeof import('react')>()
  return {
    ...React,
    useActionState: (action: unknown, initialState: unknown) => [initialState, vi.fn(), false],
  }
})

// Mock server action
vi.mock('@/app/actions/submit-lead', () => ({
  submitLead: vi.fn().mockResolvedValue({ status: 'success' }),
}))

// Mock useTheme and ThemeProvider
vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock catalog for static pages
vi.mock('@/lib/catalog', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/catalog')>()
  return { ...original }
})

import HomePage from '@/app/(public)/page'
import CatalogPage from '@/app/(public)/produk/page'
import AboutPage from '@/app/(public)/tentang/page'
import GlobalNotFound from '@/app/not-found'
import { products } from '@/content/products'
import { ContactForm } from '@/app/(public)/kontak/ContactForm'

// Helper to count h1 elements in rendered output
function countH1(container: HTMLElement): number {
  return container.querySelectorAll('h1').length
}

// ─── Property 8: Single primary heading per page ──────────────────────────────
// Feature: bantugrow-company-profile, Property 8: Single primary heading per page
describe('Single h1 per page', () => {
  it('Home page has exactly one h1', async () => {
    const jsx = await HomePage()
    const { container } = render(jsx)
    expect(countH1(container)).toBe(1)
  })

  it('Catalog page has exactly one h1', async () => {
    const jsx = await CatalogPage()
    const { container } = render(jsx)
    expect(countH1(container)).toBe(1)
  })

  it('About page has exactly one h1', async () => {
    const jsx = await AboutPage()
    const { container } = render(jsx)
    expect(countH1(container)).toBe(1)
  })

  it('GlobalNotFound page has exactly one h1', async () => {
    const jsx = await GlobalNotFound()
    const { container } = render(jsx)
    expect(countH1(container)).toBe(1)
  })

  it(
    'Property 8: contact form container has at most zero h1 (h1 is on page level)',
    () => {
      // Validates: Requirements 9.2
      // ContactForm is a sub-component; the h1 lives in ContactPage (server component)
      // We verify the form component itself doesn't add an h1
      const { container } = render(<ContactForm products={products} />)
      expect(countH1(container)).toBe(0)
    }
  )

  it(
    'Property 8: parameterized — every static page has exactly one h1',
    async () => {
      // Validates: Requirements 9.2
      // We test all client-renderable pages parameterically
      const pages = [
        { name: 'Home', Page: HomePage },
        { name: 'Catalog', Page: CatalogPage },
        { name: 'About', Page: AboutPage },
        { name: 'NotFound', Page: GlobalNotFound },
      ]

      for (const { name, Page } of pages) {
        const jsx = await (Page as () => Promise<React.ReactElement> | React.ReactElement)()
        const { container } = render(jsx)
        const h1Count = countH1(container)
        expect(h1Count, `${name} page should have exactly 1 h1`).toBe(1)
      }
    }
  )
})
