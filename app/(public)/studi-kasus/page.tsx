import { PageContainer, PublicHero } from '@/components/public-page'
import { CallToAction } from '@/components/cta'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { caseStudiesMetadata } from '@/lib/seo'
import { caseStudies } from '@/content/case-studies'

export const metadata: Metadata = caseStudiesMetadata()

export default function CaseStudiesPage() {
  return (
    <>
      <PublicHero
        eyebrow="Studi Kasus"
        title="Dari tantangan harian."
        accent="Menuju usaha yang lebih tertata."
        description="Pelajari bagaimana pelanggan BantuGrow menggunakan teknologi untuk merapikan operasional, dari toko ritel hingga komunitas."
      />
      <PageContainer className="py-12 lg:py-20">
        <h2 className="mb-10 text-balance text-3xl font-medium lg:text-4xl">
          Cerita di balik perubahan
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((study) => (
            <Link
              key={study.slug}
              href={`/studi-kasus/${study.slug}`}
              className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border outline-none hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex flex-col gap-4 bg-secondary p-6 lg:p-8">
                <p className="text-sm font-semibold text-primary">
                  {study.niche}
                </p>
                <h3 className="text-balance text-3xl leading-snug font-medium">
                  {study.title}
                </h3>
              </div>
              <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
                <p className="text-pretty text-base leading-8 text-muted-foreground">
                  {study.challenge}
                </p>
                <span className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm font-semibold">
                  Baca Selengkapnya{' '}
                  <ArrowRight
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
      <CallToAction variant="catalog" />
    </>
  )
}
