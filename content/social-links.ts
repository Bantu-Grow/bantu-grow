export interface SocialLink {
  platform: 'instagram' | 'github'
  url: string
  label: string
}

/**
 * Social media links configuration.
 * Only links with a non-empty, non-placeholder URL will be displayed in the footer.
 * To hide a link, set its url to an empty string.
 */
export const socialLinks: SocialLink[] = [
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/bantugrow/',
    label: 'Instagram',
  },
  {
    platform: 'github',
    url: 'https://github.com/Bantu-Grow',
    label: 'GitHub',
  },
]

/**
 * Returns only social links that have a valid (non-empty, non-placeholder) URL.
 */
export function getActiveSocialLinks(): SocialLink[] {
  return socialLinks.filter((link) => {
    if (!link.url || link.url.trim() === '') return false
    // Filter out obvious placeholder URLs
    if (link.url.includes('placeholder') || link.url === '#') return false
    return true
  })
}
