'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  loginAffiliateAction,
  registerAffiliateAction,
  saveBankAccountAction,
} from '@/app/actions/affiliate'
import type { AffiliateActionState } from '@/app/actions/affiliate'
import type { AffiliateBankAccount } from '@/lib/affiliate'

const initialAffiliateActionState: AffiliateActionState = { status: 'idle', message: '' }

function Message({ state }: { state: AffiliateActionState }) {
  if (state.status === 'idle') return null
  return <p role={state.status === 'error' ? 'alert' : 'status'} className={state.status === 'error' ? 'text-sm text-destructive' : 'text-sm text-emerald-600'}>{state.message}</p>
}

export function AffiliateRegisterForm() {
  const [state, action, pending] = useActionState(registerAffiliateAction, initialAffiliateActionState)
  return <form action={action} className="space-y-4" noValidate>
    <label className="block space-y-2"><span className="text-sm font-semibold">Nama lengkap</span><Input name="name" autoComplete="name" required /></label>
    <label className="block space-y-2"><span className="text-sm font-semibold">Email</span><Input name="email" type="email" autoComplete="email" required /></label>
    <label className="block space-y-2"><span className="text-sm font-semibold">Kata sandi</span><Input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
    <label className="flex items-start gap-2 text-sm text-muted-foreground"><input name="terms" type="checkbox" className="mt-1" required /><span>Saya menyetujui <Link href="/affiliate/ketentuan" className="text-primary underline">ketentuan program afiliasi</Link>.</span></label>
    <Message state={state} />
    <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Mendaftarkan...' : 'Daftar sebagai Affiliate'}</Button>
  </form>
}

export function AffiliateLoginForm() {
  const [state, action, pending] = useActionState(loginAffiliateAction, initialAffiliateActionState)
  return <form action={action} className="space-y-4" noValidate>
    <label className="block space-y-2"><span className="text-sm font-semibold">Email</span><Input name="email" type="email" autoComplete="email" required /></label>
    <label className="block space-y-2"><span className="text-sm font-semibold">Kata sandi</span><Input name="password" type="password" autoComplete="current-password" required /></label>
    <Message state={state} />
    <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Masuk...' : 'Masuk ke Dashboard'}</Button>
  </form>
}

export function AffiliateBankForm({ account }: { account: AffiliateBankAccount | null }) {
  const [state, action, pending] = useActionState(saveBankAccountAction, initialAffiliateActionState)
  return <form action={action} className="grid gap-4 sm:grid-cols-2">
    <label className="space-y-2"><span className="text-sm font-semibold">Nama bank</span><Input name="bankName" defaultValue={account?.bankName} required /></label>
    <label className="space-y-2"><span className="text-sm font-semibold">Nomor rekening</span><Input name="accountNumber" inputMode="numeric" defaultValue={account?.accountNumber} required /></label>
    <label className="space-y-2 sm:col-span-2"><span className="text-sm font-semibold">Nama pemilik rekening</span><Input name="accountHolder" autoComplete="name" defaultValue={account?.accountHolder} required /></label>
    <label className="space-y-2"><span className="text-sm font-semibold">NPWP (opsional)</span><Input name="taxId" defaultValue={account?.taxId} placeholder="00.000.000.0-000.000" /></label>
    <label className="space-y-2"><span className="text-sm font-semibold">Jenis PPh (opsional)</span><select name="taxType" defaultValue={account?.taxType ?? ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Tanpa potongan</option><option value="pph21">PPh 21</option><option value="pph23">PPh 23</option></select></label>
    <label className="space-y-2 sm:col-span-2"><span className="text-sm font-semibold">Tarif PPh (basis poin, opsional)</span><Input name="taxRateBasisPoints" type="number" min={0} max={10000} defaultValue={account?.taxRateBasisPoints ?? ''} /></label>
    <div className="sm:col-span-2"><Message state={state} /></div>
    <Button type="submit" className="sm:col-span-2 sm:w-fit" disabled={pending}>{pending ? 'Menyimpan...' : 'Simpan Rekening'}</Button>
  </form>
}
