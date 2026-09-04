'use client'

import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * Client-safe markdown renderer for browser-only consumers (e.g. the admin
 * live preview). In the browser, dompurify binds itself to the global window,
 * so no jsdom is needed — keeping this module free of Node-only dependencies.
 *
 * The server counterpart lives in lib/markdown.ts (jsdom-backed, server-only).
 * Both MUST use the same sanitize configuration.
 */
export function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button'],
    FORBID_ATTR: ['style', 'srcset', 'formaction', 'form'],
  })
}
