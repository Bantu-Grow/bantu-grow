import type { Metadata } from 'next'
import { MapPin, Briefcase, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DecorIcon } from '@/components/decor-icon'
import { careersMetadata } from '@/lib/seo'
import { jobOpenings } from '@/content/careers'

export const metadata: Metadata = careersMetadata()

export default function CareersPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-8 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3 md:text-4xl">
          Karier di BantuGrow
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
          Bergabunglah dengan tim kami dan bantu jutaan UMKM Indonesia bertumbuh melalui teknologi.
        </p>
      </div>

      <div className="relative border-y border-border/80 py-12">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        <div className="space-y-6">
          {jobOpenings.map((job) => (
            <div
              key={job.slug}
              className="rounded-lg border border-border/80 p-6 bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-grow">
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {job.department}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                      {job.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {job.location}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {job.description}
                  </p>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      Persyaratan:
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="shrink-0">
                  <Button
                    render={
                      <a href={`mailto:halo@bantugrow.id?subject=Lamaran: ${job.title}`} />
                    }
                    nativeButton={false}
                    size="sm"
                  >
                    Lamar Sekarang
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground text-sm mb-2">
          Tidak menemukan posisi yang sesuai?
        </p>
        <p className="text-muted-foreground text-sm">
          Kirim CV Anda ke{' '}
          <a href="mailto:halo@bantugrow.id" className="text-primary hover:underline font-medium">
            halo@bantugrow.id
          </a>{' '}
          dan kami akan menghubungi Anda saat ada posisi yang cocok.
        </p>
      </div>
    </div>
  )
}
