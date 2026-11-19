import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock catalog module to allow test overrides
vi.mock('@/lib/catalog', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/catalog')>()
  return {
    ...original,
    getAllProducts: vi.fn(original.getAllProducts),
    buildCatalogView: vi.fn(original.buildCatalogView),
  }
})

import CatalogPage from '../page'
import * as catalog from '@/lib/catalog'

describe('CatalogPage', () => {
  it('renders the catalog headline', async () => {
    const jsx = await CatalogPage()
    render(jsx)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(/pilih solusi digital/i)
  })

  it('renders product cards when products exist', async () => {
    const jsx = await CatalogPage()
    render(jsx)
    expect(screen.getByText(/mutaba'ah digital/i)).toBeInTheDocument()
    expect(screen.getByText(/management travel umroh/i)).toBeInTheDocument()
    expect(screen.getByText(/point of sale/i)).toBeInTheDocument()
  })

  it('shows niche labels on product cards', async () => {
    const jsx = await CatalogPage()
    render(jsx)
    expect(screen.getAllByText(/ibadah & komunitas/i).length).toBeGreaterThan(0)
  })

  it('renders links to product detail pages', async () => {
    const jsx = await CatalogPage()
    render(jsx)
    const detailLinks = screen.getAllByRole('link', { name: /lihat detail/i })
    expect(detailLinks.length).toBeGreaterThan(0)
    const hasSlugLink = detailLinks.some((l) => l.getAttribute('href')?.startsWith('/produk/'))
    expect(hasSlugLink).toBe(true)
  })

  it('shows empty-catalog message when there are no products', async () => {
    // Override getAllProducts to return empty array
    vi.mocked(catalog.getAllProducts).mockResolvedValueOnce([])
    const jsx = await CatalogPage()
    render(jsx)
    expect(
      screen.getByText(/belum ada produk yang tersedia/i)
    ).toBeInTheDocument()
  })

  it('searches case-insensitively and preserves the query in category links', async () => {
    render(await CatalogPage({ searchParams: Promise.resolve({ q: 'UMROH' }) }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(within(screen.getByRole('article')).getByRole('heading', { level: 3 })).toHaveTextContent('Management Travel Umroh')
    expect(screen.getByRole('searchbox', { name: 'Cari produk' })).toHaveValue('UMROH')
    const filterUrl = new URL(screen.getByRole('link', { name: 'Ritel & UMKM' }).getAttribute('href')!, 'https://example.test')
    expect(filterUrl.searchParams.get('q')).toBe('UMROH')
    expect(filterUrl.searchParams.get('niche')).toBe('Ritel & UMKM')
  })

  it('combines the niche and search query while preserving the niche in the search form', async () => {
    const { container } = render(await CatalogPage({ searchParams: Promise.resolve({ niche: 'Travel & Pariwisata Religi', q: 'jamaah' }) }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(container.querySelector('form input[name="niche"]')).toHaveValue('Travel & Pariwisata Religi')
    expect(screen.getByRole('link', { name: 'Travel & Pariwisata Religi' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('search')).toHaveAttribute('method', 'get')
  })

  it('offers a reset that clears both filters when nothing matches', async () => {
    render(await CatalogPage({ searchParams: Promise.resolve({ niche: 'Ritel & UMKM', q: 'apotek' }) }))
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tidak ada produk yang ditemukan.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reset pencarian' })).toHaveAttribute('href', '/produk')
  })

  it('accepts repeated URL parameters and trims the first search value', async () => {
    render(await CatalogPage({ searchParams: Promise.resolve({ q: ['  QRIS  ', 'unused'] }) }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('searchbox', { name: 'Cari produk' })).toHaveValue('QRIS')
    expect(within(screen.getByRole('article')).getByRole('heading', { level: 3 })).toHaveTextContent('Point of Sale')
  })

  it('renders new catalog products and features from the data source', async () => {
    vi.mocked(catalog.getAllProducts).mockResolvedValueOnce([{
      slug: 'layanan-baru', name: 'Layanan Baru', niche: 'Kategori Baru',
      shortDescription: 'Deskripsi dari katalog.', fullDescription: 'Deskripsi lengkap.',
      features: ['Fitur dari katalog'],
    }])
    render(await CatalogPage())
    expect(screen.getByText('Deskripsi dari katalog.')).toBeInTheDocument()
    expect(screen.getByText('Fitur dari katalog')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Lihat detail Layanan Baru' })).toHaveAttribute('href', '/produk/layanan-baru')
  })

})
