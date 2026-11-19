import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SITE_URL } from '@/lib/seo'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'BantuGrow — Solusi SaaS untuk UMKM Indonesia',
  description:
    'BantuGrow menyediakan solusi perangkat lunak (SaaS) yang dirancang khusus untuk membantu UMKM Indonesia berkembang lebih cepat, efisien, dan terorganisir.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Plausible Analytics (privacy-friendly, no cookies)
          To activate: uncomment the script below and set data-domain to your actual domain.
          Sign up at https://plausible.io and add your domain there.
        */}
        {/* <script defer data-domain="bantugrow.id" src="https://plausible.io/js/script.js"></script> */}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}
