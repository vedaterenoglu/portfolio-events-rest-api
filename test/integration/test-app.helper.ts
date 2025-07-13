import { Server } from 'http'

import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { AppModule } from '../../src/app.module'

export class TestAppHelper {
  private static app: INestApplication

  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    TestAppHelper.app = moduleFixture.createNestApplication()
    await TestAppHelper.app.init()

    return TestAppHelper.app
  }

  static async closeTestApp(): Promise<void> {
    if (TestAppHelper.app) {
      await TestAppHelper.app.close()
    }
  }

  static getHttpServer(): Server {
    return TestAppHelper.app.getHttpServer() as Server
  }

  static request() {
    return request(TestAppHelper.getHttpServer())
  }
}
