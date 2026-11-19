import type { Metadata } from 'next'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { CallToAction } from '@/components/cta'
import { PublicHero, PageContainer } from '@/components/public-page'
import { aboutMetadata } from '@/lib/seo'
import { copy } from '@/content/copy'

export const metadata: Metadata = aboutMetadata()

const teamMembers = [
  {
    name: 'Rayhan Adib Masrukhan',
    role: 'Founder',
    avatar: 'RA',
    description: 'Memimpin visi, arah produk, dan pertumbuhan BantuGrow.',
    photo: '/images/team/rayhan-adib-masrukhan.jpg',
  },
  {
    name: 'Agus Setiawan',
    role: 'Co-Founder',
    avatar: 'AS',
    description: 'Mendukung pengembangan produk dan operasional BantuGrow.',
    photo: '/images/team/agus-setiawan.jpg',
  },
]

const stats = [
  { value: '65+ Juta', label: 'UMKM di Indonesia' },
  { value: '3 Produk', label: 'Solusi SaaS' },
  { value: '24/7', label: 'Dukungan Pelanggan' },
  { value: '100+', label: 'Pelanggan Aktif' },
]

const milestones = [
  {
    year: '2022',
    title: 'Pendirian BantuGrow',
    description:
      'Tim kecil dengan misi besar: membantu UMKM Indonesia go digital.',
  },
  {
    year: '2023',
    title: 'Peluncuran Produk Pertama',
    description:
      "Mutaba'ah Digital diluncurkan untuk pesantren dan lembaga pendidikan.",
  },
  {
    year: '2023',
    title: 'Ekspansi Produk',
    description:
      'Management Travel Umroh dan POS diluncurkan untuk menjangkau lebih banyak niche UMKM.',
  },
  {
    year: '2024',
    title: '100+ Pelanggan',
    description:
      'Milestone pelanggan aktif tercapai dengan pertumbuhan organik.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PublicHero
        eyebrow="Tentang BantuGrow"
        title="Teknologi yang dekat."
        accent="Usaha yang terus bertumbuh."
        description="Kami membantu UMKM Indonesia mengurangi kerja manual dengan solusi digital yang relevan untuk pekerjaan sehari-hari."
      />
      <PageContainer className="grid gap-10 py-12 lg:grid-cols-5 lg:gap-16 lg:py-20">
        <div className="space-y-5 lg:col-span-2">
          <p className="text-sm font-semibold text-primary">
            ALASAN KAMI HADIR
          </p>
          <h2 className="text-balance text-3xl leading-tight font-medium lg:text-4xl">
            Usaha kecil berhak punya alat yang tepat
          </h2>
          <a
            href={`mailto:${copy.contactEmail}`}
            className="inline-flex min-h-11 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail className="size-5 text-primary" aria-hidden="true" />
            {copy.contactEmail}
          </a>
        </div>
        <div className="space-y-8 lg:col-span-3">
          <section aria-labelledby="mission-heading">
            <h2 id="mission-heading" className="mb-4 text-2xl font-medium">
              {copy.missionHeadline}
            </h2>
            <p className="text-pretty text-base leading-8 text-muted-foreground">
              {copy.missionText}
            </p>
          </section>
          <section aria-labelledby="umkm-focus-heading">
            <h2 id="umkm-focus-heading" className="mb-4 text-2xl font-medium">
              {copy.umkmFocusHeadline}
            </h2>
            <p className="text-pretty text-base leading-8 text-muted-foreground">
              {copy.umkmFocusText}
            </p>
          </section>
        </div>
      </PageContainer>
      <PageContainer className="pb-12 lg:pb-20">
        <section
          aria-label="Statistik BantuGrow"
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-3 border-l pl-5 lg:pl-8">
              <p className="font-heading text-3xl font-medium tabular-nums lg:text-5xl">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>
      </PageContainer>
      <section className="bg-secondary" aria-labelledby="team-heading">
        <PageContainer className="py-12 lg:py-20">
          <div className="mb-10 space-y-4">
            <h2
              id="team-heading"
              className="text-balance text-3xl font-medium lg:text-4xl"
            >
              Orang di balik BantuGrow
            </h2>
            <p className="text-base leading-8 text-muted-foreground">
              Tim yang membangun produk dan mendampingi UMKM Indonesia
              bertumbuh.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="flex flex-col items-start gap-6 rounded-3xl border p-6 lg:flex-row lg:items-center lg:p-8"
              >
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={`Foto ${member.name}`}
                    width={96}
                    height={96}
                    className="size-24 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-accent text-3xl font-semibold">
                    {member.avatar}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-sans text-xl font-semibold">
                    {member.name}
                  </h3>
                  <p className="text-sm font-semibold text-primary">
                    {member.role}
                  </p>
                  <p className="text-pretty text-sm leading-7 text-muted-foreground">
                    {member.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>
      <PageContainer className="py-12 lg:py-20">
        <section aria-labelledby="timeline-heading">
          <h2
            id="timeline-heading"
            className="mb-10 text-3xl font-medium lg:text-4xl"
          >
            Perjalanan kami
          </h2>
          <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {milestones.map((milestone, index) => (
              <li key={index} className="space-y-4 border-t pt-6">
                <p className="font-heading text-3xl font-medium text-primary tabular-nums">
                  {milestone.year}
                </p>
                <h3 className="font-sans text-lg font-semibold">
                  {milestone.title}
                </h3>
                <p className="text-pretty text-sm leading-7 text-muted-foreground">
                  {milestone.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </PageContainer>
      <CallToAction variant="catalog" />
    </>
  )
}
