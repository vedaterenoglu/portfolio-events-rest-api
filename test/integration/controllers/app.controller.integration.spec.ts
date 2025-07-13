import { Server } from 'http'

import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { AppController } from '../../../src/app.controller'
import { AppService } from '../../../src/app.service'

describe('AppController Integration', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /', () => {
    it('should return "Hello World!"', async () => {
      const server = app.getHttpServer() as Server
      const response = await request(server).get('/').expect(200)

      expect(response.text).toBe('Hello World!')
    })
  })
})
