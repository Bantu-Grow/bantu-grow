import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ketentuan Affiliate — BantuGrow' }

export default function AffiliateTermsPage() {
  return <article className="prose prose-neutral dark:prose-invert mx-auto w-full max-w-3xl px-4 py-16">
    <h1>Ketentuan Program Affiliate BantuGrow</h1>
    <p>Dengan bergabung, Anda menyetujui ketentuan berikut. Program ini terbuka untuk umum, tetapi aktivasi akun tetap memerlukan verifikasi email dan persetujuan BantuGrow.</p>
    <h2>Komisi dan atribusi</h2><ul><li>Komisi 20% berlaku pada pembayaran tahun pertama dan 10% pada pembayaran perpanjangan.</li><li>Atribusi menggunakan metode referral terakhir dan berlaku 90 hari.</li><li>Komisi hanya tercatat setelah pembayaran pelanggan dikonfirmasi dan ditahan 30 hari untuk validasi.</li></ul>
    <h2>Payout</h2><p>Payout dapat diminta setelah saldo tersedia mencapai Rp100.000 dan data rekening telah lengkap. Jadwal transfer diproses manual sesuai siklus operasional BantuGrow.</p>
    <h2>Larangan</h2><p>Self-referral, informasi menyesatkan, spam, manipulasi klik, dan penyalahgunaan identitas dilarang. BantuGrow dapat menahan, membatalkan komisi, menangguhkan, atau menolak akun yang terindikasi melanggar.</p>
    <h2>Perubahan program</h2><p>BantuGrow dapat memperbarui ketentuan dengan pemberitahuan yang wajar. Komisi yang sudah sah tetap mengikuti catatan transaksi dan audit program.</p>
  </article>
}
