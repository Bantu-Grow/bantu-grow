'use client'

import React from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

/**
 * Accessible modal for the admin dashboard.
 *
 * Built on Base UI Dialog so it provides role="dialog", aria-modal, a focus
 * trap, Escape-to-close and backdrop dismissal — none of which the previous
 * hand-rolled overlay had.
 */
export function AdminModal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
}: AdminModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
            'border border-border/80 bg-card rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto',
            'transition duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0',
            className
          )}
        >
          <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-5">
            <Dialog.Title className="text-lg font-bold text-foreground flex items-center gap-2">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Tutup dialog"
              className="p-1.5 rounded-lg hover:bg-muted dark:hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {children}

          {footer && (
            <div className="flex justify-end gap-3 border-t border-border/80 pt-4 mt-6">{footer}</div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
