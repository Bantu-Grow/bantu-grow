import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '../ContactForm'
import { submitLead } from '@/app/actions/submit-lead'
import { validateContact } from '@/lib/contact-validation'
import { products } from '@/content/products'

vi.mock('@/app/actions/submit-lead', () => ({ submitLead: vi.fn() }))

beforeEach(() => {
  vi.mocked(submitLead).mockReset()
})

async function fillMessage(
  user: ReturnType<typeof userEvent.setup>,
  email = 'pemilik@example.com'
) {
  await user.type(screen.getByLabelText('Nama Lengkap'), 'Pemilik Usaha')
  await user.type(screen.getByLabelText('Alamat Email'), email)
  await user.type(
    screen.getByLabelText('Pesan'),
    'Saya ingin merapikan stok toko.'
  )
}

describe('Contact submission feedback', () => {
  it('can submit a second message after resetting the success state', async () => {
    vi.mocked(submitLead).mockResolvedValue({ status: 'success' })
    const user = userEvent.setup()
    render(<ContactForm products={products} />)
    await fillMessage(user)
    await user.click(screen.getByRole('button', { name: 'Kirim Pesan' }))
    expect(
      await screen.findByRole('heading', { name: 'Pesan terkirim' })
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Kirim Pesan Lagi' }))
    expect(screen.getByLabelText('Nama Lengkap')).toHaveValue('')
    await fillMessage(user)
    await user.click(screen.getByRole('button', { name: 'Kirim Pesan' }))
    expect(
      await screen.findByRole('heading', { name: 'Pesan terkirim' })
    ).toBeInTheDocument()
    expect(submitLead).toHaveBeenCalledTimes(2)
  })

  it('keeps values and product context after a server error for retry', async () => {
    vi.mocked(submitLead)
      .mockImplementationOnce(async (values) => ({
        status: 'server_error',
        message: 'Coba kirim kembali.',
        values,
      }))
      .mockResolvedValueOnce({ status: 'success' })
    const user = userEvent.setup()
    render(<ContactForm products={products} preSelectedSlug="pos" />)
    await fillMessage(user)
    await user.click(screen.getByRole('button', { name: 'Kirim Pesan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Coba kirim kembali.'
    )
    expect(screen.getByLabelText('Nama Lengkap')).toHaveValue('Pemilik Usaha')
    expect(screen.getByLabelText('Alamat Email')).toHaveValue(
      'pemilik@example.com'
    )
    expect(screen.getByRole('combobox')).toHaveValue('pos')
    await user.click(screen.getByRole('button', { name: 'Kirim Pesan' }))
    expect(
      await screen.findByRole('heading', { name: 'Pesan terkirim' })
    ).toBeInTheDocument()
    expect(submitLead).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: 'Pemilik Usaha',
        productSlug: 'pos',
        message: 'Saya ingin merapikan stok toko.',
      }),
      ''
    )
  })

  it('associates the inline validation error with the email field', async () => {
    vi.mocked(submitLead).mockImplementation(async (input) => ({
      status: 'validation_error',
      result: validateContact(input),
    }))
    const user = userEvent.setup()
    render(<ContactForm products={products} />)
    await fillMessage(user, 'nama@')
    await user.click(screen.getByRole('button', { name: 'Kirim Pesan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Format email tidak valid.'
    )
    expect(screen.getByLabelText('Alamat Email')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    expect(screen.getByLabelText('Alamat Email')).toHaveAccessibleDescription(
      'Format email tidak valid.'
    )
  })
})
