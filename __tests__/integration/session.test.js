import request from 'supertest';

import app from '../../src/app';
import truncate from '../util/truncate';
import factory from '../factories';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to create a new session to user', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const session = await request(app)
      .post('/sessions')
      .send(user);

    expect(session.status).toBe(200);
  });

  it('should not be able to create a new session with invalid email', async () => {
    const user = await factory.attrs('User', {
      email: 'mail@test.com',
      password: '123456',
    });

    await request(app)
      .post('/users')
      .send(user);

    const session = await request(app)
      .post('/sessions')
      .send({
        email: 'ops@test.com',
        password: '123456',
      });

    expect(session.status).toBe(401);
  });

  it('should not be able to create a new session with invalid password', async () => {
    const user = await factory.attrs('User', {
      email: 'mail@test.com',
      password: '123456',
    });

    await request(app)
      .post('/users')
      .send(user);

    const session = await request(app)
      .post('/sessions')
      .send({
        email: 'mail@test.com',
        password: '12345678',
      });

    expect(session.status).toBe(401);
  });

  it('should not be able to create a new session without email', async () => {
    const user = await factory.attrs('User', {
      email: null,
      password: '123456',
    });

    const response = await request(app)
      .post('/sessions')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to create a new session without password', async () => {
    const user = await factory.attrs('User', {
      email: 'mail@test.com',
      password: null,
    });

    const response = await request(app)
      .post('/sessions')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not access the meetups route without passing token', async () => {
    const response = await request(app).get('/meetups');

    expect(response.status).toBe(401);
  });

  it('should not access the subscriptios route without passing token', async () => {
    const response = await request(app).get('/subscriptions');

    expect(response.status).toBe(401);
  });

  it('should not access the organizing route without passing token', async () => {
    const response = await request(app).get('/organizing');

    expect(response.status).toBe(401);
  });
});
