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

    // Checks if request data is valid
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Enter the data correctly' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    // Checks whether the user already exists
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
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

    // Checks if fields are entered correctly
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Enter the data correctly' });
    }

    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

    // Checks if user wants to change email
    if (email !== user.email) {
      // Search in the database if there are any users with the given email
      const userExists = await User.findOne({ where: { email } });

      // Checks that the email that the user wants to change already exists
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    // Checks if user wants to change password and if old password is entered correctly
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Invalid password' });
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
