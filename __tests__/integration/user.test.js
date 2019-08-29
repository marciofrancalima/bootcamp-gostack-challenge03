import request from 'supertest';

import app from '../../src/app';
import truncate from '../util/truncate';
import factory from '../factories';
import fetchUserAuthorization from '../fetchUserAuthorization';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });

  // Create

  it('should be able to register', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register with duplicated email ', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register without name', async () => {
    const user = await factory.attrs('User', {
      name: null,
      email: 'mail@test.com',
      password: '123456',
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register without email', async () => {
    const user = await factory.attrs('User', {
      name: 'test01',
      email: null,
      password: '123456',
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register without password', async () => {
    const user = await factory.attrs('User', {
      name: 'test01',
      email: 'mail@test.com',
      password: null,
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register with password less than 6 digits', async () => {
    const user = await factory.attrs('User', {
      name: 'test01',
      email: 'mail@test.com',
      password: '12345',
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should encrypt user password when new user created', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });

    const compareHash = await user.checkPassword('123456');

    expect(compareHash).toBe(true);
  });

  // Update

  it('should not be able to update your data without email', async () => {
    const token = await fetchUserAuthorization();

    const updated = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        name: 'user updated',
        email: null,
      });

    expect(updated.status).toBe(400);
  });

  it('should not be able to update password without entering current password', async () => {
    const user = await factory.attrs('User', { password: '123456' });

    await request(app)
      .post('/users')
      .send(user);

    const session = await request(app)
      .post('/sessions')
      .send(user);

    const updated = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${session.body.token}`)
      .send({
        name: 'user updated',
        email: `${user.email}`,
        password: '12345678',
        confirmPassword: '12345678',
      });

    expect(updated.status).toBe(400);
  });

  it('should not be able to update password without confirm new password', async () => {
    const user = await factory.attrs('User', { password: '123456' });

    await request(app)
      .post('/users')
      .send(user);

    const session = await request(app)
      .post('/sessions')
      .send(user);

    const updated = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${session.body.token}`)
      .send({
        name: 'user updated',
        email: `${user.email}`,
        password: '12345678',
        oldPassword: '123456',
      });

    expect(updated.status).toBe(400);
  });

  it('should not be able to update with password less than 6 digits', async () => {
    const user = await factory.attrs('User', { password: '123456' });

    await request(app)
      .post('/users')
      .send(user);

    const session = await request(app)
      .post('/sessions')
      .send(user);

    const updated = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${session.body.token}`)
      .send({
        name: 'user updated',
        email: `${user.email}`,
        password: '12345',
        confirmPassword: '12345',
        oldPassword: '123456',
      });

    expect(updated.status).toBe(400);
  });

  it('should not be able to update with invalid password', async () => {
    const user = await factory.attrs('User', { password: '123456' });

    await request(app)
      .post('/users')
      .send(user);

    const session = await request(app)
      .post('/sessions')
      .send(user);

    const updated = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${session.body.token}`)
      .send({
        name: 'user updated',
        email: `${user.email}`,
        password: '12345678',
        confirmPassword: '12345678',
        oldPassword: '654321',
      });

    expect(updated.status).toBe(401);
  });

  it('should not be able to update with an existing email', async () => {
    const user01 = await factory.attrs('User', { email: 'user01@test.com' });
    const user02 = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user01);

    await request(app)
      .post('/users')
      .send(user02);

    const session = await request(app)
      .post('/sessions')
      .send(user02);

    const updated = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${session.body.token}`)
      .send({
        name: 'user updated',
        email: `${user01.email}`,
      });

    expect(updated.status).toBe(400);
  });

  it('should be able to update your data', async () => {
    const user = await factory.attrs('User', { password: '123456' });

    await request(app)
      .post('/users')
      .send(user);

    const session = await request(app)
      .post('/sessions')
      .send(user);

    const updated = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${session.body.token}`)
      .send({
        name: 'user updated',
        email: 'userupdated@test.com',
        password: '12345678',
        confirmPassword: '12345678',
        oldPassword: '123456',
      });

    expect(updated.status).toBe(200);
  });
});
