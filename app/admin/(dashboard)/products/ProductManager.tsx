'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveProduct, deleteProduct } from '@/app/actions/admin'
import { type Product } from '@/content/products'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Loader2 } from 'lucide-react'

interface ProductManagerProps {
  initialProducts: Product[]
}

export function ProductManager({ initialProducts }: ProductManagerProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [isNew, setIsNew] = useState(true)
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  
  const [formData, setFormData] = useState<{
    slug: string
    name: string
    niche: string
    shortDescription: string
    fullDescription: string
    featuresText: string
    image: string
  }>({
    slug: '',
    name: '',
    niche: '',
    shortDescription: '',
    fullDescription: '',
    featuresText: '',
    image: '',
  })
  
  const [error, setError] = useState<string | null>(null)

  const handleOpenAdd = () => {
    setIsNew(true)
    setFormData({
      slug: '',
      name: '',
      niche: '',
      shortDescription: '',
      fullDescription: '',
      featuresText: '',
      image: '',
    })
    setError(null)
    setShowForm(true)
  }

  const handleOpenEdit = (product: Product) => {
    setIsNew(false)
    setFormData({
      slug: product.slug,
      name: product.name,
      niche: product.niche,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      featuresText: product.features.join('\n'),
      image: product.image || '',
    })
    setError(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setError(null)
  }

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini? Halaman detail produk yang bersangkutan tidak akan dapat diakses lagi.')) {
      return
    }

    try {
      const res = await deleteProduct(slug)
      if (res.success) {
        setProducts(products.filter((p) => p.slug !== slug))
        startTransition(() => {
          router.refresh()
        })
      } else {
        alert(res.error || 'Gagal menghapus produk')
      }
    } catch {
      alert('Terjadi kesalahan koneksi')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validasi input
    if (!formData.slug.trim() || !formData.name.trim() || !formData.niche.trim()) {
      setError('Slug, nama, dan niche produk wajib diisi.')
      setLoading(false)
      return
    }

    // Format fitur dari textarea line-by-line
    const features = formData.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)

    const payload: Product = {
      slug: formData.slug.trim(),
      name: formData.name.trim(),
      niche: formData.niche.trim(),
      shortDescription: formData.shortDescription.trim(),
      fullDescription: formData.fullDescription.trim(),
      features,
      image: formData.image.trim() || undefined,
    }

    try {
      const res = await saveProduct(payload, isNew)
      if (res.success) {
        if (isNew) {
          setProducts([...products, payload])
        } else {
          setProducts(products.map((p) => (p.slug === payload.slug ? payload : p)))
        }
        setShowForm(false)
        startTransition(() => {
          router.refresh()
        })
      } else {
        setError(res.error || 'Gagal menyimpan produk')
      }
    } catch {
      setError('Terjadi kesalahan jaringan/server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Kelola Produk
          </h2>
          <p className="text-sm text-muted-foreground">
            Tambah, ubah, atau hapus katalog produk SaaS BantuGrow secara dinamis.
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleOpenAdd} className="inline-flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border/80 bg-card rounded-xl p-6 shadow-sm space-y-6 relative overflow-hidden dark:bg-[radial-gradient(30%_30%_at_100%_0%,--theme(--color-primary/.04),transparent)]">
          <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-4">
            <h3 className="text-lg font-bold text-foreground">
              {isNew ? 'Tambah Produk Baru' : 'Ubah Detail Produk'}
            </h3>
            <button
              type="button"
              onClick={handleCloseForm}
              className="p-1.5 rounded-lg hover:bg-muted dark:hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-semibold text-foreground">
                Slug (Contoh: pos-retail)
              </label>
              <input
                id="slug"
                type="text"
                disabled={!isNew}
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="Masukkan slug produk unik"
                className="block w-full rounded-lg border border-input bg-transparent py-2 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                Nama Produk
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama produk"
                className="block w-full rounded-lg border border-input bg-transparent py-2 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="niche" className="text-sm font-semibold text-foreground">
                Niche / Kategori Bisnis
              </label>
              <input
                id="niche"
                type="text"
                required
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                placeholder="Contoh: Ritel & UMKM, Pendidikan, Travel"
                className="block w-full rounded-lg border border-input bg-transparent py-2 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="shortDescription" className="text-sm font-semibold text-foreground">
                Deskripsi Singkat (Katalog)
              </label>
              <input
                id="shortDescription"
                type="text"
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Ringkasan singkat 1-2 kalimat untuk kartu katalog"
                className="block w-full rounded-lg border border-input bg-transparent py-2 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="fullDescription" className="text-sm font-semibold text-foreground">
                Deskripsi Lengkap (Halaman Detail)
              </label>
              <textarea
                id="fullDescription"
                rows={4}
                required
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                placeholder="Penjelasan mendetail mengenai keunggulan dan tujuan produk..."
                className="block w-full rounded-lg border border-input bg-transparent py-2 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground resize-y"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="image" className="text-sm font-semibold text-foreground">
                URL Gambar Produk (Opsional)
              </label>
              <input
                id="image"
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Contoh: /images/product-placeholder.svg"
                className="block w-full rounded-lg border border-input bg-transparent py-2 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="featuresText" className="text-sm font-semibold text-foreground flex flex-col">
                <span>Fitur Utama (Satu baris untuk satu fitur)</span>
                <span className="text-xs text-muted-foreground font-normal mt-0.5">
                  Tekan enter untuk memisahkan fitur.
                </span>
              </label>
              <textarea
                id="featuresText"
                rows={5}
                required
                value={formData.featuresText}
                onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                placeholder="Contoh:&#10;Laporan keuangan harian otomatis&#10;Multi-device login&#10;Keamanan cloud database"
                className="block w-full rounded-lg border border-input bg-transparent py-2.5 px-3 text-sm placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary text-foreground resize-y font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border/80 pt-4 mt-6">
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Simpan Produk
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Products table list */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Belum ada data produk di database. Klik tombol &quot;Tambah Produk&quot; untuk memulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border/80 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Nama Produk / Slug</th>
                  <th className="px-6 py-4">Niche</th>
                  <th className="px-6 py-4 hidden md:table-cell">Fitur Utama</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80 text-sm text-foreground">
                {products.map((product) => (
                  <tr key={product.slug} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">
                          {product.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          /produk/{product.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {product.niche}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-xs truncate text-muted-foreground">
                      {product.features.join(', ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(product)}
                          aria-label={`Ubah produk ${product.name}`}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.slug)}
                          aria-label={`Hapus produk ${product.name}`}
                          className="h-8 w-8 text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
