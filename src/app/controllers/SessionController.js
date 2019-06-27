import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import authConfig from '../../config/auth';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    // Verifica se os dados são válidos para iniciar a sessão
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Preencha os dados corretamente' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    // Se o usuário não estiver cadastrado
    if (!user) {
      return res.status(401).json({ error: 'Usuário não cadastrado' });
    }

    // Se a senha não for válida
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Senhá inválida' });
    }

    // Se o usuário passar pelas validações
    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
