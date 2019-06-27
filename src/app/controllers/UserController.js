import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    // Verifica se os dados da requisição são válidos
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Preencha os dados corretamente' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    // Verifica se o usuário já existe
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      password: Yup.string().min(6),
      oldPassword: Yup.string()
        .min(6)
        .when('password', (password, field) =>
          password ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    // Verifica se os campos foram preenchidos corretamente
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Preencha os dados corretamente' });
    }

    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

    // Verifica se o usuário quer alterar o email
    if (email !== user.email) {
      // Procura no banco de dados se tem algum usuário com o email informado
      const userExists = await User.findOne({ where: { email } });

      // Verifica se o email que o usuário quer alterar já existe
      if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }
    }

    // Verifica se o usuário quer alterar a senha e se informou o old correto
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
