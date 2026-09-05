import { listAdminPayouts } from '@/lib/affiliate'
import { AdminOperations, payoutActions } from '../affiliate-operations'

export default async function PayoutsPage() {
  const rows = await listAdminPayouts()
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold">Payout</h2>
        <p className="text-sm text-muted-foreground">Komisi dicadangkan saat diajukan dan baru ditandai dibayar setelah transfer. Tolak/batalkan mengembalikan saldo.</p>
      </div>
      <a href="/api/admin/statements" className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">Unduh CSV bulan ini</a>
    </div>
    <AdminOperations title="Payout" description="Proses permintaan payout dan simpan referensi transfer." rows={rows} columns={[{key:'affiliateName',label:'Affiliate'},{key:'amount',label:'Bruto',format:'money'},{key:'taxAmount',label:'PPh',format:'money'},{key:'netAmount',label:'Net',format:'money'},{key:'status',label:'Status'},{key:'transferReference',label:'Referensi'},{key:'requestedAt',label:'Diminta',format:'date'}]} actions={payoutActions} />
  </div>
}
