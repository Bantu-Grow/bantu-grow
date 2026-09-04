'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const { subscribeNewsletter } = await import('@/app/actions/subscribe-newsletter')
      const result = await subscribeNewsletter(email, website)
      if (result.status === 'success') {
        setStatus('success')
        setMessage('Terima kasih! Anda berhasil berlangganan newsletter kami.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(result.message || 'Terjadi kesalahan. Silakan coba lagi.')
      }
    } catch {
      setStatus('error')
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  const hasError = status === 'error'

  return (
    <div className="w-full">
      {status === 'success' ? (
        <p role="status" className="text-sm text-primary font-medium">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email Anda"
            required
            className="flex-grow bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            aria-label="Alamat email untuk newsletter"
            aria-invalid={hasError}
            aria-describedby={hasError ? 'newsletter-error' : undefined}
          />
          {/* Honeypot: hidden from users, bots fill it in */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Mengirim...' : 'Langganan'}
            <Send className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </form>
      )}
      {hasError && (
        <p id="newsletter-error" role="alert" className="mt-2 text-xs text-destructive">
          {message}
        </p>
      )}
    </div>
  )
}
