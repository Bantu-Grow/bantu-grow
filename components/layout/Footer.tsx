import { GithubIcon } from '@/components/icons/github-icon'
import { InstagramIcon } from '@/components/icons/instagram-icon'
import { Logo } from '@/components/logo'
import { NewsletterForm } from '@/components/newsletter-form'
import { copy } from '@/content/copy'
import {
  getActiveSocialLinks,
  socialLinks,
  type SocialLink,
} from '@/content/social-links'
import Link from 'next/link'
import { Mail } from 'lucide-react'

const socialIconMap: Record<SocialLink['platform'], React.ReactNode> = {
  instagram: <InstagramIcon className="size-5" aria-hidden="true" />,
  github: <GithubIcon className="size-5" aria-hidden="true" />,
}

export function Footer() {
  const activeSocialLinks = getActiveSocialLinks()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 pt-16 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-[1.4fr_.8fr_.9fr_1.1fr]">
          <div className="col-span-2 flex flex-col items-start gap-5 sm:col-span-1">
            <p className="max-w-xs text-pretty text-sm leading-7 text-muted-foreground">
              {copy.footerDescription}
            </p>
            <div
              className="-ml-3 flex items-center gap-3"
              aria-label="Media sosial BantuGrow"
            >
              {socialLinks.map((item) => {
                const active = activeSocialLinks.find(
                  (link) => link.platform === item.platform
                )
                return active ? (
                  <a
                    key={item.platform}
                    href={active.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex size-11 items-center justify-center rounded-full outline-none transition-colors duration-150 hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    {socialIconMap[item.platform]}
                  </a>
                ) : (
                  <span
                    key={item.platform}
                    role="img"
                    aria-label={`${item.label} — tautan belum tersedia`}
                    title={`${item.label} — tautan belum tersedia`}
                    className="flex size-11 items-center justify-center text-muted-foreground"
                  >
                    {socialIconMap[item.platform]}
                  </span>
                )
              })}
            </div>
          </div>
          <div>
            <h2 className="font-sans text-sm font-semibold">Navigasi</h2>
            <nav
              aria-label="Footer navigasi"
              className="mt-4 flex flex-col items-start gap-3"
            >
              {navLinks.map(({ href, title }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-sm text-sm leading-relaxed text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {title}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h2 className="font-sans text-sm font-semibold">Legal</h2>
            <nav
              aria-label="Footer legal"
              className="mt-4 flex flex-col items-start gap-3"
            >
              {legalLinks.map(({ href, title }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-sm text-sm leading-relaxed text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h2 className="font-sans text-sm font-semibold">Kontak</h2>
            <div className="mt-4 flex flex-col items-start gap-4">
              <a
                href={`mailto:${copy.contactEmail}`}
                className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {copy.contactEmail}
              </a>
              <a
                href={`https://wa.me/${copy.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {copy.whatsappCta}
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 border-y py-8 lg:flex-row lg:items-center lg:gap-10">
          <div className="space-y-2">
            <h2 className="font-sans text-lg font-semibold">
              Bawa ide baru untuk usaha Anda
            </h2>
            <p className="text-pretty text-sm leading-7 text-muted-foreground">
              Dapatkan tips mengelola usaha dan kabar produk BantuGrow langsung
              lewat email.
            </p>
          </div>
          <div className="w-full shrink-0 lg:max-w-md">
            <NewsletterForm />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 text-xs leading-relaxed text-muted-foreground sm:flex-row">
          <p>© {year} BantuGrow. Semua hak dilindungi.</p>
          <p>Lebih tertata hari ini. Lebih siap bertumbuh esok.</p>
        </div>
        <div className="relative isolate flex flex-col items-center gap-6 overflow-hidden border-t px-2 pt-12 pb-12 sm:px-8 sm:pt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-10 -bottom-10 -z-10 h-60 w-2/3 rounded-full bg-accent blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-10 -z-10 h-55 w-2/3 rounded-full bg-primary opacity-35 blur-[80px]"
          />
          <Logo variant="footer" className="relative" />
          <p className="relative text-center text-sm leading-7 text-muted-foreground">
            Bantu usaha Anda tumbuh, mulai dari yang paling dibutuhkan.
          </p>
        </div>
      </div>
    </footer>
  )
}

const navLinks = [
  { title: copy.navHome, href: '/' },
  { title: copy.navProducts, href: '/produk' },
  { title: copy.navBlog, href: '/blog' },
  { title: copy.navAbout, href: '/tentang' },
  { title: copy.navContact, href: '/kontak' },
  { title: 'Studi Kasus', href: '/studi-kasus' },
  { title: 'Karier', href: '/karier' },
  { title: 'FAQ', href: '/faq' },
]

const legalLinks = [
  { title: 'Kebijakan Privasi', href: '/privasi' },
  { title: 'Syarat & Ketentuan', href: '/ketentuan' },
]
