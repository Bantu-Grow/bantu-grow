'use client'

import { useId, useRef, useState } from 'react'
import { Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const errorId = useId()
  const emailInput = useRef<HTMLInputElement>(null)
  const submitting = useRef(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting.current) return

    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error')
      setMessage(trimmed ? 'Masukkan alamat email yang valid, misalnya nama@usaha.com.' : 'Masukkan alamat email Anda untuk berlangganan.')
      emailInput.current?.focus()
      return
    }

    submitting.current = true
    setStatus('loading')
    setMessage('')
    try {
      const { subscribeNewsletter } = await import('@/app/actions/subscribe-newsletter')
      const result = await subscribeNewsletter(trimmed, website)
      if (result.status === 'success') {
        setStatus('success')
        setMessage('Terima kasih! Tips usaha dan kabar BantuGrow siap hadir di email Anda.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(result.message || 'Terjadi kesalahan. Silakan coba lagi.')
      }
    } catch {
      setStatus('error')
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      submitting.current = false
    }
  }

  const hasError = status === 'error'

  return (
    <div className="w-full">
      {status === 'success' ? (
        <div role="status" className="flex items-center gap-3 rounded-2xl border bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-foreground"><Check className="size-5" aria-hidden="true" /></span>
          <p>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate aria-busy={status === 'loading'} className="flex flex-col gap-3 sm:flex-row">
          <Input
            ref={emailInput}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (hasError) setStatus('idle')
            }}
            placeholder="Masukkan email Anda"
            required
            readOnly={status === 'loading'}
            className="h-12 flex-1 rounded-full bg-background px-4"
            aria-label="Alamat email untuk newsletter"
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />
          <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <Button type="submit" variant="brand" size="pill-sm" disabled={status === 'loading'}>
            {status === 'loading' ? 'Mengirim...' : 'Berlangganan'}
            <Send className="size-4" aria-hidden="true" />
          </Button>
        </form>
      )}
      {hasError && <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">{message}</p>}
    </div>
  )
}
