import { LegalDocument } from '@/components/legal-document'
import type { Metadata } from 'next'
import { privacyMetadata } from '@/lib/seo'

export const metadata: Metadata = privacyMetadata()

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Kebijakan Privasi"
      description="Terakhir diperbarui: 25 Juni 2026"
      sections={[
        '1. Informasi yang Kami Kumpulkan',
        '2. Penggunaan Informasi',
        '3. Perlindungan Data',
        '4. Berbagi Informasi',
        '5. Cookie dan Teknologi Pelacakan',
        '6. Hak Anda',
        '7. Perubahan Kebijakan',
        '8. Hubungi Kami',
      ]}
    >
      <h2 id="section-1">1. Informasi yang Kami Kumpulkan</h2>
      <p>
        BantuGrow mengumpulkan informasi yang Anda berikan secara langsung
        kepada kami, termasuk:
      </p>
      <ul>
        <li>Nama lengkap</li>
        <li>Alamat email</li>
        <li>Nomor telepon (opsional)</li>
        <li>Informasi bisnis (nama usaha, kategori, dsb.)</li>
        <li>Data yang dimasukkan saat menggunakan layanan kami</li>
      </ul>

      <h2 id="section-2">2. Penggunaan Informasi</h2>
      <p>Informasi yang kami kumpulkan digunakan untuk:</p>
      <ul>
        <li>Menyediakan, memelihara, dan meningkatkan layanan kami</li>
        <li>Mengirimkan pemberitahuan teknis dan pembaruan</li>
        <li>Merespons pertanyaan dan permintaan dukungan</li>
        <li>Mengirimkan informasi pemasaran (dengan persetujuan Anda)</li>
        <li>Menganalisis penggunaan layanan untuk peningkatan produk</li>
      </ul>

      <h2 id="section-3">3. Perlindungan Data</h2>
      <p>
        Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang
        wajar untuk melindungi informasi pribadi Anda dari akses tidak sah,
        perubahan, pengungkapan, atau perusakan. Data Anda disimpan dengan
        enkripsi dan hanya diakses oleh personel yang berwenang.
      </p>

      <h2 id="section-4">4. Berbagi Informasi</h2>
      <p>
        BantuGrow tidak menjual, memperdagangkan, atau menyewakan informasi
        pribadi Anda kepada pihak ketiga. Kami hanya membagikan data apabila
        diperlukan untuk menyediakan layanan (misalnya, penyedia infrastruktur
        cloud), atau jika diwajibkan oleh hukum yang berlaku.
      </p>

      <h2 id="section-5">5. Cookie dan Teknologi Pelacakan</h2>
      <p>
        Kami menggunakan cookie dan teknologi serupa untuk meningkatkan
        pengalaman pengguna, menganalisis trafik, dan memahami bagaimana layanan
        kami digunakan. Anda dapat mengatur preferensi cookie melalui pengaturan
        browser Anda.
      </p>

      <h2 id="section-6">6. Hak Anda</h2>
      <p>Anda memiliki hak untuk:</p>
      <ul>
        <li>Mengakses data pribadi yang kami simpan tentang Anda</li>
        <li>Meminta koreksi data yang tidak akurat</li>
        <li>Meminta penghapusan data pribadi Anda</li>
        <li>Menarik persetujuan penggunaan data kapan saja</li>
      </ul>

      <h2 id="section-7">7. Perubahan Kebijakan</h2>
      <p>
        Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu.
        Perubahan signifikan akan kami beritahukan melalui email atau
        pemberitahuan di layanan kami. Penggunaan berkelanjutan atas layanan
        kami setelah perubahan berlaku dianggap sebagai persetujuan Anda
        terhadap kebijakan yang diperbarui.
      </p>

      <h2 id="section-8">8. Hubungi Kami</h2>
      <p>
        Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan
        hubungi kami di <a href="mailto:halo@bantugrow.com">halo@bantugrow.com</a>
        .
      </p>
    </LegalDocument>
  )
}
