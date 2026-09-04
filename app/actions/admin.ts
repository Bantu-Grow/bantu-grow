'use server'

import { cookies, headers } from 'next/headers'
import { createHash, randomUUID, timingSafeEqual } from 'crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  readProducts,
  insertProduct,
  updateProduct,
  deleteProductBySlug,
  readBlogs,
  insertBlog,
  updateBlog,
  deleteBlogBySlug,
  readLeads,
  deleteLeadById,
  readDemoRequests,
  deleteDemoRequestById,
  createAdminSession,
  isAdminSessionValid,
  deleteAdminSession,
  deleteExpiredAdminSessions,
  type DemoRequest,
} from '@/lib/db'
import { type Product } from '@/content/products'
import { type BlogPost } from '@/content/blogs'
import { type Lead } from '@/lib/lead-sink'
import { normalizeDateInput } from '@/lib/format-date'

const ADMIN_COOKIE_NAME = 'bantugrow_admin_session'
const SESSION_TTL_MS = 60 * 60 * 24 * 1000 // 1 day

// Hosts allowed by next.config.ts images.remotePatterns. Images from any other
// host make /_next/image return 400, which silently breaks the public pages.
const ALLOWED_IMAGE_HOSTS = ['ui-avatars.com']

// In production, ADMIN_PASSWORD must be set via environment variable.
// In non-production environments, fall back to 'admin' for development convenience.
function getAdminPassword(): string {
  const envPassword = process.env.ADMIN_PASSWORD
  if (envPassword) return envPassword
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD environment variable is required in production')
  }
  return 'admin'
}

// Constant-time comparison so login cannot be attacked via response timing.
function safeCompare(a: string, b: string): boolean {
  const bufA = createHash('sha256').update(a).digest()
  const bufB = createHash('sha256').update(b).digest()
  return timingSafeEqual(bufA, bufB)
}

// Legacy static token accepted only in non-production for backward compatibility (tests)
const LEGACY_TOKEN = 'bantugrow_authenticated_admin'

// ─── Login Rate Limiting ───────────────────────────────────────────────────────
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOGIN_RATE_LIMIT_MAX = 5
const loginAttemptMap = new Map<string, number[]>()

function isLoginRateLimited(key: string): boolean {
  const now = Date.now()
  const timestamps = loginAttemptMap.get(key) ?? []
  const recent = timestamps.filter((t) => now - t < LOGIN_RATE_LIMIT_WINDOW_MS)
  loginAttemptMap.set(key, recent)

  if (recent.length >= LOGIN_RATE_LIMIT_MAX) {
    return true
  }
  recent.push(now)
  loginAttemptMap.set(key, recent)
  return false
}

// Rate limit per client IP instead of one shared bucket, otherwise a single
// attacker could lock the real admin out for 15 minutes.
async function getClientKey(): Promise<string> {
  try {
    const headerStore = await headers()
    const forwarded = headerStore.get('x-forwarded-for')
    if (forwarded) return forwarded.split(',')[0].trim()
    const realIp = headerStore.get('x-real-ip')
    if (realIp) return realIp.trim()
  } catch {
    // headers() is unavailable outside a request scope (e.g. unit tests)
  }
  return 'unknown'
}

export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const clientKey = await getClientKey()
  if (isLoginRateLimited(clientKey)) {
    return { success: false, error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' }
  }

  if (safeCompare(password, getAdminPassword())) {
    // In production, use random session tokens for security.
    // In non-production, use a static token for test compatibility.
    const isProduction = process.env.NODE_ENV === 'production'
    const token = isProduction ? randomUUID() : LEGACY_TOKEN

    if (isProduction) {
      // Sessions live in SQLite so they survive restarts and multi-instance deploys.
      await deleteExpiredAdminSessions()
      await createAdminSession(token, SESSION_TTL_MS)
    }

    const cookieStore = await cookies()
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'strict',
    })
    return { success: true }
  }
  return { success: false, error: 'Password salah' }
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE_NAME)
  if (session?.value && process.env.NODE_ENV === 'production') {
    await deleteAdminSession(session.value)
  }
  cookieStore.delete(ADMIN_COOKIE_NAME)
  return { success: true }
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE_NAME)
  if (!session?.value) return false

  // In non-production, accept legacy static token for backward compatibility
  if (process.env.NODE_ENV !== 'production' && session.value === LEGACY_TOKEN) {
    return true
  }

  return isAdminSessionValid(session.value)
}

// ─── Validation ────────────────────────────────────────────────────────────────

const slugSchema = z
  .string()
  .min(1, 'Slug wajib diisi')
  .max(120, 'Slug terlalu panjang')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung')

function isAllowedImageUrl(value: string): boolean {
  if (!value) return true
  if (value.startsWith('/')) return true
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    return ALLOWED_IMAGE_HOSTS.includes(url.hostname)
  } catch {
    return false
  }
}

const imageUrlSchema = z
  .string()
  .max(500, 'URL gambar terlalu panjang')
  .refine(isAllowedImageUrl, {
    message: `URL gambar harus berupa path lokal (/...) atau berasal dari: ${ALLOWED_IMAGE_HOSTS.join(', ')}`,
  })
  .optional()
  .or(z.literal(''))

const productSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, 'Nama produk wajib diisi').max(150, 'Nama produk terlalu panjang'),
  niche: z.string().min(1, 'Niche wajib diisi').max(150, 'Niche terlalu panjang'),
  shortDescription: z
    .string()
    .min(1, 'Deskripsi singkat wajib diisi')
    .max(500, 'Deskripsi singkat terlalu panjang'),
  fullDescription: z
    .string()
    .min(1, 'Deskripsi lengkap wajib diisi')
    .max(20000, 'Deskripsi lengkap terlalu panjang'),
  features: z.array(z.string().max(300)).max(50, 'Fitur terlalu banyak'),
  image: imageUrlSchema,
})

const blogSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1, 'Judul wajib diisi').max(200, 'Judul terlalu panjang'),
  category: z.string().min(1, 'Kategori wajib diisi').max(100, 'Kategori terlalu panjang'),
  date: z.string().min(1, 'Tanggal wajib diisi').max(100, 'Tanggal terlalu panjang'),
  excerpt: z.string().min(1, 'Ringkasan wajib diisi').max(500, 'Ringkasan terlalu panjang'),
  author: z.string().min(1, 'Penulis wajib diisi').max(120, 'Nama penulis terlalu panjang'),
  content: z.array(z.string()).max(500),
  contentMarkdown: z.string().max(100000, 'Konten terlalu panjang').optional(),
  coverImage: imageUrlSchema,
})

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Data tidak valid'
}

// Public surfaces are statically generated, so every mutation must invalidate the
// detail page, its listing, the home page and the sitemap — otherwise the site
// keeps serving stale (or deleted) content until the next deploy.
function revalidateProductSurfaces(slug?: string): void {
  revalidatePath('/produk', 'page')
  if (slug) revalidatePath(`/produk/${slug}`, 'page')
  revalidatePath('/', 'page')
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin', 'layout')
}

function revalidateBlogSurfaces(slug?: string): void {
  revalidatePath('/blog', 'page')
  if (slug) revalidatePath(`/blog/${slug}`, 'page')
  revalidatePath('/', 'page')
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin', 'layout')
}

// Product mutators
export async function saveProduct(
  product: Product,
  isNew: boolean
): Promise<{ success: boolean; error?: string }> {
  const isAuthed = await checkAdminSession()
  if (!isAuthed) {
    return { success: false, error: 'Tidak terotorisasi' }
  }

  const parsed = productSchema.safeParse(product)
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) }
  }
  const validProduct = { ...product, ...parsed.data } as Product

  try {
    if (isNew) {
      const products = await readProducts()
      const exists = products.some((p) => p.slug === validProduct.slug)
      if (exists) {
        return { success: false, error: 'Slug produk sudah digunakan' }
      }
      await insertProduct(validProduct)
    } else {
      await updateProduct(validProduct)
    }
    revalidateProductSurfaces(validProduct.slug)
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Terjadi kesalahan sistem' }
  }
}

export async function deleteProduct(slug: string): Promise<{ success: boolean; error?: string }> {
  const isAuthed = await checkAdminSession()
  if (!isAuthed) {
    return { success: false, error: 'Tidak terotorisasi' }
  }

  try {
    await deleteProductBySlug(slug)
    revalidateProductSurfaces(slug)
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Terjadi kesalahan sistem' }
  }
}

// Blog mutators
export async function saveBlog(
  post: BlogPost,
  isNew: boolean
): Promise<{ success: boolean; error?: string }> {
  const isAuthed = await checkAdminSession()
  if (!isAuthed) {
    return { success: false, error: 'Tidak terotorisasi' }
  }

  const parsed = blogSchema.safeParse(post)
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) }
  }

  // The admin form accepts free-format dates; normalize on write so the public
  // pages never receive an unparsable value.
  const validPost = {
    ...post,
    ...parsed.data,
    date: normalizeDateInput(parsed.data.date),
  } as BlogPost

  try {
    if (isNew) {
      const blogs = await readBlogs()
      const exists = blogs.some((b) => b.slug === validPost.slug)
      if (exists) {
        return { success: false, error: 'Slug artikel sudah digunakan' }
      }
      await insertBlog(validPost)
    } else {
      await updateBlog(validPost)
    }
    revalidateBlogSurfaces(validPost.slug)
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Terjadi kesalahan sistem' }
  }
}

export async function deleteBlog(slug: string): Promise<{ success: boolean; error?: string }> {
  const isAuthed = await checkAdminSession()
  if (!isAuthed) {
    return { success: false, error: 'Tidak terotorisasi' }
  }

  try {
    await deleteBlogBySlug(slug)
    revalidateBlogSurfaces(slug)
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Terjadi kesalahan sistem' }
  }
}

// Leads
export async function getLeadsList(): Promise<{ success: boolean; leads: Lead[]; error?: string }> {
  const isAuthed = await checkAdminSession()
  if (!isAuthed) {
    return { success: false, leads: [], error: 'Tidak terotorisasi' }
  }

  try {
    const leads = await readLeads()
    const sorted = [...leads].sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    )
    return { success: true, leads: sorted }
  } catch (err) {
    return { success: false, leads: [], error: (err as Error).message || 'Terjadi kesalahan sistem' }
  }
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
  const isAuthed = await checkAdminSession()
  if (!isAuthed) {
    return { success: false, error: 'Tidak terotorisasi' }
  }

  try {
    await deleteLeadById(id)
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Terjadi kesalahan sistem' }
  }
}

// Demo Requests
export async function getDemoRequestsList(): Promise<{ success: boolean; demoRequests: DemoRequest[]; error?: string }> {
  const isAuthed = await checkAdminSession()
  if (!isAuthed) {
    return { success: false, demoRequests: [], error: 'Tidak terotorisasi' }
  }

  try {
    const demoRequests = await readDemoRequests()
    return { success: true, demoRequests }
  } catch (err) {
    return { success: false, demoRequests: [], error: (err as Error).message || 'Terjadi kesalahan sistem' }
  }
}

export async function deleteDemoRequest(id: string): Promise<{ success: boolean; error?: string }> {
  const isAuthed = await checkAdminSession()
  if (!isAuthed) {
    return { success: false, error: 'Tidak terotorisasi' }
  }

  try {
    await deleteDemoRequestById(id)
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Terjadi kesalahan sistem' }
  }
}
