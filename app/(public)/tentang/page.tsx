import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, ArrowRight, Users, Package, Headphones, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DecorIcon } from '@/components/decor-icon'
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
  { icon: Users, value: '65+ Juta', label: 'UMKM di Indonesia' },
  { icon: Package, value: '3 Produk', label: 'Solusi SaaS' },
  { icon: Headphones, value: '24/7', label: 'Dukungan Pelanggan' },
  { icon: Target, value: '100+', label: 'Pelanggan Aktif' },
]

const milestones = [
  { year: '2022', title: 'Pendirian BantuGrow', description: 'Tim kecil dengan misi besar: membantu UMKM Indonesia go digital.' },
  { year: '2023', title: 'Peluncuran Produk Pertama', description: 'Mutaba\'ah Digital diluncurkan untuk pesantren dan lembaga pendidikan.' },
  { year: '2023', title: 'Ekspansi Produk', description: 'Management Travel Umroh dan POS diluncurkan untuk menjangkau lebih banyak niche UMKM.' },
  { year: '2024', title: '100+ Pelanggan', description: 'Milestone pelanggan aktif tercapai dengan pertumbuhan organik.' },
]

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-8 py-12 md:py-16">
      <div className="relative border-y border-border/80 py-12 mb-12 max-w-3xl mx-auto">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8 md:text-4xl">
          {copy.aboutHeadline}
        </h1>

        {/* Mission */}
        <section aria-labelledby="mission-heading" className="mb-10 max-w-2xl">
          <h2 id="mission-heading" className="text-xl font-bold text-foreground mb-3">
            {copy.missionHeadline}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{copy.missionText}</p>
        </section>

        {/* UMKM Focus */}
        <section aria-labelledby="umkm-focus-heading" className="mb-10 max-w-2xl">
          <h2 id="umkm-focus-heading" className="text-xl font-bold text-foreground mb-3">
            {copy.umkmFocusHeadline}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{copy.umkmFocusText}</p>
        </section>

        {/* Contact channels */}
        <section aria-labelledby="contact-channels-heading" className="max-w-2xl">
          <h2 id="contact-channels-heading" className="text-xl font-bold text-foreground mb-4">
            {copy.contactChannelsHeadline}
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  {copy.contactEmailLabel}
                </span>
                <a
                  href={`mailto:${copy.contactEmail}`}
                  className="block text-foreground hover:underline font-semibold text-sm md:text-base"
                  aria-label={`Kirim email ke ${copy.contactEmail}`}
                >
                  {copy.contactEmail}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Stat Cards */}
      <section aria-labelledby="stats-heading" className="mb-12">
        <h2 id="stats-heading" className="sr-only">Statistik BantuGrow</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center rounded-lg border border-border/80 p-6 bg-card"
            >
              <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 mb-3">
                <stat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <span className="text-2xl font-extrabold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section aria-labelledby="team-heading" className="mb-12">
        <div className="text-center mb-8">
          <h2 id="team-heading" className="text-2xl font-extrabold tracking-tight text-foreground mb-2">
            Tim Kami
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Orang-orang di balik BantuGrow yang berdedikasi membantu UMKM Indonesia bertumbuh.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center text-center rounded-lg border border-border/80 p-6 bg-card"
            >
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={`Foto ${member.name}`}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border border-primary/20 mb-4"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">{member.avatar}</span>
                </div>
              )}
              <h3 className="text-sm font-bold text-foreground">{member.name}</h3>
              <p className="text-xs text-primary font-medium mt-0.5 mb-2">{member.role}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section aria-labelledby="timeline-heading" className="mb-12">
        <div className="text-center mb-8">
          <h2 id="timeline-heading" className="text-2xl font-extrabold tracking-tight text-foreground mb-2">
            Perjalanan Kami
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Milestone penting dalam perjalanan BantuGrow membantu UMKM Indonesia.
          </p>
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border/80 -translate-x-1/2" />
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="relative pl-10 md:pl-0 md:grid md:grid-cols-2 md:gap-8"
              >
                <div className="absolute left-4 md:left-1/2 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background -translate-x-1/2" />
                <div className={index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:col-start-2 md:pl-8'}>
                  <span className="text-xs font-bold text-primary">{milestone.year}</span>
                  <h3 className="text-sm font-bold text-foreground mt-1">{milestone.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="relative mx-auto flex w-full max-w-2xl flex-col justify-between gap-y-5 border-y border-border/80 px-6 py-8 dark:bg-[radial-gradient(35%_80%_at_25%_0%,--theme(--color-foreground/.08),transparent)]">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        <h2 className="text-center font-extrabold text-xl text-foreground">
          Ingin Tahu Lebih Lanjut?
        </h2>
        <p className="text-center text-muted-foreground text-sm max-w-md mx-auto">
          Hubungi kami sekarang atau jelajahi produk-produk BantuGrow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            render={<Link href="/kontak" />}
            nativeButton={false}
          >
            Hubungi Kami
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            render={<Link href="/produk" />}
            nativeButton={false}
          >
            Lihat Produk
          </Button>
        </div>
      </div>
    </div>
  )
}
