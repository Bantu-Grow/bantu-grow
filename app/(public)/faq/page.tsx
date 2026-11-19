import { PageContainer, PublicHero } from '@/components/public-page'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { faqMetadata } from '@/lib/seo'
import { faqItems } from '@/content/faq'

export const metadata: Metadata = faqMetadata()

export default function FaqPage() {
  return (
    <>
      <PublicHero
        eyebrow="Pusat Bantuan"
        title="Cari jawabannya di sini."
        accent="Mulai dengan lebih yakin."
        description="Temukan jawaban untuk pertanyaan umum seputar produk dan layanan BantuGrow."
      />
      <PageContainer className="py-12 lg:py-20">
        <section
          aria-label="Pertanyaan yang Sering Diajukan"
          className="mx-auto max-w-4xl"
        >
          {faqItems.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group border-b py-7"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 rounded-sm text-left font-sans text-lg leading-8 font-semibold outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl text-primary group-open:hidden"
                >
                  +
                </span>
                <span
                  aria-hidden="true"
                  className="hidden shrink-0 text-xl text-primary group-open:block"
                >
                  −
                </span>
              </summary>
              <p className="mt-4 max-w-3xl pr-8 text-pretty text-base leading-8 text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </section>
      </PageContainer>
      <PageContainer className="pb-12 lg:pb-20">
        <section className="flex flex-col gap-6 rounded-3xl bg-secondary p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h2 className="text-balance text-3xl font-medium">
              Belum menemukan jawaban?
            </h2>
            <p className="text-base leading-8 text-muted-foreground">
              Ceritakan pertanyaan Anda kepada tim BantuGrow.
            </p>
          </div>
          <Button
            variant="brand"
            size="pill-sm"
            render={<Link href="/kontak" />}
            nativeButton={false}
          >
            Hubungi Kami <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </section>
      </PageContainer>
    </>
  )
}
