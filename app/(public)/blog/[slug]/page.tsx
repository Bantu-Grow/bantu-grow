import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Share2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { CallToAction } from '@/components/cta'
import { DecorIcon } from '@/components/decor-icon'
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

function extractHeadings(html: string): { id: string; text: string; level: number }[] {
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

  return html.replace(/<h([2-3])([^>]*)>(.*?)<\/h([2-3])>/gi, (_match, level, attrs, content) => {
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
  })
}

export async function generateStaticParams() {
  const blogs = await getAllBlogs()
  return blogs.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
    <div className="mx-auto w-full max-w-4xl px-4 md:px-8 py-12 md:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex items-center">
          <li>
            <Link href="/blog" className="hover:underline hover:text-foreground transition-colors">
              Blog
            </Link>
          </li>
          <li className="before:mx-2 before:content-['/'] flex items-center">
            <span
              aria-current="page"
              className="text-foreground font-medium line-clamp-1 inline-block max-w-[250px] md:max-w-[400px] align-bottom"
            >
              {post.title}
            </span>
          </li>
        </ol>
      </nav>

      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/blog"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "inline-flex items-center gap-1.5")}
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.blogBackToList}
        </Link>
      </div>

      <article className="relative border-y border-border/80 py-12 mb-16 bg-card/10 rounded-lg">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden border border-border/40">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* Category, Date & Reading Time */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {post.category}
          </span>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-muted-foreground text-xs">{formatDate(post.date)}</span>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-muted-foreground text-xs inline-flex items-center gap-1">
            <Clock className="size-3" aria-hidden="true" />
            {readingTime} menit membaca
          </span>
        </div>

        {/* Article title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-6 md:text-4xl leading-tight">
          {post.title}
        </h1>

        {/* Author info */}
        <div className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <span>Oleh</span>
          <span className="font-semibold text-foreground">{post.author}</span>
        </div>

        {/* Share buttons */}
        <div className="mb-10 flex items-center gap-3">
          <Share2 className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs font-medium text-muted-foreground">Bagikan:</span>
          <ShareButtons title={post.title} url={shareUrl} />
        </div>

        {/* Table of Contents */}
        {headings.length >= 3 && (
          <nav
            aria-label="Daftar Isi"
            className="mb-10 rounded-lg border border-border/60 bg-muted/20 p-4"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3">Daftar Isi</h2>
            <ol className="space-y-1.5">
              {headings.map((h) => (
                <li
                  key={h.id}
                  className={cn(
                    "text-sm text-muted-foreground hover:text-foreground transition-colors",
                    h.level === 3 && "ml-4"
                  )}
                >
                  <a href={`#${h.id}`} className="hover:underline">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Body content - rendered markdown */}
        <div
          className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Artikel Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group border border-border/80 rounded-lg p-5 hover:bg-muted/10 transition-colors"
              >
                {related.coverImage && (
                  <div className="mb-3 rounded overflow-hidden">
                    <Image
                      src={related.coverImage}
                      alt={related.title}
                      width={400}
                      height={200}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {related.category}
                </span>
                <h3 className="text-sm font-bold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {related.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {related.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA section */}
      <section className="relative">
        <CallToAction />
      </section>
    </div>
  )
}
