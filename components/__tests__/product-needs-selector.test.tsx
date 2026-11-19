import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductNeedsSelector } from '../product-needs-selector'
import { products } from '@/content/products'

describe('Product needs selector', () => {
  it('updates the recommended product, features, and destination when a need is selected', async () => {
    const user = userEvent.setup()
    render(<ProductNeedsSelector products={products} />)
    expect(screen.getByRole('tab', { name: 'Toko & ritel' })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('tab', { name: 'Travel umroh' }))
    const panel = screen.getByRole('tabpanel')
    expect(within(panel).getByRole('heading')).toHaveTextContent('Management Travel Umroh')
    expect(within(panel).getByText(products[1].features[0])).toBeInTheDocument()
    expect(within(panel).getByRole('link')).toHaveAttribute('href', '/produk/management-travel-umroh')
  })

  it('supports arrow keys and Home/End without losing tab focus', async () => {
    const user = userEvent.setup()
    render(<ProductNeedsSelector products={products} />)
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Travel umroh' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Travel umroh' })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Ibadah & komunitas' })).toHaveAttribute('aria-selected', 'true')
    expect(within(screen.getByRole('tabpanel')).getByRole('link')).toHaveAttribute('href', '/produk/mutabaah-digital')
    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Toko & ritel' })).toHaveAttribute('aria-selected', 'true')
  })

  it('uses the available catalog when a product is removed or renamed', () => {
    render(<ProductNeedsSelector products={[{ ...products[1], name: 'Travel Baru' }]} />)
    expect(screen.getAllByRole('tab')).toHaveLength(1)
    expect(within(screen.getByRole('tabpanel')).getByRole('heading')).toHaveTextContent('Travel Baru')
    expect(screen.queryByRole('link', { name: 'Lihat fitur POS' })).not.toBeInTheDocument()
  })

  it('does not expose empty tabs for an empty catalog', () => {
    render(<ProductNeedsSelector products={[]} />)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })
})
