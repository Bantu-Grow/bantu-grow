import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AffiliateRegisterForm } from '../affiliate-forms'

vi.mock('@/app/actions/affiliate', () => ({
  registerAffiliateAction: vi.fn(), loginAffiliateAction: vi.fn(), saveBankAccountAction: vi.fn(),
}))

describe('AffiliateRegisterForm', () => {
  it('provides accessible registration fields and terms consent', () => {
    render(<AffiliateRegisterForm />)
    expect(screen.getByRole('textbox', { name: 'Nama lengkap' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Kata sandi')).toHaveAttribute('minlength', '10')
    expect(screen.getByRole('checkbox')).toBeRequired()
    expect(screen.getByRole('link', { name: /ketentuan program/i })).toHaveAttribute('href', '/affiliate/ketentuan')
    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('checkbox')).toBeChecked()
  }, 15_000)
})
