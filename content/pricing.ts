export interface PricingTier {
  name: string
  slug: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  ctaHref: string
  highlighted?: boolean
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    slug: 'starter',
    price: 'Gratis',
    period: '',
    description: 'Untuk UMKM yang baru memulai digitalisasi bisnis.',
    features: [
      'Akses 1 produk pilihan',
      'Maksimal 50 transaksi/bulan',
      'Dashboard dasar',
      'Dukungan email',
      'Panduan onboarding',
    ],
    cta: 'Mulai Gratis',
    ctaHref: '/kontak?paket=starter',
  },
  {
    name: 'Growth',
    slug: 'growth',
    price: 'Rp 299.000',
    period: '/bulan',
    description: 'Untuk bisnis yang sedang bertumbuh dan butuh fitur lebih.',
    features: [
      'Akses semua produk',
      'Transaksi unlimited',
      'Dashboard lengkap & laporan',
      'Dukungan prioritas (chat & email)',
      'Integrasi pembayaran',
      'Multi-user (hingga 5 akun)',
    ],
    cta: 'Pilih Growth',
    ctaHref: '/kontak?paket=growth',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price: 'Custom',
    period: '',
    description: 'Untuk perusahaan dengan kebutuhan kustomisasi penuh.',
    features: [
      'Semua fitur Growth',
      'Kustomisasi fitur & branding',
      'Multi-cabang unlimited',
      'Dedicated account manager',
      'SLA uptime 99.9%',
      'API access & integrasi khusus',
      'Pelatihan tim on-site',
    ],
    cta: 'Minta Demo',
    ctaHref: '/demo',
  },
]
