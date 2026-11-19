'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { navLinks } from '@/components/layout/Header'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" className="size-11 rounded-full" aria-label="Buka menu" />}>
          <Menu className="size-5" aria-hidden="true" />
        </SheetTrigger>
        <SheetContent showCloseButton={false} className="w-full gap-6 overflow-y-auto p-6 motion-reduce:transition-none">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle>Navigasi BantuGrow</SheetTitle>
            <SheetClose render={<Button variant="ghost" className="size-11 rounded-full" aria-label="Tutup menu" />}>
              <X className="size-5" aria-hidden="true" />
            </SheetClose>
          </div>
          <nav aria-label="Navigasi mobile" className="grid gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={cn(buttonVariants({ variant: 'ghost' }), 'min-h-12 justify-start px-4 text-base')} onClick={() => setOpen(false)}>{link.label}</Link>
            ))}
            <Link href="/demo" className={cn(buttonVariants({ variant: 'brand', size: 'pill' }), 'mt-6')} onClick={() => setOpen(false)}>Minta Demo Gratis</Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
