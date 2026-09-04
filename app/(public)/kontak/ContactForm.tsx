'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import { submitLead, type SubmitLeadResult } from '@/app/actions/submit-lead'
import { copy } from '@/content/copy'
import type { Product } from '@/content/products'
import type { ContactInput } from '@/lib/contact-validation'
import { AlertCircle, CheckCircle, RotateCcw } from 'lucide-react'

interface Props {
  products: Product[]
  preSelectedSlug?: string
  preFilledMessage?: string
}

const initialState: SubmitLeadResult | null = null

async function submitAction(
  _prev: SubmitLeadResult | null,
  formData: FormData
): Promise<SubmitLeadResult> {
  const input: ContactInput = {
    name: (formData.get('name') as string) ?? '',
    email: (formData.get('email') as string) ?? '',
    message: (formData.get('message') as string) ?? '',
    productSlug: (formData.get('productSlug') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    companyName: (formData.get('companyName') as string) || undefined,
  }
  const honeypot = (formData.get('company_url') as string) ?? ''
  return submitLead(input, honeypot)
}

export function ContactForm({ products, preSelectedSlug, preFilledMessage }: Props) {
  const [state, formAction, isPending] = useActionState(submitAction, initialState)
  const [showForm, setShowForm] = useState(true)

  const retained =
    state?.status === 'validation_error'
      ? state.result.values
      : state?.status === 'server_error'
        ? state.values
        : null

  const errors =
    state?.status === 'validation_error' ? state.result.errors : []

  const getError = (field: 'name' | 'email' | 'message') =>
    errors.find((e) => e.field === field)

  if (state?.status === 'success' && showForm) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"
      >
        <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4 animate-bounce motion-reduce:animate-none" />
        <h2 className="text-xl font-bold text-foreground mb-2">Pesan Terkirim!</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">{copy.contactSuccessMessage}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(false)}
          className="inline-flex items-center gap-2"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Kirim Pesan Lagi
        </Button>
      </div>
    )
  }

  // If user clicked "Kirim Pesan Lagi", reset and show form
  // We use a key trick: when showForm goes to false, we render the form fresh

  return (
    <form action={formAction} className="w-full flex flex-col gap-6" noValidate key={showForm ? 'active' : 'reset'}>
      {/* Honeypot field - hidden from real users, bots will fill this */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company_url">Company URL</label>
        <input type="text" id="company_url" name="company_url" tabIndex={-1} autoComplete="off" />
      </div>

      {state?.status === 'server_error' && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      <FieldGroup>
        {/* Name */}
        <Field data-invalid={!!getError('name')}>
          <FieldLabel htmlFor="name">{copy.contactNameLabel}</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={copy.contactNamePlaceholder}
            defaultValue={retained?.name ?? ''}
            aria-describedby={getError('name') ? 'name-error' : undefined}
            aria-invalid={!!getError('name')}
            autoComplete="name"
          />
          {getError('name') && (
            <FieldError id="name-error" role="alert">
              {copy.validationNameRequired}
            </FieldError>
          )}
        </Field>

        {/* Email */}
        <Field data-invalid={!!getError('email')}>
          <FieldLabel htmlFor="email">{copy.contactEmailLabel2}</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={copy.contactEmailPlaceholder}
            defaultValue={retained?.email ?? ''}
            aria-describedby={getError('email') ? 'email-error' : undefined}
            aria-invalid={!!getError('email')}
            autoComplete="email"
          />
          {getError('email') && (
            <FieldError id="email-error" role="alert">
              {getError('email')!.code === 'invalid_email'
                ? copy.validationEmailInvalid
                : copy.validationEmailRequired}
            </FieldError>
          )}
        </Field>

        {/* WhatsApp / Phone (optional) */}
        <Field>
          <FieldLabel htmlFor="phone">Nomor WhatsApp (Opsional)</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            defaultValue={retained?.phone ?? ''}
            autoComplete="tel"
          />
        </Field>

        {/* Company Name (optional) */}
        <Field>
          <FieldLabel htmlFor="companyName">Nama Perusahaan (Opsional)</FieldLabel>
          <Input
            id="companyName"
            name="companyName"
            type="text"
            placeholder="Nama perusahaan atau usaha Anda"
            defaultValue={retained?.companyName ?? ''}
            autoComplete="organization"
          />
        </Field>

        {/* Product subject (optional) */}
        <Field>
          <FieldLabel htmlFor="productSlug">{copy.contactProductLabel}</FieldLabel>
          <select
            id="productSlug"
            name="productSlug"
            defaultValue={retained?.productSlug ?? preSelectedSlug ?? ''}
            className="flex h-8 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-medium text-foreground/80 dark:bg-card"
            aria-label={copy.contactProductLabel}
          >
            <option value="">{copy.contactProductPlaceholder}</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Message */}
        <Field data-invalid={!!getError('message')}>
          <FieldLabel htmlFor="message">{copy.contactMessageLabel}</FieldLabel>
          <Textarea
            id="message"
            name="message"
            placeholder={copy.contactMessagePlaceholder}
            defaultValue={retained?.message ?? preFilledMessage ?? ''}
            rows={5}
            aria-describedby={getError('message') ? 'message-error' : undefined}
            aria-invalid={!!getError('message')}
          />
          {getError('message') && (
            <FieldError id="message-error" role="alert">
              {copy.validationMessageRequired}
            </FieldError>
          )}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isPending} className="w-full mt-2 font-bold">
        {isPending ? 'Mengirim...' : copy.contactSubmitButton}
      </Button>
    </form>
  )
}
