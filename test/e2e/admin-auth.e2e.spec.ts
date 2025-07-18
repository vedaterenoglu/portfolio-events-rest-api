import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { AppModule } from '../../src/app.module'

describe('Admin Authentication (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Admin Protected Routes', () => {
    describe('POST /api/admin/events', () => {
      it('should return 401 when no authorization header', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/events')
          .send({
            name: 'Test Event',
            description: 'Test Description',
            date: '2024-12-01T10:00:00Z',
            cityId: 1,
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when invalid authorization header format', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/events')
          .set('Authorization', 'InvalidFormat')
          .send({
            name: 'Test Event',
            description: 'Test Description',
            date: '2024-12-01T10:00:00Z',
            cityId: 1,
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when invalid token', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/events')
          .set('Authorization', 'Bearer invalid-token')
          .send({
            name: 'Test Event',
            description: 'Test Description',
            date: '2024-12-01T10:00:00Z',
            cityId: 1,
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events',
          response: {
            error: 'Unauthorized',
            message: 'Invalid authorization token',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when token is invalid (mock token rejected by Clerk)', async () => {
        const userToken =
          process.env.INTEGRATION_TEST_USER_TOKEN ?? 'mock-user-token'

        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/events')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'Test Event',
            description: 'Test Description',
            date: '2024-12-01T10:00:00Z',
            cityId: 1,
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events',
          response: {
            error: 'Unauthorized',
            message: 'Invalid authorization token',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })
    })

    describe('POST /api/admin/cities', () => {
      it('should return 401 when no authorization header', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/cities')
          .send({
            name: 'Test City',
            state: 'Test State',
            country: 'Test Country',
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/cities',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when malformed Bearer token', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/cities')
          .set('Authorization', 'Bearer ')
          .send({
            name: 'Test City',
            state: 'Test State',
            country: 'Test Country',
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/cities',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when token is empty string', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/cities')
          .set('Authorization', 'Bearer ""')
          .send({
            name: 'Test City',
            state: 'Test State',
            country: 'Test Country',
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/cities',
          response: {
            error: 'Unauthorized',
            message: 'Invalid authorization token',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })
    })

    describe('POST /admin/events', () => {
      it('should return 401 when no authorization header', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/events')
          .send({
            name: 'Test Event',
            description: 'Test Description',
            date: '2024-12-01T10:00:00Z',
            cityId: 1,
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when authorization header is missing Bearer prefix', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/events')
          .set('Authorization', 'invalid-token')
          .send({
            name: 'Test Event',
            description: 'Test Description',
            date: '2024-12-01T10:00:00Z',
            cityId: 1,
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })
    })

    describe('PUT /admin/events/:id', () => {
      it('should return 401 when no authorization header', async () => {
        const response = await request(app.getHttpServer() as never)
          .put('/api/admin/events/1')
          .send({
            name: 'Updated Event',
            description: 'Updated Description',
            date: '2024-12-01T10:00:00Z',
            cityId: 1,
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events/1',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when token contains invalid characters', async () => {
        const response = await request(app.getHttpServer() as never)
          .put('/api/admin/events/1')
          .set('Authorization', 'Bearer invalid@token#with$special%chars')
          .send({
            name: 'Updated Event',
            description: 'Updated Description',
            date: '2024-12-01T10:00:00Z',
            cityId: 1,
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events/1',
          response: {
            error: 'Unauthorized',
            message: 'Invalid authorization token',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })
    })

    describe('DELETE /admin/events/:id', () => {
      it('should return 401 when no authorization header', async () => {
        const response = await request(app.getHttpServer() as never)
          .delete('/api/admin/events/1')
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events/1',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when authorization header is malformed', async () => {
        const response = await request(app.getHttpServer() as never)
          .delete('/api/admin/events/1')
          .set('Authorization', 'BearerInvalidFormat')
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/events/1',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })
    })

    describe('POST /admin/cities', () => {
      it('should return 401 when no authorization header', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/cities')
          .send({
            name: 'Test City',
            state: 'Test State',
            country: 'Test Country',
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/cities',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when token is null', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/api/admin/cities')
          .set('Authorization', 'Bearer null')
          .send({
            name: 'Test City',
            state: 'Test State',
            country: 'Test Country',
          })
          .expect(401)

        expect(response.body).toEqual({
          path: '/api/admin/cities',
          response: {
            error: 'Unauthorized',
            message: 'Invalid authorization token',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })
    })

    describe('POST /admin/database/reset', () => {
      it('should return 401 when no authorization header', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/admin/database/reset')
          .expect(401)

        expect(response.body).toEqual({
          path: '/admin/database/reset',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })

      it('should return 401 when authorization header has extra spaces', async () => {
        const response = await request(app.getHttpServer() as never)
          .post('/admin/database/reset')
          .set('Authorization', '  Bearer   invalid-token  ')
          .expect(401)

        expect(response.body).toEqual({
          path: '/admin/database/reset',
          response: {
            error: 'Unauthorized',
            message: 'Authorization token not found',
            statusCode: 401,
          },
          statusCode: 401,
          timestamp: expect.any(String) as string,
        })
      })
    })
  })

  describe('Auth Guard Error Scenarios', () => {
    it('should handle missing authorization header gracefully', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/api/admin/events')
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .expect(401)

      expect(response.body).toEqual({
        path: '/api/admin/events',
        response: {
          error: 'Unauthorized',
          message: 'Authorization token not found',
          statusCode: 401,
        },
        statusCode: 401,
        timestamp: expect.any(String) as string,
      })
    })

    it('should handle invalid JWT structure', async () => {
      const response = await request(app.getHttpServer() as never)
        .post('/api/admin/events')
        .set('Authorization', 'Bearer invalid.jwt.structure')
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .expect(401)

      expect(response.body).toEqual({
        path: '/api/admin/events',
        response: {
          error: 'Unauthorized',
          message: 'Invalid authorization token',
          statusCode: 401,
        },
        statusCode: 401,
        timestamp: expect.any(String) as string,
      })
    })

    it('should handle expired token scenario', async () => {
      const expiredToken =
        process.env.INTEGRATION_TEST_EXPIRED_TOKEN ?? 'mock-expired-token'

      const response = await request(app.getHttpServer() as never)
        .post('/api/admin/events')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .expect(401)

      expect(response.body).toEqual({
        path: '/api/admin/events',
        response: {
          error: 'Unauthorized',
          message: 'Invalid authorization token',
          statusCode: 401,
        },
        statusCode: 401,
        timestamp: expect.any(String) as string,
      })
    })

    it('should handle token without required claims', async () => {
      const incompleteToken =
        process.env.INTEGRATION_TEST_INCOMPLETE_TOKEN ?? 'mock-incomplete-token'

      const response = await request(app.getHttpServer() as never)
        .post('/api/admin/events')
        .set('Authorization', `Bearer ${incompleteToken}`)
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .expect(401)

      expect(response.body).toEqual({
        path: '/api/admin/events',
        response: {
          error: 'Unauthorized',
          message: 'Invalid authorization token',
          statusCode: 401,
        },
        statusCode: 401,
        timestamp: expect.any(String) as string,
      })
    })
  })

  describe('Admin Role Guard Error Scenarios', () => {
    it('should handle non-admin role access attempt (mock token rejected)', async () => {
      const userToken =
        process.env.INTEGRATION_TEST_USER_TOKEN ?? 'mock-user-token'

      const response = await request(app.getHttpServer() as never)
        .post('/api/admin/events')
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401)

      expect(response.body).toEqual({
        path: '/api/admin/events',
        response: {
          error: 'Unauthorized',
          message: 'Invalid authorization token',
          statusCode: 401,
        },
        statusCode: 401,
        timestamp: expect.any(String) as string,
      })
    })

    it('should handle token with missing role claim (mock token rejected)', async () => {
      const noRoleToken =
        process.env.INTEGRATION_TEST_NO_ROLE_TOKEN ?? 'mock-no-role-token'

      const response = await request(app.getHttpServer() as never)
        .post('/api/admin/events')
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .set('Authorization', `Bearer ${noRoleToken}`)
        .expect(401)

      expect(response.body).toEqual({
        path: '/api/admin/events',
        response: {
          error: 'Unauthorized',
          message: 'Invalid authorization token',
          statusCode: 401,
        },
        statusCode: 401,
        timestamp: expect.any(String) as string,
      })
    })

    it('should handle token with invalid role value (mock token rejected)', async () => {
      const invalidRoleToken =
        process.env.INTEGRATION_TEST_INVALID_ROLE_TOKEN ??
        'mock-invalid-role-token'

      const response = await request(app.getHttpServer() as never)
        .post('/api/admin/events')
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-12-01T10:00:00Z',
          cityId: 1,
        })
        .set('Authorization', `Bearer ${invalidRoleToken}`)
        .expect(401)

      expect(response.body).toEqual({
        path: '/api/admin/events',
        response: {
          error: 'Unauthorized',
          message: 'Invalid authorization token',
          statusCode: 401,
        },
        statusCode: 401,
        timestamp: expect.any(String) as string,
      })
    })
  })
})
