import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  closeConnection,
  memoryServerConfig,
} from './common/mongo-in-memory-config';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.setTimeout(60000);
    const { uri } = await memoryServerConfig();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MongooseModule.forRoot(uri)],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await closeConnection();
  }, 5000);

  test(`method: POST,
   path: /images/save
   description: should return status 200 and return the metadatas in request body
  `, async () => {
    const { status, body } = await request(app.getHttpServer())
      .post('/image/save')
      .send({
        url: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Epepeotes_uncinatus_%40_Kanjirappally_Exif_02.png',
        compress: 10,
      });

    expect({ status, body: body.body }).toStrictEqual({
      status: 200,
      body: {
        localpath: {
          original: '/images/image.jpg',
          thumb: '/images/image_thumb.jpg',
        },
        metadata: {
          'Image Width': { value: 419, description: '419px' },
          'Image Height': { value: 198, description: '198px' },
          'Bit Depth': { value: 8, description: '8' },
          'Color Type': { value: 2, description: 'RGB' },
          Compression: { value: 0, description: 'Deflate/Inflate' },
          Filter: { value: 0, description: 'Adaptive' },
          Interlace: { value: 0, description: 'Noninterlaced' },
          Software: { value: 'Shutter', description: 'Shutter' },
        },
      },
    });
  });

  test(`method: POST,
  path: /images/save
  description: should return 403 if url provided was an http
 `, async () => {
    const { status, body } = await request(app.getHttpServer())
      .post('/image/save')
      .send({
        url: 'http://upload.wikimedia.org/wikipedia/commons/7/7e/Epepeotes_uncinatus_%40_Kanjirappally_Exif_02.png',
        compress: 10,
      });
    expect({ status, errors: body.errors }).toStrictEqual({
      status: 403,
      errors: [
        {
          code: 403,
          message: 'Unacepted URL, please use an https URL',
        },
      ],
    });
  });
});
