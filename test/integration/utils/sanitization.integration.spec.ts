import {
  sanitizeHTML,
  validateAndSanitizeURL,
  validateSlug,
} from '../../../src/utils/sanitization'

describe('Sanitization Integration Tests', () => {
  describe('sanitizeHTML', () => {
    it('should return empty string for null input (line 19)', () => {
      const result = sanitizeHTML(null as unknown as string)
      expect(result).toBe('')
    })

    it('should truncate output when maxLength is exceeded (line 42)', () => {
      const longInput =
        'This is a very long text that exceeds the maximum length'
      const result = sanitizeHTML(longInput, { maxLength: 20 })
      expect(result).toBe('This is a very long')
      expect(result.length).toBeLessThanOrEqual(20)
    })
  })

  describe('validateAndSanitizeURL', () => {
    it('should throw error for null input (line 74)', () => {
      expect(() => validateAndSanitizeURL(null as unknown as string)).toThrow(
        'URL is required',
      )
    })

    it('should throw error for URL without HTTP/HTTPS protocol (line 80)', () => {
      expect(() => validateAndSanitizeURL('ftp://example.com')).toThrow(
        'URL must use HTTP or HTTPS protocol',
      )
    })

    it('should throw error for invalid URL format (line 87)', () => {
      expect(() =>
        validateAndSanitizeURL('https://invalid url with spaces'),
      ).toThrow('Invalid URL format')
    })
  })

  describe('validateSlug', () => {
    it('should throw error for null input (line 93)', () => {
      expect(() => validateSlug(null as unknown as string)).toThrow(
        'Slug is required',
      )
    })

    it('should throw error for invalid slug format with uppercase (line 99)', () => {
      expect(() => validateSlug('InvalidSlug')).toThrow(
        'Slug can only contain lowercase letters, numbers, and hyphens',
      )
    })
  })
})
