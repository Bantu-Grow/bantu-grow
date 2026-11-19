import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import { CallToAction } from '@/components/cta'
import { PageContainer } from '@/components/public-page'
import { BlogCard } from '@/components/blogs-section'
import { cn } from '@/lib/utils'
import { getAllBlogs, getBlogBySlug } from '@/lib/blog'
import { blogPostMetadata } from '@/lib/seo'
import { copy } from '@/content/copy'
import { formatDate } from '@/lib/format-date'
import { getBlogHtml } from '@/lib/markdown'
import { ShareButtons } from '@/components/share-buttons'

interface PageProps {
  params: Promise<{ slug: string }>
}

function getReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function extractHeadings(
  html: string
): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi
  const headings: { id: string; text: string; level: number }[] = []
  let match

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const text = match[2].replace(/<[^>]*>/g, '') // strip inner HTML tags
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
    headings.push({ id, text, level })
  }

  return headings
}

function addHeadingIds(html: string): string {
  const usedIds = new Map<string, number>()

  return html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h([2-3])>/gi,
    (_match, level, attrs, content) => {
      const text = content.replace(/<[^>]*>/g, '')
      const baseId = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')

      // Headings with identical text would otherwise produce duplicate ids
      const seen = usedIds.get(baseId) ?? 0
      usedIds.set(baseId, seen + 1)
      const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`

      return `<h${level}${attrs} id="${id}">${content}</h${level}>`
    }
  )
}

export async function generateStaticParams() {
  const blogs = await getAllBlogs()
  return blogs.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogBySlug(slug)
  if (!post) {
    return { title: 'Artikel Tidak Ditemukan — BantuGrow' }
  }
  return blogPostMetadata(post)
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBlogBySlug(slug)

  if (!post) {
    notFound()
  }

  const rawHtml = getBlogHtml(post)
  const htmlContent = addHeadingIds(rawHtml)
  const headings = extractHeadings(htmlContent)

  // Calculate reading time from raw text content
  const textContent = post.contentMarkdown || post.content.join(' ')
  const readingTime = getReadingTime(textContent)

  // Related articles: same category, excluding current, max 3
  const allBlogs = await getAllBlogs()
  const relatedPosts = allBlogs
    .filter((b) => b.category === post.category && b.slug !== post.slug)
    .slice(0, 3)

  const shareUrl = `/blog/${slug}`

  return (
    <>
      <article>
        <header className="bg-secondary">
          <PageContainer className="py-12 lg:py-20">
            <nav
              aria-label="Breadcrumb"
              className="mb-8 text-sm text-muted-foreground"
            >
              <ol className="flex flex-wrap gap-3">
                <li>
                  <Link
                    href="/blog"
                    className="rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="min-w-0 break-words">
                  {post.title}
                </li>
              </ol>
            </nav>
            <Link
              href="/blog"
              className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {copy.blogBackToList}
            </Link>
            <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">
                {post.category}
              </span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4" aria-hidden="true" />
                {readingTime} menit membaca
              </span>
            </div>
            <h1 className="max-w-5xl text-balance text-4xl leading-tight font-medium sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 text-sm text-muted-foreground">
              Oleh{' '}
              <span className="font-semibold text-foreground">
                {post.author}
              </span>
            </p>
          </PageContainer>
        </header>
        <PageContainer className="grid items-start gap-8 py-12 lg:grid-cols-4 lg:gap-16 lg:py-20">
          <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="space-y-4">
              <h2 className="font-sans text-sm font-semibold">
                Bagikan artikel
              </h2>
              <ShareButtons title={post.title} url={shareUrl} />
            </div>
            {headings.length >= 3 && (
              <nav
                aria-label="Daftar Isi"
                className="rounded-2xl border bg-secondary p-6"
              >
                <h2 className="mb-4 font-sans text-sm font-semibold">
                  Daftar Isi
                </h2>
                <ol className="space-y-3">
                  {headings.map((h) => (
                    <li
                      key={h.id}
                      className={cn(
                        'text-sm leading-6 text-muted-foreground',
                        h.level === 3 && 'ml-4'
                      )}
                    >
                      <a
                        href={`#${h.id}`}
                        className="rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </aside>
          <div className="min-w-0 lg:col-span-3">
            {post.coverImage && (
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1000}
                height={563}
                className="mb-8 h-auto w-full rounded-3xl object-cover"
                preload
              />
            )}
            <div
              className="prose prose-lg max-w-3xl text-pretty leading-9 text-muted-foreground prose-headings:scroll-mt-28 prose-headings:font-medium prose-headings:text-foreground prose-a:rounded-sm prose-a:text-foreground prose-a:underline prose-a:focus-visible:ring-2 prose-a:focus-visible:ring-ring [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </PageContainer>
      </article>
      {relatedPosts.length > 0 && (
        <PageContainer className="pb-12 lg:pb-20">
          <section aria-labelledby="related-articles-heading">
            <h2
              id="related-articles-heading"
              className="mb-10 text-3xl font-medium lg:text-4xl"
            >
              Artikel Terkait
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <BlogCard
                  key={related.slug}
                  variant="editorial"
                  title={related.title}
                  date={formatDate(related.date)}
                  description={related.excerpt}
                  category={related.category}
                  author={related.author}
                  href={`/blog/${related.slug}`}
                  coverImage={related.coverImage}
                />
              ))}
            </div>
          </section>
        </PageContainer>
      )}
      <CallToAction variant="catalog" />
    </>
  )
}
