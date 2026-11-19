import { PageContainer, StatusMessage } from '@/components/public-page'
import { FileText } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicInvoice } from '@/lib/affiliate/billing'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Invoice — BantuGrow',
  robots: { index: false, follow: false },
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  sent: 'Menunggu pembayaran',
  paid: 'Lunas',
  overdue: 'Jatuh tempo',
  void: 'Dibatalkan',
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invoice = await getPublicInvoice(token)

  if (!invoice) {
    return (
      <PageContainer className="py-12 lg:py-20">
        <StatusMessage
          headingLevel={1}
          title="Invoice tidak ditemukan"
          icon={FileText}
          className="mx-auto max-w-3xl"
          action={
            <Link
              className={cn(
                buttonVariants({ variant: 'outline', size: 'pill-sm' })
              )}
              href="/"
            >
              Kembali ke beranda
            </Link>
          }
        >
          Tautan tidak valid atau sudah dicabut. Silakan hubungi tim BantuGrow
          melalui email yang Anda terima.
        </StatusMessage>
      </PageContainer>
    )
  }

  const paid = invoice.status === 'paid'
  return (
    <PageContainer className="py-12 lg:py-20">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border bg-background">
        <header className="flex flex-wrap items-start justify-between gap-6 bg-secondary p-6 sm:p-10">
          <div>
            <p className="text-sm font-semibold text-primary">BantuGrow</p>
            <h1 className="mt-2 text-balance text-3xl leading-tight font-medium break-words sm:text-4xl">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Untuk: {invoice.customerName}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${paid ? 'bg-emerald-100 text-emerald-800' : invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-accent text-foreground'}`}
          >
            {STATUS_LABEL[invoice.status] ?? invoice.status}
          </span>
        </header>
        <dl className="mx-6 mt-8 grid gap-8 sm:mx-10 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Produk</dt>
            <dd className="mt-2 text-xl leading-8 font-semibold break-words">
              {invoice.productName}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Siklus</dt>
            <dd className="mt-2 text-xl leading-8 font-semibold break-words">
              Periode {invoice.cycleNumber}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Jatuh tempo</dt>
            <dd className="mt-2 text-xl leading-8 font-semibold break-words">
              {new Date(invoice.dueAt).toLocaleDateString('id-ID', {
                dateStyle: 'long',
              })}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Jumlah</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {formatRupiah(invoice.amount)}
            </dd>
          </div>
        </dl>
        <section className="mx-6 mt-8 rounded-2xl bg-secondary p-6 sm:mx-10">
          <h2 className="font-sans text-base font-semibold">
            Instruksi pembayaran
          </h2>
          <p className="mt-3 text-base leading-8 whitespace-pre-line break-words">
            {invoice.paymentInstructions}
          </p>
        </section>
        {paid && invoice.paidAt && (
          <p className="mx-6 mt-6 text-base text-emerald-700 sm:mx-10">
            Dibayar pada{' '}
            {new Date(invoice.paidAt).toLocaleDateString('id-ID', {
              dateStyle: 'long',
            })}
            . Terima kasih.
          </p>
        )}
        <footer className="mx-6 mt-8 mb-10 border-t pt-6 text-sm leading-7 text-muted-foreground sm:mx-10">
          Halaman ini hanya dapat diakses melalui tautan unik Anda. Butuh
          bantuan? Email halo@bantugrow.com.
        </footer>
      </article>
    </PageContainer>
  )
}
