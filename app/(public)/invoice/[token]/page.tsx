import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicInvoice } from '@/lib/affiliate/billing'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Invoice — BantuGrow', robots: { index: false, follow: false } }

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', sent: 'Menunggu pembayaran', paid: 'Lunas', overdue: 'Jatuh tempo', void: 'Dibatalkan',
}

export default async function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invoice = await getPublicInvoice(token)

  if (!invoice) {
    return <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Invoice tidak ditemukan</h1>
      <p className="mt-3 text-muted-foreground">Tautan tidak valid atau sudah dicabut. Silakan hubungi tim BantuGrow melalui email yang Anda terima.</p>
      <Link className="mt-8 text-primary underline" href="/">Kembali ke beranda</Link>
    </div>
  }

  const paid = invoice.status === 'paid'
  return <div className="mx-auto w-full max-w-2xl px-4 py-16 md:px-8 md:py-24">
    <article className="rounded-3xl border bg-card p-8 shadow-sm md:p-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">BantuGrow</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Invoice {invoice.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Untuk: {invoice.customerName}</p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${paid ? 'bg-emerald-100 text-emerald-800' : invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
          {STATUS_LABEL[invoice.status] ?? invoice.status}
        </span>
      </header>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Produk</dt><dd className="mt-1 font-medium">{invoice.productName}</dd></div>
        <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Siklus</dt><dd className="mt-1 font-medium">Periode {invoice.cycleNumber}</dd></div>
        <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Jatuh tempo</dt><dd className="mt-1 font-medium">{new Date(invoice.dueAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</dd></div>
        <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Jumlah</dt><dd className="mt-1 text-xl font-extrabold">{formatRupiah(invoice.amount)}</dd></div>
      </dl>
      <section className="mt-8 rounded-2xl border bg-muted/40 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Instruksi pembayaran</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-6">{invoice.paymentInstructions}</p>
      </section>
      {paid && invoice.paidAt && <p className="mt-6 text-sm text-emerald-700">Dibayar pada {new Date(invoice.paidAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}. Terima kasih.</p>}
      <footer className="mt-10 border-t pt-6 text-xs leading-6 text-muted-foreground">
        Halaman ini hanya dapat diakses melalui tautan unik Anda. Butuh bantuan? Email halo@bantugrow.com.
      </footer>
    </article>
  </div>
}
