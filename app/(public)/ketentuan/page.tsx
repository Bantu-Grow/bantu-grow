import { LegalDocument } from '@/components/legal-document'
import type { Metadata } from 'next'
import { termsMetadata } from '@/lib/seo'

export const metadata: Metadata = termsMetadata()

export default function TermsPage() {
  return (
    <LegalDocument
      title="Syarat & Ketentuan"
      description="Terakhir diperbarui: 25 Juni 2026"
      sections={[
        '1. Penerimaan Syarat',
        '2. Deskripsi Layanan',
        '3. Akun Pengguna',
        '4. Pembayaran dan Penagihan',
        '5. Penggunaan yang Dilarang',
        '6. Kepemilikan Data',
        '7. Pembatasan Tanggung Jawab',
        '8. Penghentian Layanan',
        '9. Perubahan Syarat',
        '10. Hukum yang Berlaku',
        '11. Hubungi Kami',
      ]}
    >
      <h2 id="section-1">1. Penerimaan Syarat</h2>
      <p>
        Dengan mengakses dan menggunakan layanan BantuGrow, Anda menyetujui
        untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak menyetujui
        salah satu bagian dari syarat ini, Anda tidak diperkenankan menggunakan
        layanan kami.
      </p>

      <h2 id="section-2">2. Deskripsi Layanan</h2>
      <p>
        BantuGrow menyediakan platform perangkat lunak berbasis cloud (SaaS)
        yang dirancang untuk membantu UMKM Indonesia mengelola operasional
        bisnis mereka. Layanan kami mencakup namun tidak terbatas pada manajemen
        penjualan, pencatatan, dan pelaporan.
      </p>

      <h2 id="section-3">3. Akun Pengguna</h2>
      <p>Untuk menggunakan layanan kami, Anda harus:</p>
      <ul>
        <li>Membuat akun dengan informasi yang akurat dan lengkap</li>
        <li>Menjaga kerahasiaan kredensial akun Anda</li>
        <li>Bertanggung jawab atas semua aktivitas di akun Anda</li>
        <li>Memberitahukan kami segera jika terjadi penggunaan tidak sah</li>
      </ul>

      <h2 id="section-4">4. Pembayaran dan Penagihan</h2>
      <p>
        Biaya berlangganan ditagihkan sesuai paket yang Anda pilih. Pembayaran
        dilakukan di muka untuk periode berlangganan yang dipilih. Kami berhak
        mengubah harga dengan pemberitahuan minimal 30 hari sebelumnya.
      </p>

      <h2 id="section-5">5. Penggunaan yang Dilarang</h2>
      <p>Anda tidak diperkenankan menggunakan layanan kami untuk:</p>
      <ul>
        <li>Aktivitas yang melanggar hukum yang berlaku di Indonesia</li>
        <li>Menyebarkan malware atau konten berbahaya</li>
        <li>Mengganggu atau merusak infrastruktur layanan</li>
        <li>Menyalahgunakan data pengguna lain</li>
        <li>Melakukan reverse engineering terhadap platform kami</li>
      </ul>

      <h2 id="section-6">6. Kepemilikan Data</h2>
      <p>
        Anda mempertahankan semua hak atas data yang Anda masukkan ke dalam
        platform kami. BantuGrow tidak mengklaim kepemilikan atas konten atau
        data bisnis Anda. Kami hanya menggunakan data tersebut untuk menyediakan
        layanan sesuai perjanjian ini.
      </p>

      <h2 id="section-7">7. Pembatasan Tanggung Jawab</h2>
      <p>
        BantuGrow menyediakan layanan &quot;sebagaimana adanya&quot; dan tidak
        memberikan jaminan bahwa layanan akan selalu tersedia tanpa gangguan.
        Tanggung jawab maksimal kami terbatas pada jumlah yang Anda bayarkan
        dalam 12 bulan terakhir.
      </p>

      <h2 id="section-8">8. Penghentian Layanan</h2>
      <p>
        Kami berhak menangguhkan atau menghentikan akun Anda jika terjadi
        pelanggaran terhadap syarat dan ketentuan ini. Anda juga dapat
        menghentikan langganan kapan saja. Setelah penghentian, Anda memiliki
        waktu 30 hari untuk mengunduh data Anda.
      </p>

      <h2 id="section-9">9. Perubahan Syarat</h2>
      <p>
        BantuGrow berhak memperbarui syarat dan ketentuan ini kapan saja.
        Perubahan material akan diberitahukan minimal 14 hari sebelum berlaku
        efektif melalui email atau notifikasi di platform.
      </p>

      <h2 id="section-10">10. Hukum yang Berlaku</h2>
      <p>
        Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum
        Republik Indonesia. Setiap perselisihan akan diselesaikan melalui
        musyawarah terlebih dahulu, dan jika tidak tercapai, melalui pengadilan
        yang berwenang di Indonesia.
      </p>

      <h2 id="section-11">11. Hubungi Kami</h2>
      <p>
        Untuk pertanyaan mengenai syarat dan ketentuan ini, hubungi kami di{' '}
        <a href="mailto:halo@bantugrow.com">halo@bantugrow.com</a>.
      </p>
    </LegalDocument>
  )
}
