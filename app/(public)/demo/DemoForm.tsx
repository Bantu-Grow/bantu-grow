'use client'

import React, { useState } from 'react'
import { requestDemo, type DemoRequestInput } from '@/app/actions/request-demo'
import { Input } from '@/components/ui/input'
import { StatusMessage } from '@/components/public-page'
import { Button } from '@/components/ui/button'
import { Check, Loader2, AlertCircle } from 'lucide-react'

export interface DemoProductOption {
  slug: string
  name: string
}

export function DemoForm({
  products = [],
}: {
  products?: DemoProductOption[]
}) {
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
      <div role="status" aria-live="polite">
        <StatusMessage title="Permintaan demo diterima">
          Tim kami akan menghubungi Anda dalam 1×24 jam untuk menjadwalkan demo.
        </StatusMessage>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="space-y-6">
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
          className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="demo-name"
            className="text-sm font-semibold text-foreground"
          >
            Nama Lengkap <span className="text-destructive">*</span>
          </label>
          <Input
            variant="public"
            id="demo-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="demo-email"
            className="text-sm font-semibold text-foreground"
          >
            Email <span className="text-destructive">*</span>
          </label>
          <Input
            variant="public"
            id="demo-email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="email@perusahaan.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="demo-phone"
            className="text-sm font-semibold text-foreground"
          >
            Nomor Telepon
          </label>
          <Input
            variant="public"
            id="demo-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="demo-company"
            className="text-sm font-semibold text-foreground"
          >
            Nama Perusahaan
          </label>
          <Input
            variant="public"
            id="demo-company"
            type="text"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            placeholder="Nama perusahaan Anda"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="demo-product"
            className="text-sm font-semibold text-foreground"
          >
            Produk yang Diminati
          </label>
          <select
            className="h-12 w-full rounded-xl border bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm"
            id="demo-product"
            value={formData.productInterest}
            onChange={(e) =>
              setFormData({ ...formData, productInterest: e.target.value })
            }
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

        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="demo-time"
            className="text-sm font-semibold text-foreground"
          >
            Waktu Demo yang Diinginkan
          </label>
          <Input
            variant="public"
            id="demo-time"
            type="text"
            value={formData.preferredTime}
            onChange={(e) =>
              setFormData({ ...formData, preferredTime: e.target.value })
            }
            placeholder="Contoh: Senin pagi, atau kapan saja"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="brand"
          size="pill-sm"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
              Mengirim...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" aria-hidden="true" />
              Minta Demo Gratis
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
