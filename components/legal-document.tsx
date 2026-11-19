import type { ReactNode } from 'react'
import { PageContainer, PublicHero } from '@/components/public-page'

export function LegalDocument({
  title,
  eyebrow = 'Informasi Legal',
  description,
  sections,
  children,
}: {
  title: string
  eyebrow?: string
  description: ReactNode
  sections: string[]
  children: ReactNode
}) {
  return (
    <article>
      <PublicHero
        title={title}
        eyebrow={eyebrow}
        description={description}
        glow={false}
      />
      <PageContainer className="grid items-start gap-8 py-12 lg:grid-cols-4 lg:gap-16 lg:py-20">
        <nav
          aria-label="Daftar isi dokumen"
          className="space-y-4 rounded-2xl bg-secondary p-6 lg:sticky lg:top-28"
        >
          <h2 className="font-sans text-sm font-semibold">Dalam halaman ini</h2>
          <ol className="space-y-3">
            {sections.map((section, index) => (
              <li key={section}>
                <a
                  href={`#section-${index + 1}`}
                  className="block rounded-sm text-sm leading-7 text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {section}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="prose max-w-3xl min-w-0 text-pretty leading-8 text-muted-foreground prose-headings:scroll-mt-28 prose-headings:font-medium prose-headings:text-foreground prose-h2:text-3xl prose-a:rounded-sm prose-a:text-foreground prose-a:underline prose-a:focus-visible:ring-2 prose-a:focus-visible:ring-ring lg:col-span-3">
          {children}
        </div>
      </PageContainer>
    </article>
  )
}
