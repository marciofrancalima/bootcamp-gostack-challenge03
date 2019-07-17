import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  // Taking the request header token
  const authHeader = req.headers.authorization;

  // Checks if the token has been informed
  if (!authHeader) {
    return res.status(401).json({ error: 'Token does not informed' });
  }

  // Catch just the token (ignoring 'Bearer')
  const [, token] = authHeader.split(' ');

  try {
    // Check the user's token
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Include user id in request for update/delete methods
    req.userId = decoded.id;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
