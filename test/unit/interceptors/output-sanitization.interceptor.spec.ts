import { CallHandler, ExecutionContext } from '@nestjs/common'
import { of } from 'rxjs'

import { OutputSanitizationInterceptor } from '../../../src/interceptors/output-sanitization.interceptor'

describe('OutputSanitizationInterceptor', () => {
  let interceptor: OutputSanitizationInterceptor
  let mockExecutionContext: ExecutionContext
  let mockCallHandler: CallHandler

  beforeEach(() => {
    interceptor = new OutputSanitizationInterceptor()
    mockExecutionContext = {} as ExecutionContext
    mockCallHandler = {
      handle: jest.fn(),
    }
  })

  it('should be defined', () => {
    expect(interceptor).toBeDefined()
  })

  it('should sanitize HTML from string response', done => {
    const mockResponse = '<script>alert("xss")</script>Hello World'
    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toBe('Hello World')
        done()
      })
  })

  it('should preserve null and undefined values', done => {
    mockCallHandler.handle = jest.fn().mockReturnValue(of(null))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toBeNull()
        done()
      })
  })

  it('should sanitize nested object properties', done => {
    const mockResponse = {
      name: '<b>John</b> Doe',
      description: '<script>alert("xss")</script>Safe text',
      city: 'New <img src=x onerror=alert(1)>York',
    }
    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toEqual({
          name: 'John Doe',
          description: 'Safe text',
          city: 'New York',
        })
        done()
      })
  })

  it('should skip sanitization for excluded fields', done => {
    const mockResponse = {
      id: 123,
      citySlug: 'new-york',
      imageUrl: 'https://example.com/image.jpg',
      price: 99.99,
      name: '<b>Product</b>',
    }
    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toEqual({
          id: 123,
          citySlug: 'new-york',
          imageUrl: 'https://example.com/image.jpg',
          price: 99.99,
          name: 'Product',
        })
        done()
      })
  })

  it('should sanitize arrays of objects', done => {
    const mockResponse = [
      { name: '<b>Item 1</b>', description: 'Clean' },
      { name: '<script>alert(1)</script>Item 2', description: '<i>Text</i>' },
    ]
    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toEqual([
          { name: 'Item 1', description: 'Clean' },
          { name: 'Item 2', description: 'Text' },
        ])
        done()
      })
  })

  it('should handle deeply nested structures', done => {
    const mockResponse = {
      data: {
        items: [
          {
            title: '<h1>Title</h1>',
            meta: {
              author: '<b>John</b>',
              tags: ['<i>tag1</i>', 'plain<script>tag2</script>text'],
            },
          },
        ],
      },
    }
    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toEqual({
          data: {
            items: [
              {
                title: 'Title',
                meta: {
                  author: 'John',
                  tags: ['tag1', 'plaintext'],
                },
              },
            ],
          },
        })
        done()
      })
  })

  it('should handle non-string primitive values', done => {
    const mockResponse = {
      count: 42,
      isActive: true,
      rating: 4.5,
      nullValue: null,
      undefinedValue: undefined,
    }
    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toEqual(mockResponse)
        done()
      })
  })

  it('should preserve date objects in skip fields', done => {
    const testDate = new Date('2023-01-01')
    const mockResponse = {
      createdAt: testDate,
      updatedAt: testDate,
      date: testDate,
      title: '<b>Event</b>',
    }
    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toEqual({
          createdAt: testDate,
          updatedAt: testDate,
          date: testDate,
          title: 'Event',
        })
        done()
      })
  })

  it('should handle empty objects and arrays', done => {
    const mockResponse = {
      emptyObject: {},
      emptyArray: [],
      data: {
        items: [],
      },
    }
    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toEqual(mockResponse)
        done()
      })
  })

  it('should sanitize strings with multiple HTML tags', done => {
    const mockResponse = {
      content:
        '<div><p>Hello <strong>world</strong></p><script>alert("xss")</script></div>',
    }
    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        expect(result).toEqual({
          content: 'Hello world',
        })
        done()
      })
  })

  it('should skip inherited properties when sanitizing objects', done => {
    // Create an object with inherited properties to test the hasOwnProperty check
    const prototype = {
      inheritedProperty: '<script>alert("inherited")</script>',
    }
    const mockResponse = Object.create(prototype) as Record<string, unknown>
    mockResponse.ownProperty = '<b>Own property</b>'

    mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse))

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe(result => {
        // Should only include own properties, not inherited ones
        expect(result).toEqual({
          ownProperty: 'Own property',
        })
        // Should not include inherited properties
        expect(result).not.toHaveProperty('inheritedProperty')
        done()
      })
  })
})
