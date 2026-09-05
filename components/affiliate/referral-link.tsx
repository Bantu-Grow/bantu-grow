'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ReferralLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return <div className="flex flex-col gap-2 sm:flex-row">
    <input aria-label="Tautan referral" className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm" readOnly value={url} />
    <Button type="button" variant="outline" onClick={copyLink}>{copied ? 'Tersalin' : 'Salin tautan'}</Button>
  </div>
}
