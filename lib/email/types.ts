export type EmailKind =
  | 'invoice'
  | 'renewal-reminder'
  | 'invoice-due-reminder'
  | 'invoice-overdue'
  | 'affiliate-welcome'
  | 'affiliate-verification'
  | 'commission-approved'
  | 'invoice-paid'
  | 'commission-released'
  | 'payout-processed'
  | 'payout-rejected'

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
  kind: EmailKind
  referenceId?: string
}

export interface InvoiceTemplateInput {
  customerName: string
  invoiceNumber: string
  amount: number
  dueDate: string
  paymentInstructions: string
  publicUrl?: string
}

export interface RenewalReminderTemplateInput {
  customerName: string
  productName: string
  renewalDate: string
  amount: number
}

export interface DueReminderTemplateInput {
  customerName: string
  invoiceNumber: string
  amount: number
  dueDate: string
  reminderCode: string
  publicUrl?: string
}

export interface OverdueTemplateInput {
  customerName: string
  invoiceNumber: string
  amount: number
  dueDate: string
  publicUrl?: string
}

export interface InvoicePaidTemplateInput {
  customerName: string
  invoiceNumber: string
  amount: number
  paidDate: string
}

export interface AffiliateWelcomeTemplateInput {
  affiliateName: string
  referralCode: string
  dashboardUrl: string
}

export interface AffiliateVerificationTemplateInput {
  affiliateName: string
  verificationUrl: string
}

export interface CommissionApprovedTemplateInput {
  affiliateName: string
  amount: number
  customerName: string
}

export interface CommissionReleasedTemplateInput {
  affiliateName: string
  amount: number
  releasedCount: number
}

export interface PayoutProcessedTemplateInput {
  affiliateName: string
  grossAmount: number
  taxAmount: number
  netAmount: number
  transferReference: string
}

export interface PayoutRejectedTemplateInput {
  affiliateName: string
  amount: number
  reason?: string
}

export interface SendEmailResult {
  logId: string
  messageId?: string
  status: 'sent' | 'failed'
}
