'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { submitLead, type SubmitLeadResult } from '@/app/actions/submit-lead'
import { StatusMessage } from '@/components/public-page'
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

export function ContactForm(props: Props) {
  const [attempt, setAttempt] = useState(0)
  return (
    <ContactFormBody
      key={attempt}
      {...props}
      onReset={() => setAttempt((value) => value + 1)}
    />
  )
}

function ContactFormBody({
  products,
  preSelectedSlug,
  preFilledMessage,
  onReset,
}: Props & { onReset: () => void }) {
  const [state, formAction, isPending] = useActionState(
    submitAction,
    initialState
  )

  const retained =
    state?.status === 'validation_error'
      ? state.result.values
      : state?.status === 'server_error'
        ? state.values
        : null

  const errors = state?.status === 'validation_error' ? state.result.errors : []

  const getError = (field: 'name' | 'email' | 'message') =>
    errors.find((e) => e.field === field)

  if (state?.status === 'success') {
    return (
      <div role="status" aria-live="polite">
        <StatusMessage
          title="Pesan terkirim"
          icon={CheckCircle}
          action={
            <Button
              type="button"
              variant="outline"
              size="pill-sm"
              onClick={onReset}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Kirim Pesan Lagi
            </Button>
          }
        >
          {copy.contactSuccessMessage}
        </StatusMessage>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="w-full flex flex-col gap-6"
      noValidate
      aria-busy={isPending}
    >
      {/* Honeypot field - hidden from real users, bots will fill this */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company_url">Company URL</label>
        <input
          type="text"
          id="company_url"
          name="company_url"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state?.status === 'server_error' && (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      <FieldGroup className="grid gap-6 sm:grid-cols-2">
        {/* Name */}
        <Field data-invalid={!!getError('name')}>
          <FieldLabel htmlFor="name">{copy.contactNameLabel}</FieldLabel>
          <Input
            variant="public"
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
            variant="public"
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
            variant="public"
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
          <FieldLabel htmlFor="companyName">
            Nama Perusahaan (Opsional)
          </FieldLabel>
          <Input
            variant="public"
            id="companyName"
            name="companyName"
            type="text"
            placeholder="Nama perusahaan atau usaha Anda"
            defaultValue={retained?.companyName ?? ''}
            autoComplete="organization"
          />
        </Field>

        {/* Product subject (optional) */}
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="productSlug">
            {copy.contactProductLabel}
          </FieldLabel>
          <select
            id="productSlug"
            name="productSlug"
            defaultValue={retained?.productSlug ?? preSelectedSlug ?? ''}
            className="h-12 w-full rounded-xl border bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm"
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
        <Field className="sm:col-span-2" data-invalid={!!getError('message')}>
          <FieldLabel htmlFor="message">{copy.contactMessageLabel}</FieldLabel>
          <Textarea
            className="min-h-36 rounded-xl px-4 py-3"
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

      <Button
        type="submit"
        variant="brand"
        size="pill-sm"
        disabled={isPending}
        className="mt-2 w-full"
      >
        {isPending ? 'Mengirim...' : copy.contactSubmitButton}
      </Button>
    </form>
  )
}
