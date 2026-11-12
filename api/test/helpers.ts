import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from 'src/app.module';
import { setupApp } from 'src/app.setup';

export async function createApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  setupApp(app);
  await app.init();
  const db = app.get<Connection>(getConnectionToken());
  await db.dropDatabase();
  return { app, db };
}

// Pass cookies by hand: tests make independent requests rather than share an agent.
export function cookiesOf(res: request.Response): string {
  const raw = res.headers['set-cookie'] as unknown as string[];
  return raw.map((c) => c.split(';')[0]).join('; ');
}

let n = 0;
export async function signUp(
  app: INestApplication<App>,
  db: Connection,
  role: 'USER' | 'ADMIN' = 'USER',
) {
  const email = `user${++n}-${Date.now()}@test.local`;
  const password = 'password123';
  await request(app.getHttpServer())
    .post('/api/auth/signup')
    .send({ fullName: 'Test User', email, password })
    .expect(201);
  if (role === 'ADMIN') {
    await db.collection('users').updateOne({ email }, { $set: { role } });
  }
  // Log in again so the access token carries the current role.
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(201);
  const user = await db.collection('users').findOne({ email });
  return { cookie: cookiesOf(res), id: String(user!._id), email };
}
