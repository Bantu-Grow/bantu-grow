import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewsletterForm } from '../newsletter-form'
import { subscribeNewsletter, type SubscribeResult } from '@/app/actions/subscribe-newsletter'

vi.mock('@/app/actions/subscribe-newsletter', () => ({ subscribeNewsletter: vi.fn() }))

beforeEach(() => { vi.mocked(subscribeNewsletter).mockReset() })

describe('Newsletter form', () => {
  it('shows an associated inline error and focuses the invalid email without submitting', async () => {
    const user = userEvent.setup()
    render(<NewsletterForm />)
    const input = screen.getByRole('textbox', { name: /alamat email/i })
    await user.type(input, 'nama@')
    await user.click(screen.getByRole('button', { name: 'Berlangganan' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Masukkan alamat email yang valid')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/Masukkan alamat email yang valid/)
    expect(input).toHaveFocus()
    expect(subscribeNewsletter).not.toHaveBeenCalled()
  })

  it('preserves the email after a server error so the user can retry successfully', async () => {
    const user = userEvent.setup()
    vi.mocked(subscribeNewsletter).mockResolvedValueOnce({ status: 'error', message: 'Coba lagi nanti.' }).mockResolvedValueOnce({ status: 'success' })
    render(<NewsletterForm />)
    const input = screen.getByRole('textbox', { name: /alamat email/i })
    await user.type(input, 'pemilik@usaha.com')
    await user.click(screen.getByRole('button', { name: 'Berlangganan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Coba lagi nanti.')
    expect(input).toHaveValue('pemilik@usaha.com')
    await user.click(screen.getByRole('button', { name: 'Berlangganan' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Terima kasih!')
    expect(subscribeNewsletter).toHaveBeenLastCalledWith('pemilik@usaha.com', '')
  })

  it('prevents duplicate subscriptions while the request is pending', async () => {
    const user = userEvent.setup()
    let complete!: (value: SubscribeResult) => void
    vi.mocked(subscribeNewsletter).mockImplementation(() => new Promise((resolve) => { complete = resolve }))
    render(<NewsletterForm />)
    await user.type(screen.getByRole('textbox'), 'pemilik@usaha.com')
    await user.dblClick(screen.getByRole('button', { name: 'Berlangganan' }))
    await waitFor(() => expect(subscribeNewsletter).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('button', { name: 'Mengirim...' })).toBeDisabled()
    complete({ status: 'success' })
    expect(await screen.findByRole('status')).toHaveTextContent('Terima kasih!')
  })
})
