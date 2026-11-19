import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import BlogArchivePage from '../page'

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

describe('BlogArchivePage', () => {
  it('combines category and query, preserves query in filters, and offers reset', async () => {
    render(
      await BlogArchivePage({
        searchParams: Promise.resolve({
          category: 'Manajemen Travel',
          q: 'stok',
        }),
      })
    )
    expect(
      screen.getByText('Tidak ada artikel yang ditemukan')
    ).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('stok')
    expect(
      screen.getByRole('link', { name: 'Reset pencarian' })
    ).toHaveAttribute('href', '/blog')
    const categoryLink = within(
      screen.getByRole('navigation', { name: 'Kategori artikel' })
    ).getByRole('link', { name: 'Komunitas' })
    expect(categoryLink.getAttribute('href')).toContain('q=stok')
    expect(categoryLink.getAttribute('href')).toContain('category=Komunitas')
  })

  it('renders matching articles even when the page query is malformed', async () => {
    render(
      await BlogArchivePage({
        searchParams: Promise.resolve({
          page: 'invalid',
          q: 'stok',
          category: 'UMKM & Ritel',
        }),
      })
    )
    expect(screen.getByRole('status')).toHaveTextContent('1 artikel ditemukan')
    expect(
      screen.getByRole('heading', { name: /cara mudah mengelola stok/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Navigasi halaman' })
    ).not.toBeInTheDocument()
  })
  it('renders the blog headline', async () => {
    const jsx = await BlogArchivePage()
    render(jsx)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(/ide praktis hari ini/i)
  })

  it('renders blog post cards', async () => {
    const jsx = await BlogArchivePage()
    render(jsx)
    expect(
      screen.getByText(/cara mudah mengelola stok barang untuk umkm ritel/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/strategi efisiensi operasional biro perjalanan umroh/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /meningkatkan konsistensi ibadah komunitas di era digital/i
      )
    ).toBeInTheDocument()
  })

  it('renders author names and dates', async () => {
    const jsx = await BlogArchivePage()
    render(jsx)
    expect(screen.getByText(/tim retail bantugrow/i)).toBeInTheDocument()
    expect(screen.getByText(/24 Jun 2026/i)).toBeInTheDocument()
  })

  it('renders links to blog detail pages', async () => {
    const jsx = await BlogArchivePage()
    render(jsx)
    const detailLinks = screen.getAllByRole('link')
    // We expect some links to point to blog details
    const hasBlogSlugLink = detailLinks.some((l) =>
      l.getAttribute('href')?.startsWith('/blog/')
    )
    expect(hasBlogSlugLink).toBe(true)
  })

  it('renders CTA banner at the bottom', async () => {
    const jsx = await BlogArchivePage()
    render(jsx)
    expect(
      screen.getByText(/belum tahu harus mulai dari mana\?/i)
    ).toBeInTheDocument()
  })
})
