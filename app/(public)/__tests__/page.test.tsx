import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '../page'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Home page', () => {
  it('renders a single h1 with the hero headline', async () => {
    const jsx = await HomePage()
    render(jsx)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent(/kurangi kerja manual/i)
  })

  it('renders hero description text', async () => {
    const jsx = await HomePage()
    render(jsx)
    expect(screen.getByText(/rapikan transaksi, stok, dan operasional/i)).toBeInTheDocument()
  })

  it('renders a CTA button linking to /kontak', async () => {
    const jsx = await HomePage()
    render(jsx)
    const ctaLinks = screen.getAllByRole('link', { name: /diskusikan kebutuhan/i })
    const hasKontakLink = ctaLinks.some((l) => l.getAttribute('href') === '/kontak')
    expect(hasKontakLink).toBe(true)
  })

  it('renders product highlights from catalog', async () => {
    const jsx = await HomePage()
    render(jsx)
    expect(screen.getByRole('heading', { level: 3, name: /mutaba'ah digital/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /management travel umroh/i })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3, name: /point of sale/i }).length).toBeGreaterThanOrEqual(1)
  })

  it('renders value proposition section', async () => {
    const jsx = await HomePage()
    render(jsx)
    expect(screen.getByText(/usaha tertata. lebih siap tumbuh/i)).toBeInTheDocument()
  })
})
