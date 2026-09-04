'use client'

import React, { useState } from 'react'
import { requestDemo, type DemoRequestInput } from '@/app/actions/request-demo'
import { Button } from '@/components/ui/button'
import { Check, Loader2, AlertCircle } from 'lucide-react'

export interface DemoProductOption {
  slug: string
  name: string
}

export function DemoForm({ products = [] }: { products?: DemoProductOption[] }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')

  const [formData, setFormData] = useState<DemoRequestInput>({
    name: '',
    email: '',
    phone: '',
    company: '',
    productInterest: '',
    preferredTime: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await requestDemo(formData, honeypot)
      if (result.status === 'success') {
        setSuccess(true)
      } else {
        setError(result.message)
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center animate-in fade-in">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">
          Permintaan Demo Diterima!
        </h3>
        <p className="text-sm text-muted-foreground">
          Terima kasih! Tim kami akan menghubungi Anda dalam 1x24 jam untuk menjadwalkan demo.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot field - hidden from real users */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label htmlFor="demo-name" className="text-sm font-semibold text-foreground">
            Nama Lengkap <span className="text-destructive">*</span>
          </label>
          <input
            id="demo-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Masukkan nama lengkap"
            className="block w-full rounded-lg border border-input bg-transparent py-2.5 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="demo-email" className="text-sm font-semibold text-foreground">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            id="demo-email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@perusahaan.com"
            className="block w-full rounded-lg border border-input bg-transparent py-2.5 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="demo-phone" className="text-sm font-semibold text-foreground">
            Nomor Telepon
          </label>
          <input
            id="demo-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="08xxxxxxxxxx"
            className="block w-full rounded-lg border border-input bg-transparent py-2.5 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="demo-company" className="text-sm font-semibold text-foreground">
            Nama Perusahaan
          </label>
          <input
            id="demo-company"
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Nama perusahaan Anda"
            className="block w-full rounded-lg border border-input bg-transparent py-2.5 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="demo-product" className="text-sm font-semibold text-foreground">
            Produk yang Diminati
          </label>
          <select
            id="demo-product"
            value={formData.productInterest}
            onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
            className="block w-full rounded-lg border border-input bg-transparent py-2.5 px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="">Pilih produk...</option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
            <option value="semua">Semua Produk</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="demo-time" className="text-sm font-semibold text-foreground">
            Waktu Demo yang Diinginkan
          </label>
          <input
            id="demo-time"
            type="text"
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            placeholder="Contoh: Senin pagi, atau kapan saja"
            className="block w-full rounded-lg border border-input bg-transparent py-2.5 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Minta Demo Gratis
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
