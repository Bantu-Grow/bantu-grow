#!/usr/bin/env node
/**
 * SQLite online backup for BantuGrow.
 *
 * Usage:  node scripts/backup-db.mjs [target-directory]
 * Env:    DATABASE_PATH (default content/data/bantugrow.db)
 *         BACKUP_DIR    (default ./backups)
 *
 * Uses SQLite "VACUUM INTO" so the snapshot is consistent while the app
 * remains online (WAL mode). Older snapshots beyond BACKUP_RETENTION_COUNT
 * are removed.
 */
import fs from 'node:fs'
import path from 'node:path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const RETENTION = Number(process.env.BACKUP_RETENTION_COUNT ?? 7)

async function main() {
  const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'content/data/bantugrow.db')
  const targetDir = process.argv[2] ?? process.env.BACKUP_DIR ?? path.join(process.cwd(), 'backups')
  fs.mkdirSync(targetDir, { recursive: true })
  const target = path.join(targetDir, `bantugrow-${new Date().toISOString().replace(/[:.]/g, '-')}.db`)

  const db = await open({ filename: dbPath, driver: sqlite3.Database })
  await db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`)
  await db.close()

  // Rotate older snapshots.
  const files = fs.readdirSync(targetDir)
    .filter((name) => name.startsWith('bantugrow-') && name.endsWith('.db'))
    .sort()
  for (const stale of files.slice(0, Math.max(0, files.length - RETENTION))) {
    fs.unlinkSync(path.join(targetDir, stale))
  }

  const bytes = fs.statSync(target).size
  process.stdout.write(`Backup written: ${target} (${bytes} bytes)\n`)
}

main().catch((error) => {
  process.stderr.write(`Backup failed: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
