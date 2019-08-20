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

    // Checks if the data is valid to start the session
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ message: 'Preencha os dados corretamente' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    // If the user is not registered
    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválido' });
    }

    // If the password is not valid
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Usuário ou senha inválido' });
    }

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
