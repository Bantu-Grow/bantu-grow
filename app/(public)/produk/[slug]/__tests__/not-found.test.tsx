import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductNotFound from '../not-found'
import GlobalNotFound from '@/app/not-found'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))



describe('ProductNotFound', () => {
  it('renders the not-found headline', () => {
    render(<ProductNotFound />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the catalog link together with the message', () => {
    render(<ProductNotFound />)
    const link = screen.getByRole('link', { name: /lihat produk kami/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/produk')
    // Both the message and link should be present
    expect(screen.getByText(/produk yang anda cari tidak ditemukan/i)).toBeInTheDocument()
  })
})

describe('GlobalNotFound', () => {
  it('renders not-found heading and catalog link together', () => {
    render(<GlobalNotFound />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    const catalogLink = screen.getByRole('link', { name: /lihat produk kami/i })
    expect(catalogLink).toBeInTheDocument()
    expect(catalogLink).toHaveAttribute('href', '/produk')
  })

  it('also renders a link back to home', () => {
    render(<GlobalNotFound />)
    const homeLink = screen.getByRole('link', { name: /kembali ke beranda/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })
})
