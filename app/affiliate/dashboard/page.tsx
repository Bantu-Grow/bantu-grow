import { cookies } from 'next/headers'
import { AFFILIATE_SESSION_COOKIE, authenticateAffiliate, getAffiliatePortalData } from '@/lib/affiliate'
import { SITE_URL } from '@/lib/seo'
import { requestAffiliatePayoutAction } from '@/app/actions/affiliate'
import { AffiliateBankForm } from '@/components/affiliate/affiliate-forms'
import { ReferralLink } from '@/components/affiliate/referral-link'
import { Button } from '@/components/ui/button'

const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' })
const statuses: Record<string, string> = { held: 'Ditahan', available: 'Tersedia', reserved: 'Diproses', paid: 'Dibayar', void: 'Dibatalkan', requested: 'Diminta', approved: 'Disetujui', rejected: 'Ditolak', cancelled: 'Dibatalkan' }

export default async function AffiliateDashboardPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const token = (await cookies()).get(AFFILIATE_SESSION_COOKIE)!.value
  const affiliate = (await authenticateAffiliate(token))!
  const [{ status }, data] = await Promise.all([searchParams, getAffiliatePortalData(affiliate.id)])
  const cards = [['Klik', data.analytics.clicks], ['Lead', data.analytics.attributedLeads], ['Pelanggan', data.analytics.customers], ['Saldo tersedia', money.format(data.analytics.availableCommission)], ['Komisi ditahan', money.format(data.analytics.heldCommission)], ['Total dibayar', money.format(data.analytics.paidCommission)]]
  return <div className="space-y-8">
    <div><p className="text-sm text-muted-foreground">Selamat datang kembali,</p><h1 className="text-3xl font-extrabold">{affiliate.name}</h1></div>
    {status === 'payout-requested' ? <p role="status" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700">Permintaan payout berhasil dikirim.</p> : null}
    <section className="rounded-2xl border bg-card p-6"><h2 className="mb-3 text-lg font-bold">Tautan referral Anda</h2><ReferralLink url={`${SITE_URL}/r/${affiliate.referralCode}`} /><p className="mt-2 text-xs text-muted-foreground">Kode: {affiliate.referralCode} · atribusi last-click 90 hari</p>
      <p className="mt-3"><a href={`https://wa.me/?text=${encodeURIComponent(`Gunakan kode referral saya ${affiliate.referralCode} untuk mendapatkan diskon dari BantuGrow: ${SITE_URL}/r/${affiliate.referralCode}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white">Bagikan via WhatsApp</a></p>
    </section>
    <section><h2 className="mb-4 text-xl font-bold">Ringkasan performa</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-extrabold">{value}</p></div>)}</div></section>
    <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border bg-card p-6"><h2 className="mb-5 text-xl font-bold">Referral terbaru</h2>{data.referrals.length ? <ul className="divide-y">{data.referrals.map((item) => <li key={item.id} className="flex justify-between py-3 text-sm"><span>{item.kind === 'lead' ? 'Kontak' : 'Permintaan demo'}</span><time>{date.format(new Date(item.createdAt))}</time></li>)}</ul> : <p className="text-sm text-muted-foreground">Belum ada referral teratribusi.</p>}</section>
    <section className="rounded-2xl border bg-card p-6"><h2 className="mb-5 text-xl font-bold">Komisi</h2>{data.commissions.length ? <ul className="divide-y">{data.commissions.map((item) => <li key={item.id} className="flex justify-between gap-3 py-3 text-sm"><span><strong>{money.format(item.amount)}</strong><br /><span className="text-muted-foreground">{item.rateBasisPoints / 100}% · {statuses[item.status]}</span></span><time>{date.format(new Date(item.createdAt))}</time></li>)}</ul> : <p className="text-sm text-muted-foreground">Belum ada komisi.</p>}</section></div>
    <section className="rounded-2xl border bg-card p-6"><h2 className="mb-5 text-xl font-bold">Rekening payout</h2><AffiliateBankForm account={data.bankAccount} /></section>
    <section className="rounded-2xl border bg-card p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Payout</h2><p className="text-sm text-muted-foreground">Minimum Rp100.000 dari saldo tersedia.</p></div><form action={requestAffiliatePayoutAction}><Button type="submit" disabled={!data.bankAccount || data.analytics.availableCommission < 100_000}>Minta payout</Button></form></div>{data.payouts.length ? <ul className="mt-5 divide-y">{data.payouts.map((item) => <li key={item.id} className="flex justify-between py-3 text-sm"><span>{money.format(item.amount)} · {statuses[item.status]}</span><time>{date.format(new Date(item.requestedAt))}</time></li>)}</ul> : null}</section>
  </div>
}
