import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { getDb } from '@/lib/db'
import { BACKUP_RETENTION_COUNT } from './constants'

/**
 * Online SQLite backup via the VACUUM INTO statement. Produces a consistent,
 * compact snapshot without locking out readers and records it for auditing.
 */
export async function createSqliteBackup(now = new Date()): Promise<{ path: string; bytes: number }> {
  const db = await getDb()
  const targetDir = process.env.BACKUP_DIR ?? path.join(process.cwd(), 'backups')
  fs.mkdirSync(targetDir, { recursive: true })
  const target = path.join(targetDir, `bantugrow-${now.toISOString().replace(/[:.]/g, '-')}.db`)
  await db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`)
  const bytes = fs.statSync(target).size

  await db.run('INSERT INTO backup_snapshots (id,path,bytes,created_at) VALUES (?,?,?,?)',
    [randomUUID(), target, bytes, now.toISOString()])

  // Rotate: keep only the newest BACKUP_RETENTION_COUNT snapshots.
  const stale = await db.all<{ id: string; path: string }[]>(
    `SELECT id,path FROM backup_snapshots ORDER BY created_at DESC LIMIT -1 OFFSET ?`,
    [BACKUP_RETENTION_COUNT],
  )
  for (const row of stale) {
    try { fs.unlinkSync(row.path) } catch { /* already removed */ }
    await db.run('DELETE FROM backup_snapshots WHERE id=?', [row.id])
  }
  return { path: target, bytes }
}

/** Lists recorded snapshots for operators verifying the backup schedule. */
export async function listSqliteBackups(): Promise<{ path: string; bytes: number | null; createdAt: string }[]> {
  const db = await getDb()
  const rows = await db.all<{ path: string; bytes: number | null; created_at: string }[]>(
    'SELECT path,bytes,created_at FROM backup_snapshots ORDER BY created_at DESC LIMIT 50')
  return rows.map((row) => ({ path: row.path, bytes: row.bytes, createdAt: row.created_at }))
}
