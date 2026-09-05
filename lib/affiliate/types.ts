export type AffiliateStatus = 'pending' | 'active' | 'suspended' | 'rejected'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
export type CommissionStatus = 'held' | 'available' | 'reserved' | 'paid' | 'void'
export type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected' | 'cancelled'
/** Indonesian income-tax withholding category for commissions. */
export type TaxType = 'pph21' | 'pph23'

export interface AffiliateRegistration {
  name: string
  email: string
  password: string
}

export interface AffiliateAccount {
  id: string
  name: string
  email: string
  referralCode: string
  status: AffiliateStatus
  emailVerifiedAt: string | null
  createdAt: string
}

export interface SessionResult {
  token: string
  affiliate: AffiliateAccount
}

export interface ReferralClickInput {
  referralCode: string
  visitorId: string
  ipAddress: string
  userAgent?: string
  landingPath?: string
  now?: Date
}

export interface CreateCustomerInput {
  name: string
  email: string
  affiliateId?: string
}

export interface CreateSubscriptionInput {
  customerId: string
  productCode: string
  periodStart: Date
  periodEnd: Date
}

export interface CreateInvoiceInput {
  subscriptionId: string
  amount: number
  cycleNumber: number
  dueAt: Date
}

export interface AffiliateBankAccount {
  bankName: string
  accountNumber: string
  accountHolder: string
  taxId?: string
  taxType?: TaxType
  taxRateBasisPoints?: number
}

export interface AffiliateReferralSummary {
  id: string
  kind: 'lead' | 'demo'
  createdAt: string
}

export interface AffiliateCommissionSummary {
  id: string
  amount: number
  status: CommissionStatus
  rateBasisPoints: number
  holdUntil: string
  createdAt: string
}

export interface AffiliatePayoutSummary {
  id: string
  amount: number
  status: PayoutStatus
  requestedAt: string
  paidAt: string | null
}

export interface PublicInvoiceView {
  invoiceNumber: string
  customerName: string
  productName: string
  amount: number
  status: InvoiceStatus
  cycleNumber: number
  dueAt: string
  paidAt: string | null
  paymentInstructions: string
}
