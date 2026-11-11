import * as request from 'supertest';
import { createApp } from './helpers';

it('GET /api/health reports the database is up', async () => {
  const { app } = await createApp();
  await request(app.getHttpServer())
    .get('/api/health')
    .expect(200, { status: 'ok', db: 'up' });
  await app.close();
});
