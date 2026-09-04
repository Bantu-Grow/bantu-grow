import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { CallToAction } from '@/components/cta'
import { getAllBlogs } from '@/lib/blog'
import { blogListMetadata } from '@/lib/seo'
import { copy } from '@/content/copy'
import { formatDate } from '@/lib/format-date'

export const metadata: Metadata = blogListMetadata()

const POSTS_PER_PAGE = 6

interface PageProps {
  searchParams?: Promise<{ category?: string; page?: string; q?: string }>
}

export default async function BlogArchivePage({ searchParams }: PageProps = {}) {
  const params = searchParams ? await searchParams : {}
  const selectedCategory = params.category || ''
  const searchQuery = params.q || ''
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))

  const allPosts = await getAllBlogs()

  // Get unique categories for filter
  const categories = Array.from(new Set(allPosts.map((p) => p.category))).sort()

  // Filter by category
  let filteredPosts = selectedCategory
    ? allPosts.filter((p) => p.category === selectedCategory)
    : allPosts

  // Filter by search query
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.some((c) => c.toLowerCase().includes(q)) ||
        (p.contentMarkdown && p.contentMarkdown.toLowerCase().includes(q))
    )
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * POSTS_PER_PAGE
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE)

  // Build URL helper
  function buildUrl(overrides: { category?: string; page?: string; q?: string }) {
    const p = new URLSearchParams()
    const cat = overrides.category !== undefined ? overrides.category : selectedCategory
    const pg = overrides.page !== undefined ? overrides.page : String(safePage)
    const query = overrides.q !== undefined ? overrides.q : searchQuery
    if (cat) p.set('category', cat)
    if (query) p.set('q', query)
    if (pg && pg !== '1') p.set('page', pg)
    const qs = p.toString()
    return `/blog${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-8 py-12 md:py-16 flex flex-col gap-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl tracking-wide md:text-4xl">
          {copy.blogHeadline}
        </h1>
        <p className="text-muted-foreground text-sm">
          {copy.blogDescription}
        </p>
      </div>

      {/* Search */}
      <form action="/blog" method="get" role="search" className="flex gap-2">
        {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            id="blog-search"
            defaultValue={searchQuery}
            placeholder="Cari artikel..."
            aria-label="Cari artikel"
            className="block w-full rounded-lg border border-input bg-transparent py-2.5 pl-10 pr-4 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cari
        </button>
      </form>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl({ category: '', page: '1' })}
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !selectedCategory
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          Semua
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={buildUrl({ category: cat, page: '1' })}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Blog posts grid */}
      {paginatedPosts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Tidak ada artikel yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paginatedPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col border border-border/80 rounded-lg overflow-hidden hover:bg-muted/10 transition-colors"
            >
              {/* Cover image */}
              {post.coverImage && (
                <div className="aspect-video overflow-hidden border-b border-border/40">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex flex-col flex-grow p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-muted-foreground text-xs">{formatDate(post.date)}</span>
                </div>
                <h2 className="text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                  <span>Oleh</span>
                  <span className="font-medium text-foreground/80">{post.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Navigasi halaman" className="flex items-center justify-center gap-3">
          {safePage > 1 ? (
            <Link
              href={buildUrl({ page: String(safePage - 1) })}
              className="inline-flex items-center rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Sebelumnya
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex items-center rounded-lg border border-input px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
            >
              Sebelumnya
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Halaman {safePage} dari {totalPages}
          </span>
          {safePage < totalPages ? (
            <Link
              href={buildUrl({ page: String(safePage + 1) })}
              className="inline-flex items-center rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Berikutnya
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex items-center rounded-lg border border-input px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
            >
              Berikutnya
            </span>
          )}
        </nav>
      )}

      {/* CTA section */}
      <section className="relative">
        <CallToAction />
      </section>
    </div>
  )
}
