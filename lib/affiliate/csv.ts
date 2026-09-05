import { getDb } from '@/lib/db'

interface CsvRow { [key: string]: string | number | null | undefined }

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function toCsv(headers: string[], rows: CsvRow[]): string {
  const lines = [headers.map(escapeCsvValue).join(',')]
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvValue(row[header])).join(','))
  }
  return lines.join('\n')
}

/**
 * Monthly CSV for finance: gross, withholding tax (PPh), net payout per email.
 */
export async function generateMonthlyStatementCsv(yearMonth: string): Promise<{ filename: string; csv: string; rowCount: number }> {
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) throw new Error('yearMonth must be YYYY-MM')
  const monthNumber = Number(yearMonth.slice(5))
  if (monthNumber < 1 || monthNumber > 12) throw new Error('yearMonth must be YYYY-MM')
  const db = await getDb()
  const start = `${yearMonth}-01`
  const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth() + 1, 1).toISOString().slice(0, 10)
  const rows = await db.all<Array<{
    payout_id: string; requested_at: string; affiliate_email: string; affiliate_name: string;
    gross: number; tax_type: string | null; tax_rate_basis_points: number; tax_amount: number; net_amount: number;
    status: string; transfer_reference: string | null; bank_account_snapshot: string
  }>>(
    `SELECT p.id payout_id, p.requested_at, a.email affiliate_email, a.name affiliate_name, p.amount gross,
       p.tax_type, p.tax_rate_basis_points, p.tax_amount, p.net_amount, p.status, p.transfer_reference, p.bank_account_snapshot
     FROM affiliate_payouts p JOIN affiliates a ON a.id=p.affiliate_id
     WHERE p.requested_at >= ? AND p.requested_at < ? ORDER BY p.requested_at`,
    [start, end],
  )
  const headers = ['payout_id','requested_at','affiliate_email','affiliate_name','gross','tax_type','tax_rate_basis_points','tax_amount','net_amount','status','transfer_reference']
  const csv = toCsv(headers, rows.map((row) => ({
    payout_id: row.payout_id,
    requested_at: row.requested_at,
    affiliate_email: row.affiliate_email,
    affiliate_name: row.affiliate_name,
    gross: row.gross,
    tax_type: row.tax_type ?? '',
    tax_rate_basis_points: row.tax_rate_basis_points,
    tax_amount: row.tax_amount,
    net_amount: row.net_amount,
    status: row.status,
    transfer_reference: row.transfer_reference ?? '',
  })))
  return { filename: `payouts-${yearMonth}.csv`, csv, rowCount: rows.length }
}
