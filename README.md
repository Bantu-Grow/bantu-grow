# BantuGrow — Company Profile & Katalog Produk

Situs company profile sekaligus katalog produk SaaS untuk UMKM Indonesia, dilengkapi blog, formulir lead/demo/newsletter, dan panel admin.

Produk yang ditampilkan: **Mutaba'ah Digital**, **Management Travel Umroh**, dan **Point of Sale (POS)**.

## Teknologi

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + `@tailwindcss/typography`, komponen Base UI/shadcn
- **SQLite** (`sqlite3`) untuk produk, blog, lead, demo request, newsletter, dan sesi admin
- **Zod** untuk validasi, **marked** + **isomorphic-dompurify** untuk render markdown yang aman
- **Vitest** + Testing Library + fast-check

## Menjalankan Secara Lokal

Membutuhkan Node.js **>= 20.19.0** (lihat `.nvmrc`).

```bash
npm ci
npm run dev
```

Aplikasi berjalan di http://localhost:3000.

## Scripts

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Build produksi |
| `npm start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Vitest (sekali jalan) |
| `npm run test:watch` | Vitest mode watch |

## Environment Variables

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | tidak | `https://bantugrow.id` | URL kanonik untuk metadata, sitemap, dan robots |
| `DATABASE_PATH` | tidak | `content/data/bantugrow.db` | Lokasi file SQLite (`:memory:` dipakai saat test) |
| `ADMIN_PASSWORD` | ya di produksi | `admin` (non-produksi saja) | Password panel admin |

## Struktur

```
app/
  (public)/   Halaman publik: beranda, produk, harga, blog, studi kasus, demo, kontak, dll.
  admin/      Login dan dashboard admin
  actions/    Server Actions (lead, demo, newsletter, admin)
components/   Komponen UI dan layout
content/      Konten statis + seed JSON di content/data
lib/          Akses database, SEO, markdown, dan util
```

## Data & Panel Admin

Database SQLite dibuat otomatis pada permintaan pertama dan diisi dari `content/data/*.json` bila tabel masih kosong. Skema lama dimigrasikan otomatis di dalam transaksi.

Panel admin tersedia di `/admin/login` untuk mengelola produk, artikel, pesan masuk, dan permintaan demo. Sesi admin disimpan di tabel `admin_sessions` sehingga tetap berlaku setelah restart.

## Deployment

Push ke `main` menjalankan GitHub Actions:

1. **quality** — lint, typecheck, test, build (deploy dibatalkan bila gagal)
2. **build-and-push** — build image Docker dan push ke GitHub Container Registry
3. **deploy** — deploy via SSH dengan Docker Compose, disertai health check yang menggagalkan workflow bila aplikasi tidak sehat

Database SQLite dipersistensi melalui volume `/data` (`DATABASE_PATH=/data/bantugrow.db`).
