import { INestApplication } from '@nestjs/common';
import { Connection, Types } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createApp, signUp } from './helpers';

describe('contributions and admin cascades', () => {
  let app: INestApplication<App>;
  let db: Connection;
  let user: Awaited<ReturnType<typeof signUp>>;
  let admin: Awaited<ReturnType<typeof signUp>>;
  const http = () => request(app.getHttpServer());
  const line = (moves: string[]) => ({
    title: `Line ${moves.join(' ')}`,
    description: 'd',
    moves,
    boardflip: 'white',
  });
  const oid = (id: string) => new Types.ObjectId(id);

  beforeAll(async () => {
    ({ app, db } = await createApp());
    user = await signUp(app, db);
    admin = await signUp(app, db, 'ADMIN');
    await db.collection('openings').insertOne({
      name: 'Test Opening',
      code: 'test',
      description: 'd',
      status: 'ACCEPTED',
      variations: [],
    });
  });
  afterAll(() => app.close());

  const contribute = (moves: string[], code = 'test') =>
    http()
      .post(`/api/variations/contribute/${code}`)
      .set('Cookie', user.cookie)
      .send(line(moves));
  const pendingId = async (moves: string[]) => {
    const v = await db.collection('variations').findOne({ moves });
    return String(v!._id);
  };
  const approve = (id: string) =>
    http()
      .post(`/api/admin/variation/toggle-status/${id}`)
      .set('Cookie', admin.cookie);

  it('rejects illegal and malformed move lists with 400', async () => {
    await contribute(['e4', 'e4']).expect(400);
    await contribute([]).expect(400);
    await http()
      .post('/api/variations/record')
      .set('Cookie', user.cookie)
      .send({ ...line(['e4']), moves: ['e4', 42] })
      .expect(400);
  });

  it('returns 404 when contributing to an opening that does not exist', async () => {
    await contribute(['e4', 'e5'], 'no-such-opening').expect(404);
  });

  it('contribute → approve puts the line in the opening exactly once', async () => {
    const res = await contribute(['d4', 'd5']).expect(201);
    expect(res.body.message).toBeTruthy();
    const id = await pendingId(['d4', 'd5']);

    await approve(id).expect(201);
    await approve(id).expect(404); // second approval is a no-op, not a duplicate

    const opening = await db.collection('openings').findOne({ code: 'test' });
    expect(opening!.variations.map(String)).toEqual([id]);
    const contributor = await db
      .collection('users')
      .findOne({ _id: oid(user.id) });
    expect(contributor!.contributedLines.map(String)).toEqual([id]);

    const lesson = await http()
      .get('/api/openings/test')
      .set('Cookie', user.cookie)
      .expect(200);
    expect(lesson.body.variations).toHaveLength(1);
  });

  it('records private lines with their owner and serves them', async () => {
    await http()
      .post('/api/variations/record')
      .set('Cookie', user.cookie)
      .send(line(['c4', 'e5']))
      .expect(201);
    const v = await db
      .collection('variations')
      .findOne({ moves: ['c4', 'e5'] });
    expect(String(v!.contributor)).toBe(user.id);

    const res = await http()
      .get('/api/users/recorded-lines')
      .set('Cookie', user.cookie)
      .expect(200);
    expect(res.body.variations).toHaveLength(1);
    await http()
      .get('/api/users/anything-lines')
      .set('Cookie', user.cookie)
      .expect(404);
  });

  it('deleting a variation removes it from its opening', async () => {
    await contribute(['Nf3', 'd5']).expect(201);
    const id = await pendingId(['Nf3', 'd5']);
    await approve(id).expect(201);
    await http()
      .delete(`/api/admin/variation/${id}`)
      .set('Cookie', admin.cookie)
      .expect(200);
    const opening = await db.collection('openings').findOne({ code: 'test' });
    expect(opening!.variations.map(String)).not.toContain(id);
  });

  it('deleting an opening deletes its variations', async () => {
    const opening = await db.collection('openings').findOne({ code: 'test' });
    await http()
      .delete(`/api/admin/opening/${String(opening!._id)}`)
      .set('Cookie', admin.cookie)
      .expect(200);
    expect(
      await db.collection('variations').countDocuments({ code: 'test' }),
    ).toBe(0);
  });

  it('deleting a user deletes their private and pending lines', async () => {
    const doomed = await signUp(app, db);
    await http()
      .post('/api/variations/custom')
      .set('Cookie', doomed.cookie)
      .send(line(['g3']))
      .expect(201);
    await http()
      .delete(`/api/admin/user/${doomed.id}`)
      .set('Cookie', admin.cookie)
      .expect(200);
    expect(
      await db
        .collection('variations')
        .countDocuments({ contributor: oid(doomed.id) }),
    ).toBe(0);
    await http()
      .delete(`/api/admin/user/${doomed.id}`)
      .set('Cookie', admin.cookie)
      .expect(404);
  });
});
