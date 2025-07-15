import * as DOMPurify from 'isomorphic-dompurify'

export interface SanitizationConfig {
  allowedTags?: string[]
  allowedAttributes?: string[]
  maxLength?: number
  removeHTMLCompletely?: boolean
}

export const sanitizeHTML = (
  input: string,
  config: SanitizationConfig = {},
): string => {
  if (!input || typeof input !== 'string') {
    return ''
  }

  const {
    allowedTags = [],
    allowedAttributes = [],
    maxLength,
    removeHTMLCompletely = false,
  } = config

  let sanitized: string

  if (removeHTMLCompletely) {
    sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
  } else {
    sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      KEEP_CONTENT: true,
    })
  }

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim()
  }

  return sanitized
}

export const sanitizePlainText = (
  input: string,
  maxLength?: number,
): string => {
  const config: SanitizationConfig = {
    removeHTMLCompletely: true,
  }
  if (maxLength !== undefined) {
    config.maxLength = maxLength
  }
  return sanitizeHTML(input, config)
}

export const sanitizeRichText = (input: string, maxLength?: number): string => {
  const config: SanitizationConfig = {
    allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    allowedAttributes: [],
  }
  if (maxLength !== undefined) {
    config.maxLength = maxLength
  }
  return sanitizeHTML(input, config)
}

export const validateAndSanitizeURL = (input: string): string => {
  if (!input || typeof input !== 'string') {
    throw new Error('URL is required')
  }

  const sanitized = sanitizePlainText(input, 500)

  if (!sanitized.match(/^https?:\/\//)) {
    throw new Error('URL must use HTTP or HTTPS protocol')
  }

  try {
    new URL(sanitized)
    return sanitized
  } catch {
    throw new Error('Invalid URL format')
  }
}

export const validateSlug = (input: string, maxLength = 50): string => {
  if (!input || typeof input !== 'string') {
    throw new Error('Slug is required')
  }

  const sanitized = sanitizePlainText(input, maxLength)

  if (!sanitized.match(/^[a-z0-9-]+$/)) {
    throw new Error(
      'Slug can only contain lowercase letters, numbers, and hyphens',
    )
  }

  if (sanitized.length < 1) {
    throw new Error('Slug cannot be empty')
  }

  return sanitized
}
