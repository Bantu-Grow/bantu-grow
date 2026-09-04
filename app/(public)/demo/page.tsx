import type { Metadata } from 'next'
import { DemoForm } from './DemoForm'
import { DecorIcon } from '@/components/decor-icon'
import { demoMetadata } from '@/lib/seo'
import { getAllProducts } from '@/lib/catalog'
import { CheckCircle } from 'lucide-react'

export const metadata: Metadata = demoMetadata()

const benefits = [
  'Demo langsung dengan tim ahli kami',
  'Disesuaikan dengan kebutuhan bisnis Anda',
  'Tanpa komitmen, 100% gratis',
  'Konsultasi awal untuk solusi terbaik',
]

export default async function DemoPage() {
  // Options are derived from the catalog so the submitted slug always matches a
  // real product (the hardcoded list had drifted from the actual slugs).
  const products = await getAllProducts()
  const productOptions = products.map((p) => ({ slug: p.slug, name: p.name }))

  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-8 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3 md:text-4xl">
          Minta Demo Gratis
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
          Jadwalkan demo produk BantuGrow dan lihat langsung bagaimana solusi kami dapat membantu bisnis Anda berkembang.
        </p>
      </div>

      <div className="relative border-y border-border/80 py-12">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Benefits sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-foreground">
              Apa yang Anda Dapatkan
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-lg bg-muted/30 border border-border/60 p-4">
              <p className="text-xs text-muted-foreground">
                Tim kami akan menghubungi Anda dalam 1x24 jam setelah pengajuan demo diterima.
              </p>
            </div>
          </div>

          {/* Demo Form */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border/80 bg-card p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Isi Formulir Demo
              </h3>
              <DemoForm products={productOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
