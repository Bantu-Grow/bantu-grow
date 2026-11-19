import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../Header'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Header', () => {
  it('renders the company name as a link to home', () => {
    render(<Header />)
    const logo = screen.getByRole('link', { name: /bantugrow/i })
    expect(logo).toBeInTheDocument()
  })

  it('renders all four desktop nav links', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: /beranda/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /produk/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('link', { name: /tentang/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('link', { name: /kontak/i }).length).toBeGreaterThanOrEqual(1)
  })

  it('shows mobile menu toggle button', () => {
    render(<Header />)
    const toggle = screen.getByRole('button', { name: /buka menu/i })
    expect(toggle).toBeInTheDocument()
  })

  it('expands and collapses the mobile menu on toggle', () => {
    render(<Header />)
    const toggle = screen.getByRole('button', { name: /buka menu/i })

    // Mobile menu initially hidden
    expect(screen.queryByRole('navigation', { name: /navigasi mobile/i })).not.toBeInTheDocument()

    // Open
    fireEvent.click(toggle)
    expect(screen.getByRole('navigation', { name: /navigasi mobile/i })).toBeInTheDocument()

    // Close
    fireEvent.click(screen.getByRole('button', { name: /tutup menu/i }))
    expect(screen.queryByRole('navigation', { name: /navigasi mobile/i })).not.toBeInTheDocument()
  })
})
