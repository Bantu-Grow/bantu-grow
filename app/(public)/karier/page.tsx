import { PageContainer, PublicHero } from '@/components/public-page'
import { copy } from '@/content/copy'
import { Check } from 'lucide-react'
import type { Metadata } from 'next'
import { MapPin, Briefcase, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { careersMetadata } from '@/lib/seo'
import { jobOpenings } from '@/content/careers'

export const metadata: Metadata = careersMetadata()

export default function CareersPage() {
  return (
    <>
      <PublicHero
        eyebrow="Karier BantuGrow"
        title="Bangun teknologi berguna."
        accent="Tumbuh bersama tim kami."
        description="Bergabunglah untuk membantu UMKM Indonesia bekerja lebih tertata melalui produk yang mudah digunakan."
      />
      <PageContainer className="py-12 lg:py-20">
        <section aria-labelledby="careers-heading">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2
              id="careers-heading"
              className="text-3xl font-medium lg:text-4xl"
            >
              Temukan peran Anda
            </h2>
            <p className="text-sm text-muted-foreground">
              {jobOpenings.length} posisi tersedia
            </p>
          </div>
          <div className="space-y-6">
            {jobOpenings.map((job) => (
              <article
                key={job.slug}
                className="space-y-6 rounded-3xl border p-6 sm:p-10"
              >
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
                  <div className="space-y-4">
                    <h3 className="text-balance text-3xl font-medium">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2 font-semibold text-primary">
                        <Building2 className="size-4" aria-hidden="true" />
                        {job.department}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Briefcase className="size-4" aria-hidden="true" />
                        {job.type}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4" aria-hidden="true" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="brand"
                    size="pill-sm"
                    render={
                      <a
                        href={`mailto:${copy.contactEmail}?subject=${encodeURIComponent(`Lamaran: ${job.title}`)}`}
                      />
                    }
                    nativeButton={false}
                  >
                    Lamar Sekarang
                  </Button>
                </div>
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                  <p className="text-pretty text-base leading-8 text-muted-foreground">
                    {job.description}
                  </p>
                  <div className="space-y-3">
                    <h4 className="font-sans text-sm font-semibold">
                      Persyaratan
                    </h4>
                    <ul className="space-y-3">
                      {job.requirements.map((req) => (
                        <li key={req} className="flex gap-3">
                          <Check
                            className="mt-1 size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span className="text-sm leading-7 text-muted-foreground">
                            {req}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </PageContainer>
      <PageContainer className="pb-12 lg:pb-20">
        <section className="space-y-4 rounded-3xl bg-secondary p-7 sm:p-10">
          <h2 className="text-3xl font-medium">
            Belum ada posisi yang sesuai?
          </h2>
          <p className="text-base leading-8 text-muted-foreground">
            Kirim CV Anda ke {copy.contactEmail}. Kami akan menghubungi Anda
            saat ada posisi yang cocok.
          </p>
          <a
            href={`mailto:${copy.contactEmail}`}
            className="inline-flex min-h-11 items-center rounded-sm text-sm font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Kirim CV via email →
          </a>
        </section>
      </PageContainer>
    </>
  )
}
