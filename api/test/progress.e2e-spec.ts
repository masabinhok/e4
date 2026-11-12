import { INestApplication } from '@nestjs/common';
import { Connection, Types } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { cookiesOf, createApp, signUp } from './helpers';

describe('progress (spaced repetition)', () => {
  let app: INestApplication<App>;
  let db: Connection;
  let cookie: string;
  let lineId: string;
  const http = () => request(app.getHttpServer());
  const daysUntil = (iso: string) =>
    Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  const drill = (mistakes: number, c = cookie, id = lineId) =>
    http().post(`/api/progress/${id}`).set('Cookie', c).send({ mistakes });

  beforeAll(async () => {
    ({ app, db } = await createApp());
    ({ cookie } = await signUp(app, db));
    const { insertedId } = await db.collection('variations').insertOne({
      title: 'Short System',
      code: 'carokann',
      moves: ['e4', 'c6'],
      boardflip: 'black',
      description: '',
      status: 'ACCEPTED',
    });
    lineId = String(insertedId);
  });
  afterAll(() => app.close());

  it('clean drills move the line up the boxes and space out reviews', async () => {
    let res = await drill(0).expect(201);
    expect(res.body).toMatchObject({ box: 1, reviews: 1 });
    expect(daysUntil(res.body.dueAt as string)).toBe(1);

    res = await drill(0).expect(201);
    expect(res.body).toMatchObject({ box: 2, reviews: 2 });
    expect(daysUntil(res.body.dueAt as string)).toBe(3);
  });

  it('a mistake sends it back to box 1', async () => {
    const res = await drill(2).expect(201);
    expect(res.body).toMatchObject({ box: 1, lastMistakes: 2, reviews: 3 });
  });

  it('lists progress with the line attached', async () => {
    const res = await http()
      .get('/api/progress')
      .set('Cookie', cookie)
      .expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].variation).toMatchObject({
      title: 'Short System',
      code: 'carokann',
    });
    expect(res.body[0].user).toBeUndefined();
  });

  it('keeps each user separate', async () => {
    const other = await signUp(app, db);
    const res = await http()
      .get('/api/progress')
      .set('Cookie', other.cookie)
      .expect(200);
    expect(res.body).toEqual([]);
  });

  it('rejects bad input', async () => {
    await drill(-1).expect(400);
    await drill(1.5).expect(400);
    await drill(0, cookie, new Types.ObjectId().toString()).expect(404);
    await drill(0, cookie, 'not-an-id').expect(400);
    await http()
      .post(`/api/progress/${lineId}`)
      .send({ mistakes: 0 })
      .expect(401);
  });

  it("expires with a demo visitor's account", async () => {
    const demo = cookiesOf(await http().post('/api/auth/demo').expect(201));
    const res = await drill(0, demo).expect(201);
    const user = await db.collection('users').findOne({ isDemo: true });
    const saved = await db
      .collection('progresses')
      .findOne({ _id: new Types.ObjectId(res.body._id as string) });
    expect(saved!.expiresAt).toEqual(user!.expiresAt);
  });
});
