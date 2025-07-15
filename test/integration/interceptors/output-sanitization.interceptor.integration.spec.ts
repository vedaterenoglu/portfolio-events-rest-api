import { Server } from 'http'

import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { AppController } from '../../../src/app.controller'
import { AppService } from '../../../src/app.service'
import { CitiesService } from '../../../src/cities/cities.service'
import { OutputSanitizationInterceptor } from '../../../src/interceptors/output-sanitization.interceptor'

describe('OutputSanitizationInterceptor (Integration)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const mockCitiesService = {
      getAllCities: jest.fn().mockResolvedValue({
        count: 1,
        cities: [
          {
            citySlug: 'test',
            city: '<script>alert("xss")</script>TestCity',
            url: 'test.jpg',
            alt: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: CitiesService,
          useValue: mockCitiesService,
        },
        OutputSanitizationInterceptor,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalInterceptors(new OutputSanitizationInterceptor())
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('should sanitize HTML in API responses', async () => {
    const server = app.getHttpServer() as Server
    const response = await request(server).get('/').expect(200)

    // Verify response is sanitized (Hello World should be plain text)
    expect(response.text).toBe('Hello World!')
  })

  it('should sanitize complex objects and arrays with field skipping', async () => {
    const mockCitiesService = {
      getAllCities: jest.fn().mockResolvedValue({
        count: 2,
        cities: [
          {
            citySlug: 'test-slug',
            city: '<script>alert("xss")</script>TestCity',
            url: 'https://example.com/image.jpg',
            alt: '<img src=x onerror=alert("xss")>Alt text',
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-02'),
          },
          null,
          {
            citySlug: 'another-slug',
            city: 'Normal City',
            url: 'https://example.com/image2.jpg',
            alt: 'Normal alt',
            createdAt: new Date('2023-01-03'),
            updatedAt: new Date('2023-01-04'),
          },
        ],
      }),
    }

    const CitiesController = await import(
      '../../../src/cities/cities.controller'
    )

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController.CitiesController],
      providers: [
        {
          provide: CitiesService,
          useValue: mockCitiesService,
        },
      ],
    }).compile()

    const testApp = moduleFixture.createNestApplication()
    testApp.useGlobalInterceptors(new OutputSanitizationInterceptor())
    await testApp.init()

    const server = testApp.getHttpServer() as Server
    const response = await request(server).get('/api/cities').expect(200)

    // Verify response structure is maintained but strings are sanitized
    const body = response.body as {
      count: number
      cities: Array<{
        citySlug: string
        city: string
        url: string
        alt: string
        createdAt: string
        updatedAt: string
      } | null>
    }

    expect(body.count).toBe(2)
    expect(body.cities).toHaveLength(3)
    expect(body.cities[0]?.citySlug).toBe('test-slug')
    expect(body.cities[0]?.city).toBe('TestCity')
    expect(body.cities[0]?.url).toBe('https://example.com/image.jpg')
    expect(body.cities[0]?.alt).toBe('Alt text')
    expect(body.cities[1]).toBeNull()

    await testApp.close()
  })
})
