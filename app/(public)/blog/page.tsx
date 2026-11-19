import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { BlogCard } from '@/components/blogs-section'
import {
  PageContainer,
  PublicHero,
  StatusMessage,
} from '@/components/public-page'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
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

export default async function BlogArchivePage({
  searchParams,
}: PageProps = {}) {
  const params = searchParams ? await searchParams : {}
  const selectedCategory = params.category || ''
  const searchQuery = params.q || ''
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)

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
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  )
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * POSTS_PER_PAGE
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  )

  // Build URL helper
  function buildUrl(overrides: {
    category?: string
    page?: string
    q?: string
  }) {
    const p = new URLSearchParams()
    const cat =
      overrides.category !== undefined ? overrides.category : selectedCategory
    const pg = overrides.page !== undefined ? overrides.page : String(safePage)
    const query = overrides.q !== undefined ? overrides.q : searchQuery
    if (cat) p.set('category', cat)
    if (query) p.set('q', query)
    if (pg && pg !== '1') p.set('page', pg)
    const qs = p.toString()
    return `/blog${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <PublicHero
        eyebrow="Blog BantuGrow"
        title="Ide praktis hari ini."
        accent="Langkah maju untuk usaha Anda."
        description={copy.blogDescription}
      >
        <form
          action="/blog"
          method="get"
          role="search"
          className="mt-8 flex w-full max-w-3xl items-center gap-2 rounded-full border bg-background p-2 pl-4 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 sm:gap-4 sm:pl-6"
        >
          {selectedCategory && (
            <input type="hidden" name="category" value={selectedCategory} />
          )}
          <Search
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            key={searchQuery}
            type="search"
            name="q"
            id="blog-search"
            defaultValue={searchQuery}
            aria-label="Cari artikel"
            placeholder="Cari artikel atau topik..."
            className="h-12 flex-1 rounded-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            variant="brand"
            size="pill-sm"
            className="px-4 sm:px-6"
          >
            Cari artikel{' '}
            <ArrowRight className="hidden size-4 sm:block" aria-hidden="true" />
          </Button>
        </form>
      </PublicHero>
      <PageContainer className="py-12 lg:py-20">
        <div className="mb-10 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="min-w-0 text-balance text-3xl leading-tight font-medium break-words lg:text-4xl">
              {searchQuery
                ? `Hasil pencarian “${searchQuery}”`
                : 'Baca sesuai kebutuhan Anda'}
            </h2>
            <p role="status" className="shrink-0 text-sm text-muted-foreground">
              {filteredPosts.length} artikel{' '}
              {searchQuery || selectedCategory ? 'ditemukan' : 'tersedia'}
            </p>
          </div>
          <nav aria-label="Kategori artikel" className="flex flex-wrap gap-3">
            {['', ...categories].map((category) => (
              <Link
                key={category}
                href={buildUrl({ category, page: '1' })}
                aria-current={
                  selectedCategory === category ? 'page' : undefined
                }
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-5 py-3 text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
                  selectedCategory === category
                    ? 'border-primary bg-primary text-foreground'
                    : 'hover:border-primary'
                )}
              >
                {category || 'Semua'}
              </Link>
            ))}
          </nav>
        </div>
        {paginatedPosts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPosts.map((post) => (
              <BlogCard
                key={post.slug}
                variant="editorial"
                headingLevel={3}
                title={post.title}
                date={formatDate(post.date)}
                category={post.category}
                author={post.author}
                description={post.excerpt}
                coverImage={post.coverImage}
                href={`/blog/${post.slug}`}
              />
            ))}
          </div>
        ) : (
          <StatusMessage
            title="Tidak ada artikel yang ditemukan"
            icon={Search}
            className="border-0 bg-secondary py-16"
            action={
              <Link
                href="/blog"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'pill-sm' })
                )}
              >
                Reset pencarian
              </Link>
            }
          >
            Coba kata kunci lain atau hapus filter untuk melihat semua artikel.
          </StatusMessage>
        )}
        {totalPages > 1 && (
          <nav
            aria-label="Navigasi halaman"
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            {safePage > 1 ? (
              <Link
                href={buildUrl({ page: String(safePage - 1) })}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'pill-sm' })
                )}
              >
                Sebelumnya
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="rounded-full border px-5 py-3 text-sm text-muted-foreground opacity-50"
              >
                Sebelumnya
              </span>
            )}
            <p className="text-sm text-muted-foreground">
              Halaman {safePage} dari {totalPages}
            </p>
            {safePage < totalPages ? (
              <Link
                href={buildUrl({ page: String(safePage + 1) })}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'pill-sm' })
                )}
              >
                Berikutnya
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="rounded-full border px-5 py-3 text-sm text-muted-foreground opacity-50"
              >
                Berikutnya
              </span>
            )}
          </nav>
        )}
      </PageContainer>
      <CallToAction variant="catalog" />
    </>
  )
}
