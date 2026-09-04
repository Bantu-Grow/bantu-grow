import { describe, it, expect, afterEach } from 'vitest'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import fs from 'fs'
import os from 'os'
import path from 'path'

/**
 * Regression test for the legacy `leads` migration.
 *
 * The old branch ran only when the legacy table had NO `id` column, yet its
 * INSERT...SELECT referenced `id`, so sqlite aborted with
 * "no such column: id" and getDb() threw — taking down every DB-backed page.
 */
describe('legacy leads table migration', () => {
  const tempFiles: string[] = []

  afterEach(async () => {
    // Give sqlite a tick to release file handles on Windows
    await new Promise((r) => setTimeout(r, 50))
    for (const file of tempFiles) {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file)
      } catch {
        // Windows may still hold the handle; the temp dir gets cleaned anyway
      }
    }
    tempFiles.length = 0
  })

  async function createLegacyDb(): Promise<string> {
    const file = path.join(os.tmpdir(), `bantugrow-legacy-${Date.now()}-${Math.random()}.db`)
    tempFiles.push(file)

    const db = await open({ filename: file, driver: sqlite3.Database })
    await db.exec(`
      CREATE TABLE leads (
        received_at TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        product_slug TEXT
      )
    `)
    await db.run('INSERT INTO leads VALUES (?, ?, ?, ?, ?)', [
      '2026-01-01T00:00:00.000Z',
      'Legacy User',
      'legacy@test.com',
      'halo',
      'pos',
    ])
    await db.close()
    return file
  }

  it('migrates a legacy schema without an id column and preserves rows', async () => {
    const file = await createLegacyDb()
    const originalPath = process.env.DATABASE_PATH
    process.env.DATABASE_PATH = file

    // Fresh module instance so the cached singleton does not leak between tests
    vi.resetModules()
    const { getDb, readLeads } = await import('../db')

    await expect(getDb()).resolves.toBeDefined()

    const leads = await readLeads()
    expect(leads).toHaveLength(1)
    expect(leads[0].email).toBe('legacy@test.com')
    expect(leads[0].id).toBeTruthy()

    const db = await getDb()
    const columns = (await db.all('PRAGMA table_info(leads)')) as { name: string }[]
    const names = columns.map((c) => c.name)
    expect(names).toContain('id')
    expect(names).toContain('phone')
    expect(names).toContain('company_name')

    await db.close()
    process.env.DATABASE_PATH = originalPath
  })
})
