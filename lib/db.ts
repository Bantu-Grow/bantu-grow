import sqlite3 from 'sqlite3'
import { open, type Database } from 'sqlite'
import path from 'path'
import fs from 'fs'
import { type Product } from '@/content/products'
import { type BlogPost } from '@/content/blogs'
import { type Lead } from '@/lib/lead-sink'

const DATA_DIR = path.join(process.cwd(), 'content/data')
const PRODUCTS_JSON = path.join(DATA_DIR, 'products.json')
const BLOGS_JSON = path.join(DATA_DIR, 'blogs.json')
const LEADS_JSON = path.join(DATA_DIR, 'leads.json')

let dbInstance: Database | null = null

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance

  const dbPath = process.env.DATABASE_PATH || path.join(DATA_DIR, 'bantugrow.db')

  // Pastikan direktori database ada
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  // 1. Inisialisasi Tabel
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS products (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      niche TEXT NOT NULL,
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      features TEXT NOT NULL,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS blogs (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      content_markdown TEXT,
      cover_image TEXT
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      received_at TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      product_slug TEXT,
      phone TEXT,
      company_name TEXT
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      email TEXT PRIMARY KEY,
      subscribed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('admin', 'editor')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS demo_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      product_interest TEXT,
      preferred_time TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `)

  // 2. Migration: ensure leads table has id column as PRIMARY KEY
  // Clean up any orphaned leads_new from a previous failed migration
  await dbInstance.exec(`DROP TABLE IF EXISTS leads_new`)

  const leadsColumns = (await dbInstance.all(`PRAGMA table_info(leads)`)) as { name: string }[]
  const leadsColumnNames = new Set(leadsColumns.map((c) => c.name))
  const hasIdColumn = leadsColumnNames.has('id')
  const hasPhoneColumn = leadsColumnNames.has('phone')
  const hasCompanyNameColumn = leadsColumnNames.has('company_name')
  let leadsTableRebuilt = false

  if (leadsColumns.length > 0 && !hasIdColumn) {
    // The legacy table has no `id` column, so the generated id is derived from
    // rowid (stable and unique) instead of selecting a column that doesn't exist.
    const legacyPhoneSelect = hasPhoneColumn ? 'phone' : 'NULL'
    const legacyCompanySelect = hasCompanyNameColumn ? 'company_name' : 'NULL'

    try {
      await dbInstance.exec('BEGIN')
      await dbInstance.exec(`
        CREATE TABLE leads_new (
          id TEXT PRIMARY KEY,
          received_at TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          product_slug TEXT,
          phone TEXT,
          company_name TEXT
        );
        INSERT INTO leads_new (id, received_at, name, email, message, product_slug, phone, company_name)
          SELECT 'legacy-' || CAST(rowid AS TEXT), received_at, name, email, message, product_slug, ${legacyPhoneSelect}, ${legacyCompanySelect} FROM leads;
        DROP TABLE leads;
        ALTER TABLE leads_new RENAME TO leads;
      `)
      await dbInstance.exec('COMMIT')
      leadsTableRebuilt = true
    } catch (err) {
      await dbInstance.exec('ROLLBACK')
      throw err
    }
  }

  // 2b. Migration: add phone and company_name columns to leads if missing.
  // Skipped when the table was just rebuilt above (it already has both columns).
  if (!leadsTableRebuilt && !hasPhoneColumn) {
    await dbInstance.exec(`ALTER TABLE leads ADD COLUMN phone TEXT`)
  }
  if (!leadsTableRebuilt && !hasCompanyNameColumn) {
    await dbInstance.exec(`ALTER TABLE leads ADD COLUMN company_name TEXT`)
  }

  // 3. Migration: add content_markdown and cover_image columns to blogs if missing
  const blogsSchema = await dbInstance.get<{ sql: string }>(
    `SELECT sql FROM sqlite_master WHERE type='table' AND name='blogs'`
  )
  if (blogsSchema && !blogsSchema.sql.includes('content_markdown')) {
    await dbInstance.exec(`ALTER TABLE blogs ADD COLUMN content_markdown TEXT`)
  }
  if (blogsSchema && !blogsSchema.sql.includes('cover_image')) {
    await dbInstance.exec(`ALTER TABLE blogs ADD COLUMN cover_image TEXT`)
  }

  // 4. Migration: add image column to products if missing
  const productsSchema = await dbInstance.get<{ sql: string }>(
    `SELECT sql FROM sqlite_master WHERE type='table' AND name='products'`
  )
  if (productsSchema && !productsSchema.sql.includes('image')) {
    await dbInstance.exec(`ALTER TABLE products ADD COLUMN image TEXT`)
  }

  // 5. Auto-seeding jika database kosong
  const productCountResult = await dbInstance.get<{ count: number }>('SELECT COUNT(*) as count FROM products')
  if (productCountResult && productCountResult.count === 0) {
    if (fs.existsSync(PRODUCTS_JSON)) {
      try {
        const raw = fs.readFileSync(PRODUCTS_JSON, 'utf8')
        const items = JSON.parse(raw) as Product[]
        for (const item of items) {
          await dbInstance.run(
            `INSERT OR IGNORE INTO products (slug, name, niche, short_description, full_description, features, image) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [item.slug, item.name, item.niche, item.shortDescription, item.fullDescription, JSON.stringify(item.features), item.image || null]
          )
        }
      } catch (err) {
        console.error('Failed to seed products from JSON:', err)
      }
    }
  }

  const blogCountResult = await dbInstance.get<{ count: number }>('SELECT COUNT(*) as count FROM blogs')
  if (blogCountResult && blogCountResult.count === 0) {
    if (fs.existsSync(BLOGS_JSON)) {
      try {
        const raw = fs.readFileSync(BLOGS_JSON, 'utf8')
        const items = JSON.parse(raw) as BlogPost[]
        for (const item of items) {
          await dbInstance.run(
            `INSERT OR IGNORE INTO blogs (slug, title, category, date, excerpt, author, content, content_markdown, cover_image) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [item.slug, item.title, item.category, item.date, item.excerpt, item.author, JSON.stringify(item.content), item.contentMarkdown || null, item.coverImage || null]
          )
        }
      } catch (err) {
        console.error('Failed to seed blogs from JSON:', err)
      }
    }
  }

  const leadCountResult = await dbInstance.get<{ count: number }>('SELECT COUNT(*) as count FROM leads')
  if (leadCountResult && leadCountResult.count === 0) {
    if (fs.existsSync(LEADS_JSON)) {
      try {
        const raw = fs.readFileSync(LEADS_JSON, 'utf8')
        const items = JSON.parse(raw) as Lead[]
        for (const item of items) {
          await dbInstance.run(
            `INSERT OR IGNORE INTO leads (id, received_at, name, email, message, product_slug) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [item.id, item.receivedAt, item.name, item.email, item.message, item.productSlug || null]
          )
        }
      } catch (err) {
        console.error('Failed to seed leads from JSON:', err)
      }
    }
  }

  return dbInstance
}

// ─── Products CRUD ─────────────────────────────────────────────────────────────

export async function readProducts(): Promise<Product[]> {
  const db = await getDb()
  try {
    const rows = await db.all<{
      slug: string
      name: string
      niche: string
      short_description: string
      full_description: string
      features: string
      image: string | null
    }[]>('SELECT * FROM products')

    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      niche: row.niche,
      shortDescription: row.short_description,
      fullDescription: row.full_description,
      features: JSON.parse(row.features),
      image: row.image || undefined,
    }))
  } catch (err) {
    console.error('Error reading products from SQLite:', err)
    return []
  }
}

export async function insertProduct(product: Product): Promise<void> {
  const db = await getDb()
  await db.run(
    `INSERT INTO products (slug, name, niche, short_description, full_description, features, image) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [product.slug, product.name, product.niche, product.shortDescription, product.fullDescription, JSON.stringify(product.features), product.image || null]
  )
}

export async function updateProduct(product: Product): Promise<void> {
  const db = await getDb()
  const result = await db.run(
    `UPDATE products SET name = ?, niche = ?, short_description = ?, full_description = ?, features = ?, image = ? WHERE slug = ?`,
    [product.name, product.niche, product.shortDescription, product.fullDescription, JSON.stringify(product.features), product.image || null, product.slug]
  )
  if (result.changes === 0) {
    throw new Error('Product not found')
  }
}

export async function deleteProductBySlug(slug: string): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM products WHERE slug = ?', [slug])
}

// ─── Blogs CRUD ────────────────────────────────────────────────────────────────

export async function readBlogs(): Promise<BlogPost[]> {
  const db = await getDb()
  try {
    const rows = await db.all<{
      slug: string
      title: string
      category: string
      date: string
      excerpt: string
      author: string
      content: string
      content_markdown: string | null
      cover_image: string | null
    }[]>('SELECT * FROM blogs')

    return rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      category: row.category,
      date: row.date,
      excerpt: row.excerpt,
      author: row.author,
      content: JSON.parse(row.content),
      contentMarkdown: row.content_markdown || undefined,
      coverImage: row.cover_image || undefined,
    }))
  } catch (err) {
    console.error('Error reading blogs from SQLite:', err)
    return []
  }
}

export async function insertBlog(blog: BlogPost): Promise<void> {
  const db = await getDb()
  await db.run(
    `INSERT INTO blogs (slug, title, category, date, excerpt, author, content, content_markdown, cover_image) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [blog.slug, blog.title, blog.category, blog.date, blog.excerpt, blog.author, JSON.stringify(blog.content), blog.contentMarkdown || null, blog.coverImage || null]
  )
}

export async function updateBlog(blog: BlogPost): Promise<void> {
  const db = await getDb()
  const result = await db.run(
    `UPDATE blogs SET title = ?, category = ?, date = ?, excerpt = ?, author = ?, content = ?, content_markdown = ?, cover_image = ? WHERE slug = ?`,
    [blog.title, blog.category, blog.date, blog.excerpt, blog.author, JSON.stringify(blog.content), blog.contentMarkdown || null, blog.coverImage || null, blog.slug]
  )
  if (result.changes === 0) {
    throw new Error('Blog not found')
  }
}

export async function deleteBlogBySlug(slug: string): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM blogs WHERE slug = ?', [slug])
}

// ─── Leads CRUD ────────────────────────────────────────────────────────────────

export async function readLeads(): Promise<Lead[]> {
  const db = await getDb()
  try {
    const rows = await db.all<{
      id: string
      received_at: string
      name: string
      email: string
      message: string
      product_slug: string | null
      phone: string | null
      company_name: string | null
    }[]>('SELECT * FROM leads')

    return rows.map((row) => ({
      id: row.id,
      receivedAt: row.received_at,
      name: row.name,
      email: row.email,
      message: row.message,
      productSlug: row.product_slug || undefined,
      phone: row.phone || undefined,
      companyName: row.company_name || undefined,
    }))
  } catch (err) {
    console.error('Error reading leads from SQLite:', err)
    return []
  }
}

export async function insertLead(lead: Lead): Promise<void> {
  const db = await getDb()
  await db.run(
    `INSERT INTO leads (id, received_at, name, email, message, product_slug, phone, company_name) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [lead.id, lead.receivedAt, lead.name, lead.email, lead.message, lead.productSlug || null, lead.phone || null, lead.companyName || null]
  )
}

export async function deleteLeadById(id: string): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM leads WHERE id = ?', [id])
}

// ─── Demo Requests CRUD ────────────────────────────────────────────────────────

export interface DemoRequest {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  productInterest?: string
  preferredTime?: string
  createdAt: string
}

export async function insertDemoRequest(request: DemoRequest): Promise<void> {
  const db = await getDb()
  await db.run(
    `INSERT INTO demo_requests (id, name, email, phone, company, product_interest, preferred_time, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [request.id, request.name, request.email, request.phone || null, request.company || null, request.productInterest || null, request.preferredTime || null, request.createdAt]
  )
}

export async function readDemoRequests(): Promise<DemoRequest[]> {
  const db = await getDb()
  try {
    const rows = await db.all<{
      id: string
      name: string
      email: string
      phone: string | null
      company: string | null
      product_interest: string | null
      preferred_time: string | null
      created_at: string
    }[]>('SELECT * FROM demo_requests ORDER BY created_at DESC')

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || undefined,
      company: row.company || undefined,
      productInterest: row.product_interest || undefined,
      preferredTime: row.preferred_time || undefined,
      createdAt: row.created_at,
    }))
  } catch (err) {
    console.error('Error reading demo requests from SQLite:', err)
    return []
  }
}

export async function deleteDemoRequestById(id: string): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM demo_requests WHERE id = ?', [id])
}

// ─── Admin Sessions ────────────────────────────────────────────────────────────
// Session tokens are persisted so they survive process restarts and are shared
// across replicas (the previous in-memory Set logged everyone out on redeploy).

export async function createAdminSession(token: string, ttlMs: number): Promise<void> {
  const db = await getDb()
  const now = Date.now()
  await db.run(
    `INSERT OR REPLACE INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)`,
    [token, new Date(now).toISOString(), new Date(now + ttlMs).toISOString()]
  )
}

export async function isAdminSessionValid(token: string): Promise<boolean> {
  const db = await getDb()
  const row = await db.get<{ expires_at: string }>(
    'SELECT expires_at FROM admin_sessions WHERE token = ?',
    [token]
  )
  if (!row) return false

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await db.run('DELETE FROM admin_sessions WHERE token = ?', [token])
    return false
  }
  return true
}

export async function deleteAdminSession(token: string): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM admin_sessions WHERE token = ?', [token])
}

export async function deleteExpiredAdminSessions(): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM admin_sessions WHERE expires_at <= ?', [new Date().toISOString()])
}

// ─── Admin Users (Multi-user structural prep) ──────────────────────────────────
// TODO: Full multi-user migration - replace single-password login with per-user auth.
// Currently the admin login still uses the single ADMIN_PASSWORD environment variable.
// When ready to migrate:
// 1. Seed admin_users table with bcrypt-hashed passwords
// 2. Update loginAdmin action to verify against admin_users table
// 3. Add session/JWT with user role info
// 4. Implement role-based access (admin: full access, editor: blogs only)

export async function seedDefaultAdminUser(): Promise<void> {
  const db = await getDb()
  const existing = await db.get<{ id: string }>('SELECT id FROM admin_users LIMIT 1')
  if (!existing) {
    // Seed a default admin user placeholder
    // In production, replace with a proper bcrypt hash
    await db.run(
      `INSERT OR IGNORE INTO admin_users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), 'admin', '/* TODO: bcrypt hash of actual password */', 'admin', new Date().toISOString()]
    )
  }
}
