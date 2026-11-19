import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BlogPostDetailPage from '../page'

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

// Mock next/navigation for notFound
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

describe('BlogPostDetailPage', () => {
  it('renders a blog post detail correctly', async () => {
    const jsx = await BlogPostDetailPage({
      params: Promise.resolve({ slug: 'cara-mudah-kelola-stok-barang-umkm' }),
    })
    render(jsx)

    // Check title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /cara mudah mengelola stok barang untuk umkm ritel/i
    )

    // Check author
    expect(screen.getByText(/tim retail bantugrow/i)).toBeInTheDocument()

    // Check content paragraph
    expect(
      screen.getByText(/mengelola stok barang sering kali menjadi momok/i)
    ).toBeInTheDocument()

    // Check back link
    const backLink = screen.getByRole('link', { name: /kembali ke blog/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/blog')

    // Check CTA
    expect(
      screen.getByText(/belum tahu harus mulai dari mana\?/i)
    ).toBeInTheDocument()
  })

  it('triggers notFound when slug is invalid', async () => {
    await expect(
      BlogPostDetailPage({
        params: Promise.resolve({ slug: 'invalid-slug-does-not-exist' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
