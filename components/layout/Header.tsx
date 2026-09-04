'use client'

import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { useScroll } from "@/hooks/use-scroll"
import { buttonVariants } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from 'next/link'
import { copy } from '@/content/copy'

export const navLinks = [
	{ href: '/', label: copy.navHome },
	{ href: '/produk', label: copy.navProducts },
	{ href: '/harga', label: copy.navPricing },
	{ href: '/blog', label: copy.navBlog },
	{ href: '/tentang', label: copy.navAbout },
	{ href: '/kontak', label: copy.navContact },
]

export function Header() {
	const scrolled = useScroll(10)

	return (
		<header
			className={cn("sticky top-0 z-50 w-full border-transparent border-b transition-colors duration-200", {
				"border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 md:px-6">
				<Link
					className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50 transition-colors"
					href="/"
				>
					<Logo className="h-5" />
				</Link>
				<div className="hidden items-center gap-2 md:flex">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-sm font-medium")}
						>
							{link.label}
						</Link>
					))}
					<Link
						href="/demo"
						className={cn(buttonVariants({ variant: "default", size: "sm" }), "ml-2")}
					>
						Minta Demo
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<MobileNav />
				</div>
			</nav>
		</header>
	)
}

