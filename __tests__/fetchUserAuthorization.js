import request from 'supertest';

import app from '../src/app';
import factory from './factories';

async function fetchUserAuthorization() {
  const user = await factory.attrs('User');

  // Add user
  await request(app)
    .post('/users')
    .send(user);

  // Create a session
  const auth = await request(app)
    .post('/sessions')
    .send(user);

  return auth.body.token;
}

export default fetchUserAuthorization;
