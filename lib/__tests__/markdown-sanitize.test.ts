import { describe, it, expect } from 'vitest'
import { renderMarkdown, getBlogHtml } from '../markdown'

describe('renderMarkdown sanitization', () => {
  it('strips script tags from markdown content', () => {
    const html = renderMarkdown('<script>alert(1)</script> hello **world**')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('alert(1)')
  })

  it('strips inline event handlers', () => {
    const html = renderMarkdown('<img src=x onerror=alert(1)>')
    expect(html).not.toContain('onerror')
  })

  it('strips javascript: URLs from links', () => {
    const html = renderMarkdown('[klik](javascript:alert(1))')
    expect(html).not.toContain('javascript:')
  })

  it('strips iframes', () => {
    const html = renderMarkdown('<iframe src="https://evil.example"></iframe>')
    expect(html).not.toContain('<iframe')
  })

  it('preserves legitimate markdown output', () => {
    const html = renderMarkdown('## Judul\n\n- satu\n- dua\n\n[link](https://bantugrow.id)')
    expect(html).toContain('<h2>Judul</h2>')
    expect(html).toContain('<li>satu</li>')
    expect(html).toContain('href="https://bantugrow.id"')
  })

  it('sanitizes legacy string[] content too', () => {
    const html = getBlogHtml({ content: ['<script>alert(1)</script>', 'aman'] })
    expect(html).not.toContain('<script')
    expect(html).toContain('aman')
  })
})
