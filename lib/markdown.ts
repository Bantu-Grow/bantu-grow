import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Renders markdown string to HTML.
 * Uses the 'marked' library for full markdown support
 * (headings, lists, links, quotes, images, code blocks).
 *
 * `marked` does not sanitize, and the result is injected with
 * dangerouslySetInnerHTML, so any admin-authored (or migrated) content could
 * otherwise persist script that runs for every visitor. Sanitizing centrally
 * protects every consumer of this module.
 */
export function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button'],
    FORBID_ATTR: ['style', 'srcset', 'formaction', 'form'],
  })
}

/**
 * Gets rendered HTML from a BlogPost, handling both legacy content (string[])
 * and new contentMarkdown (string) formats.
 */
export function getBlogHtml(post: {
  content: string[]
  contentMarkdown?: string
}): string {
  if (post.contentMarkdown) {
    return renderMarkdown(post.contentMarkdown)
  }
  // Legacy: join paragraphs with double newline and render as markdown
  return renderMarkdown(post.content.join('\n\n'))
}
