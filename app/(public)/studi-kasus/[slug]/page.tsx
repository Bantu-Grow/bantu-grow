import { PageContainer, PublicHero } from '@/components/public-page'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { caseStudyMetadata } from '@/lib/seo'
import { caseStudies } from '@/content/case-studies'

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params
  const study = caseStudies.find((s) => s.slug === slug)
  if (!study) return {}
  return caseStudyMetadata(study)
}

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }))
}

export default async function CaseStudyDetailPage({
  params,
}: CaseStudyPageProps) {
  const { slug } = await params
  const study = caseStudies.find((s) => s.slug === slug)

  if (!study) {
    notFound()
  }

  return (
    <article>
      <PublicHero
        title={study.title}
        eyebrow={study.niche}
        glow={false}
        description={<>Klien: {study.client}</>}
        beforeTitle={
          <Link
            href="/studi-kasus"
            className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Kembali ke Studi Kasus
          </Link>
        }
      />
      <PageContainer className="grid gap-10 py-12 md:grid-cols-2 lg:gap-16 lg:py-20">
        {[
          { title: 'Tantangan', text: study.challenge },
          { title: 'Solusi', text: study.solution },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="mb-5 text-3xl font-medium lg:text-4xl">
              {section.title}
            </h2>
            <p className="text-pretty text-base leading-8 text-muted-foreground">
              {section.text}
            </p>
          </section>
        ))}
      </PageContainer>
      <section className="bg-secondary" aria-labelledby="story-results-heading">
        <PageContainer className="py-12 lg:py-20">
          <h2
            id="story-results-heading"
            className="mb-10 text-3xl font-medium lg:text-4xl"
          >
            Hasil di {study.client}
          </h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {study.results.map((result) => (
              <li
                key={result}
                className="flex items-start gap-4 rounded-2xl bg-background p-6 lg:p-8"
              >
                <CheckCircle
                  className="mt-1 size-6 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="text-xl leading-8 font-medium">{result}</span>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>
      <PageContainer className="py-12 lg:py-20">
        <figure className="mx-auto max-w-4xl space-y-7">
          <blockquote className="font-heading text-pretty text-2xl leading-relaxed font-medium lg:text-3xl">
            “{study.testimonial.quote}”
          </blockquote>
          <figcaption className="space-y-2">
            <p className="text-base font-semibold">{study.testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {study.testimonial.role}
            </p>
          </figcaption>
        </figure>
      </PageContainer>
    </article>
  )
}
