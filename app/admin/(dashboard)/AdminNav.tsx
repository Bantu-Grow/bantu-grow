'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, BookOpen, MessageSquare, Calendar } from 'lucide-react'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produk', icon: ShoppingBag },
  { href: '/admin/blogs', label: 'Blog', icon: BookOpen },
  { href: '/admin/leads', label: 'Pesan Masuk', icon: MessageSquare },
  { href: '/admin/demo-requests', label: 'Permintaan Demo', icon: Calendar },
]

/**
 * Sidebar navigation with an active-page indicator.
 * Split into a client component so the dashboard layout can stay a server
 * component and keep its session check + redirect.
 */
export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navigasi admin" className="p-4 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50'
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
