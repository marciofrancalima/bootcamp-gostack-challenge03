import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  // Pegando o token do header da requisição
  const authHeader = req.headers.authorization;

  // Verifica se o token foi informado
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  // Pegar apenas o token (ignorando 'Bearer')
  const [, token] = authHeader.split(' ');

  try {
    // Verifica o token do usuário
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Incluir id do usuário na requisição para o método de update
    req.userId = decoded.id;

    console.log(req.userId);

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
