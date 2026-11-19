'use client'

import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { useScroll } from '@/hooks/use-scroll'
import { buttonVariants } from '@/components/ui/button'
import { MobileNav } from '@/components/mobile-nav'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { copy } from '@/content/copy'

export const navLinks = [
  { href: '/', label: copy.navHome },
  { href: '/produk', label: copy.navProducts },
  { href: '/blog', label: copy.navBlog },
  { href: '/tentang', label: copy.navAbout },
  { href: '/kontak', label: copy.navContact },
]

export function Header() {
  const scrolled = useScroll(10)
  const pathname = usePathname()

  return (
    <header className={cn('sticky top-0 z-50 w-full border-b border-transparent bg-background', scrolled && 'border-border shadow-sm')}>
      <nav aria-label="Navigasi utama" className="mx-auto flex h-22 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <Link className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/">
          <Logo />
        </Link>
        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className="rounded-sm py-3 text-sm font-medium outline-none transition-colors duration-150 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">
              {link.label}
            </Link>
          ))}
          <Link href="/demo" className={cn(buttonVariants({ variant: 'brand', size: 'pill-sm' }))}>Minta Demo Gratis</Link>
        </div>
        <MobileNav />
      </nav>
    </header>
  )
}
