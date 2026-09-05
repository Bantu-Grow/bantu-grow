import type {
  AffiliateVerificationTemplateInput,
  AffiliateWelcomeTemplateInput,
  CommissionApprovedTemplateInput,
  CommissionReleasedTemplateInput,
  DueReminderTemplateInput,
  EmailMessage,
  InvoicePaidTemplateInput,
  InvoiceTemplateInput,
  OverdueTemplateInput,
  PayoutProcessedTemplateInput,
  PayoutRejectedTemplateInput,
  RenewalReminderTemplateInput,
} from './types'

const CURRENCY = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character)
}

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="id"><body style="font-family:Arial,sans-serif;color:#172033;line-height:1.6"><main style="max-width:600px;margin:auto"><h1>${escapeHtml(title)}</h1>${body}<p>Salam,<br>BantuGrow</p></main></body></html>`
}

function callToAction(url: string, label: string): string {
  return `<p><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#ffffff;border-radius:8px;text-decoration:none">${escapeHtml(label)}</a></p>`
}

export function invoiceEmail(to: string, input: InvoiceTemplateInput): EmailMessage {
  const amount = CURRENCY.format(input.amount)
  const subject = `Invoice ${input.invoiceNumber} dari BantuGrow`
  const cta = input.publicUrl ? callToAction(input.publicUrl, 'Lihat invoice') : ''
  return {
    to, subject, kind: 'invoice', referenceId: input.invoiceNumber,
    text: `Halo ${input.customerName},\n\nInvoice ${input.invoiceNumber} sebesar ${amount} jatuh tempo pada ${input.dueDate}.\n\nInstruksi pembayaran: ${input.paymentInstructions}\n${input.publicUrl ? `Lihat invoice: ${input.publicUrl}\n` : ''}\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.customerName)},</p><p>Invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> sebesar <strong>${escapeHtml(amount)}</strong> jatuh tempo pada ${escapeHtml(input.dueDate)}.</p><p><strong>Instruksi pembayaran:</strong><br>${escapeHtml(input.paymentInstructions)}</p>${cta}`),
  }
}

export function renewalReminderEmail(to: string, input: RenewalReminderTemplateInput): EmailMessage {
  const amount = CURRENCY.format(input.amount)
  const subject = `Pengingat perpanjangan ${input.productName}`
  return {
    to, subject, kind: 'renewal-reminder',
    text: `Halo ${input.customerName},\n\nLangganan ${input.productName} akan diperpanjang pada ${input.renewalDate} sebesar ${amount}.\n\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.customerName)},</p><p>Langganan <strong>${escapeHtml(input.productName)}</strong> akan diperpanjang pada ${escapeHtml(input.renewalDate)} sebesar <strong>${escapeHtml(amount)}</strong>.</p>`),
  }
}

export function dueReminderEmail(to: string, input: DueReminderTemplateInput): EmailMessage {
  const amount = CURRENCY.format(input.amount)
  const subject = `Pengingat: invoice ${input.invoiceNumber} jatuh tempo ${input.reminderCode}`
  const cta = input.publicUrl ? callToAction(input.publicUrl, 'Lihat invoice') : ''
  return {
    to, subject, kind: 'invoice-due-reminder', referenceId: input.invoiceNumber,
    text: `Halo ${input.customerName},\n\nInvoice ${input.invoiceNumber} sebesar ${amount} akan jatuh tempo pada ${input.dueDate}.\n${input.publicUrl ? `Lihat invoice: ${input.publicUrl}\n` : ''}\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.customerName)},</p><p>Invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> sebesar <strong>${escapeHtml(amount)}</strong> akan jatuh tempo pada ${escapeHtml(input.dueDate)}.</p>${cta}`),
  }
}

export function overdueEmail(to: string, input: OverdueTemplateInput): EmailMessage {
  const amount = CURRENCY.format(input.amount)
  const subject = `Invoice ${input.invoiceNumber} telah jatuh tempo`
  const cta = input.publicUrl ? callToAction(input.publicUrl, 'Lihat invoice') : ''
  return {
    to, subject, kind: 'invoice-overdue', referenceId: input.invoiceNumber,
    text: `Halo ${input.customerName},\n\nInvoice ${input.invoiceNumber} sebesar ${amount} telah melewati jatuh tempo pada ${input.dueDate}. Mohon segera lakukan pembayaran.\n${input.publicUrl ? `Lihat invoice: ${input.publicUrl}\n` : ''}\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.customerName)},</p><p>Invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> sebesar <strong>${escapeHtml(amount)}</strong> telah melewati jatuh tempo pada ${escapeHtml(input.dueDate)}. Mohon segera lakukan pembayaran.</p>${cta}`),
  }
}

export function invoicePaidEmail(to: string, input: InvoicePaidTemplateInput): EmailMessage {
  const amount = CURRENCY.format(input.amount)
  const subject = `Pembayaran invoice ${input.invoiceNumber} diterima`
  return {
    to, subject, kind: 'invoice-paid', referenceId: input.invoiceNumber,
    text: `Halo ${input.customerName},\n\nPembayaran invoice ${input.invoiceNumber} sebesar ${amount} telah kami terima pada ${input.paidDate}. Terima kasih.\n\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.customerName)},</p><p>Pembayaran invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> sebesar <strong>${escapeHtml(amount)}</strong> telah kami terima pada ${escapeHtml(input.paidDate)}. Terima kasih.</p>`),
  }
}

export function affiliateVerificationEmail(to: string, input: AffiliateVerificationTemplateInput): EmailMessage {
  const subject = 'Verifikasi email afiliasi BantuGrow'
  return {
    to, subject, kind: 'affiliate-verification',
    text: `Halo ${input.affiliateName},\n\nVerifikasi email Anda: ${input.verificationUrl}\nTautan berlaku 24 jam.\n\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.affiliateName)},</p><p><a href="${escapeHtml(input.verificationUrl)}">Verifikasi email Anda</a></p><p>Tautan berlaku 24 jam.</p>`),
  }
}

export function affiliateWelcomeEmail(to: string, input: AffiliateWelcomeTemplateInput): EmailMessage {
  const subject = 'Selamat datang di Program Afiliasi BantuGrow'
  return {
    to, subject, kind: 'affiliate-welcome', referenceId: input.referralCode,
    text: `Halo ${input.affiliateName},\n\nKode referral Anda: ${input.referralCode}\nDashboard: ${input.dashboardUrl}\n\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.affiliateName)},</p><p>Kode referral Anda: <strong>${escapeHtml(input.referralCode)}</strong></p><p><a href="${escapeHtml(input.dashboardUrl)}">Buka dashboard afiliasi</a></p>`),
  }
}

export function commissionApprovedEmail(to: string, input: CommissionApprovedTemplateInput): EmailMessage {
  const amount = CURRENCY.format(input.amount)
  const subject = 'Komisi afiliasi Anda telah disetujui'
  return {
    to, subject, kind: 'commission-approved',
    text: `Halo ${input.affiliateName},\n\nKomisi ${amount} untuk pelanggan ${input.customerName} telah disetujui.\n\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.affiliateName)},</p><p>Komisi <strong>${escapeHtml(amount)}</strong> untuk pelanggan ${escapeHtml(input.customerName)} telah disetujui.</p>`),
  }
}

export function commissionReleasedEmail(to: string, input: CommissionReleasedTemplateInput): EmailMessage {
  const amount = CURRENCY.format(input.amount)
  const subject = 'Komisi Anda siap dicairkan'
  return {
    to, subject, kind: 'commission-released',
    text: `Halo ${input.affiliateName},\n\n${input.releasedCount} komisi senilai ${amount} telah melewati masa penahanan dan siap untuk dicairkan.\n\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.affiliateName)},</p><p><strong>${input.releasedCount}</strong> komisi senilai <strong>${escapeHtml(amount)}</strong> telah melewati masa penahanan dan siap untuk dicairkan.</p>`),
  }
}

export function payoutProcessedEmail(to: string, input: PayoutProcessedTemplateInput): EmailMessage {
  const gross = CURRENCY.format(input.grossAmount)
  const tax = CURRENCY.format(input.taxAmount)
  const net = CURRENCY.format(input.netAmount)
  const subject = 'Payout komisi Anda telah diproses'
  return {
    to, subject, kind: 'payout-processed',
    text: `Halo ${input.affiliateName},\n\nPayout sebesar ${net} (kotor ${gross}, pajak ${tax}) telah kami transfer. Referensi: ${input.transferReference}.\n\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.affiliateName)},</p><p>Payout sebesar <strong>${escapeHtml(net)}</strong> telah kami transfer.</p><p>Kotor: ${escapeHtml(gross)}<br>PPh: ${escapeHtml(tax)}<br>Referensi transfer: <strong>${escapeHtml(input.transferReference)}</strong></p>`),
  }
}

export function payoutRejectedEmail(to: string, input: PayoutRejectedTemplateInput): EmailMessage {
  const amount = CURRENCY.format(input.amount)
  const subject = 'Permintaan payout Anda ditolak'
  const reason = input.reason ? `\n\nAlasan: ${input.reason}` : ''
  const reasonHtml = input.reason ? `<p>Alasan: ${escapeHtml(input.reason)}</p>` : ''
  return {
    to, subject, kind: 'payout-rejected',
    text: `Halo ${input.affiliateName},\n\nPermintaan payout sebesar ${amount} tidak dapat kami proses.${reason}\nKomisi dikembalikan ke saldo tersedia.\n\nSalam,\nBantuGrow`,
    html: layout(subject, `<p>Halo ${escapeHtml(input.affiliateName)},</p><p>Permintaan payout sebesar <strong>${escapeHtml(amount)}</strong> tidak dapat kami proses.${reasonHtml}</p><p>Komisi dikembalikan ke saldo tersedia.</p>`),
  }
}
