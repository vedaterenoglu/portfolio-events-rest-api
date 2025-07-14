import {
  sanitizeHTML,
  sanitizePlainText,
  validateAndSanitizeURL,
} from '../../../src/utils/sanitization'

describe('sanitizeHTML', () => {
  it('should remove all HTML tags when removeHTMLCompletely is true', () => {
    const input = '<script>alert("xss")</script>Hello <strong>World</strong>'
    const result = sanitizeHTML(input, { removeHTMLCompletely: true })
    expect(result).toBe('Hello World')
  })

  it('should return empty string for invalid input', () => {
    const result = sanitizeHTML('', {})
    expect(result).toBe('')
  })

  it('should preserve input when removeHTMLCompletely is false', () => {
    const input = 'Hello <strong>World</strong>'
    const result = sanitizeHTML(input, { removeHTMLCompletely: false })
    expect(result).toBe('Hello <strong>World</strong>')
  })

  it('should truncate output when maxLength is specified', () => {
    const input = 'This is a very long text that should be truncated'
    const result = sanitizeHTML(input, {
      removeHTMLCompletely: true,
      maxLength: 10,
    })
    expect(result).toBe('This is a')
  })
})

describe('sanitizePlainText', () => {
  it('should remove all HTML tags and return plain text', () => {
    const input =
      '<div>Hello <strong>World</strong> <script>alert("xss")</script></div>'
    const result = sanitizePlainText(input)
    expect(result).toBe('Hello World ')
  })
})

describe('validateAndSanitizeURL', () => {
  it('should throw error for empty input', () => {
    expect(() => validateAndSanitizeURL('')).toThrow('URL is required')
  })

  it('should throw error for URLs without HTTP/HTTPS protocol', () => {
    expect(() => validateAndSanitizeURL('ftp://example.com')).toThrow(
      'URL must use HTTP or HTTPS protocol',
    )
  })
})
