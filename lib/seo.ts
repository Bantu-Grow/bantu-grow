import type { Metadata } from 'next'
import type { Product } from '@/content/products'
import type { BlogPost } from '@/content/blogs'
import type { CaseStudy } from '@/content/case-studies'

export interface PageMeta {
  title: string
  description: string
}

const SITE_NAME = 'BantuGrow'

/**
 * Single canonical site URL for metadata, sitemap and robots.
 * Previously the root layout used a different variable (NEXT_PUBLIC_APP_URL),
 * which produced inconsistent canonical/OG URLs.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bantugrow.id'

function buildMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      url: SITE_URL,
      type: 'website',
      locale: 'id_ID',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export function homeMeta(): PageMeta {
  return {
    title: `${SITE_NAME} — Solusi SaaS untuk UMKM Indonesia`,
    description:
      'BantuGrow menyediakan solusi perangkat lunak (SaaS) yang dirancang khusus untuk membantu UMKM Indonesia berkembang lebih cepat, efisien, dan terorganisir.',
  }
}

export function homeMetadata(): Metadata {
  const meta = homeMeta()
  return buildMetadata(meta.title, meta.description)
}

export function catalogMeta(): PageMeta {
  return {
    title: `Produk Kami — ${SITE_NAME}`,
    description:
      'Jelajahi rangkaian produk SaaS BantuGrow: Mutaba\'ah Digital, Management Travel Umroh, dan Point of Sale (POS). Temukan solusi yang tepat untuk bisnis UMKM Anda.',
  }
}

export function catalogMetadata(): Metadata {
  const meta = catalogMeta()
  return buildMetadata(meta.title, meta.description)
}

export function productMeta(product: Product): PageMeta {
  return {
    title: `${product.name} — ${SITE_NAME}`,
    description: product.shortDescription,
  }
}

export function productMetadata(product: Product): Metadata {
  const meta = productMeta(product)
  return buildMetadata(meta.title, meta.description)
}

export function aboutMeta(): PageMeta {
  return {
    title: `Tentang Kami — ${SITE_NAME}`,
    description:
      `Pelajari misi dan visi ${SITE_NAME}: membantu UMKM Indonesia tumbuh melalui teknologi SaaS yang tepat guna dan terjangkau.`,
  }
}

export function aboutMetadata(): Metadata {
  const meta = aboutMeta()
  return buildMetadata(meta.title, meta.description)
}

export function contactMeta(): PageMeta {
  return {
    title: `Hubungi Kami — ${SITE_NAME}`,
    description:
      `Hubungi tim ${SITE_NAME} untuk informasi produk, demo, atau pertanyaan lainnya. Kami siap membantu bisnis UMKM Anda.`,
  }
}

export function contactMetadata(): Metadata {
  const meta = contactMeta()
  return buildMetadata(meta.title, meta.description)
}

export function blogListMeta(): PageMeta {
  return {
    title: `Blog & Wawasan — ${SITE_NAME}`,
    description:
      'Dapatkan tips praktis, panduan digitalisasi, dan kabar terbaru dari tim BantuGrow untuk bisnis Anda.',
  }
}

export function blogListMetadata(): Metadata {
  const meta = blogListMeta()
  return buildMetadata(meta.title, meta.description)
}

export function blogPostMeta(post: BlogPost): PageMeta {
  return {
    title: `${post.title} — ${SITE_NAME}`,
    description: post.excerpt,
  }
}

export function blogPostMetadata(post: BlogPost): Metadata {
  const meta = blogPostMeta(post)
  return buildMetadata(meta.title, meta.description)
}

export function pricingMeta(): Metadata {
  const title = `Harga & Paket — ${SITE_NAME}`
  const description = 'Pilih paket BantuGrow yang sesuai dengan skala bisnis UMKM Anda. Mulai gratis, tanpa biaya tersembunyi.'
  return buildMetadata(title, description)
}

export function privacyMetadata(): Metadata {
  return buildMetadata(
    `Kebijakan Privasi — ${SITE_NAME}`,
    'Kebijakan privasi BantuGrow menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.'
  )
}

export function termsMetadata(): Metadata {
  return buildMetadata(
    `Syarat & Ketentuan — ${SITE_NAME}`,
    'Syarat dan ketentuan penggunaan layanan BantuGrow untuk UMKM Indonesia.'
  )
}

export function faqMetadata(): Metadata {
  return buildMetadata(
    `FAQ — ${SITE_NAME}`,
    'Pertanyaan yang sering diajukan tentang BantuGrow, layanan SaaS untuk UMKM Indonesia.'
  )
}

export function caseStudiesMetadata(): Metadata {
  return buildMetadata(
    `Studi Kasus — ${SITE_NAME}`,
    'Pelajari bagaimana UMKM Indonesia berhasil bertumbuh bersama solusi SaaS BantuGrow.'
  )
}

export function caseStudyMetadata(study: CaseStudy): Metadata {
  return buildMetadata(
    `${study.title} — ${SITE_NAME}`,
    `${study.client}: ${study.challenge.slice(0, 120)}...`
  )
}

export function careersMetadata(): Metadata {
  return buildMetadata(
    `Karier — ${SITE_NAME}`,
    'Bergabunglah dengan tim BantuGrow dan bantu jutaan UMKM Indonesia bertumbuh melalui teknologi.'
  )
}

export function demoMetadata(): Metadata {
  return buildMetadata(
    `Minta Demo Gratis — ${SITE_NAME}`,
    'Jadwalkan demo produk BantuGrow dan lihat langsung bagaimana solusi SaaS kami dapat membantu bisnis UMKM Anda berkembang.'
  )
}
