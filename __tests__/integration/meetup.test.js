import request from 'supertest';

import app from '../../src/app';
import truncate from '../util/truncate';
import factory from '../factories';

describe('Meetup', () => {
  let auth;
  let user;

  beforeAll(async () => {
    user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    auth = await request(app)
      .post('/sessions')
      .send(user);
  });

  beforeEach(async () => {
    await truncate();
  });

  it('should be able to list all meetups', async () => {
    const response = await request(app)
      .get('/meetups')
      .set('Authorization', `bearer ${auth.body.token}`);

    expect(response.status).toBe(200);
  });

  // it('', async () => {});
});
