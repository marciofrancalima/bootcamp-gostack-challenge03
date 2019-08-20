import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const page = req.query.page || 1;
    const per_page = req.query.per_page || 10;
    const { id } = req.params;

    if (id) {
      const meetup = await Meetup.findOne({
        where: { id },
        attributes: ['id', 'title', 'description', 'location', 'date'],
        include: [
          {
            model: File,
            as: 'banner',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      if (meetup) {
        return res.json(meetup);
      }

      return res.status(400).json({ message: 'Meetup não encontrado' });
    }

    const where = {};

    // If the date has passed, set filter
    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAndCountAll({
      where,
      attributes: ['id', 'title', 'description', 'location', 'date'],
      order: ['date'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
      limit: per_page,
      offset: (page - 1) * per_page,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required('Título é obrigatório'),
      file_id: Yup.number().required('Uma imagem é obrigatória'),
      description: Yup.string().required('Descrição é obrigatório'),
      location: Yup.string().required('Local é obrigatório'),
      date: Yup.date().required('Data é obrigatória'),
    });

    // Checks if the given data is valid
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Digite os dados corretamente' });
    }

    // You can not register meetup with a date that has passed
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({
        message: 'Essa data já passou',
      });
    }

    // Get the user logged in
    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body, // saves all fields from the request
      user_id, // save the id of the user who registered the meetup
    });

    return res.json(meetup);
  }

  async update(req, res) {
    // Search meetup in the database
    const meetup = await Meetup.findByPk(req.params.id);

    // Checks if meetup exists
    if (!meetup) {
      return res.status(400).json({ message: 'Meetup não encontrado' });
    }

    // Checks if the meetup belongs to the logged in user
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ message: 'Acesso não permitido' });
    }

    // You can not edit a meetup that has passed
    if (meetup.past) {
      return res.status(400).json({
        message: 'Esse meetup já foi realizado e não pode ser alterado',
      });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    // Search meetup in the database
    const meetup = await Meetup.findByPk(req.params.id);

    // Checks if meetup exists
    if (!meetup) {
      return res.status(400).json({ message: 'Meetup não encontrado' });
    }

    // Checks if the meetup belongs to the logged in user
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ message: 'Acesso não permitido' });
    }

    // Checks if user is trying to delete a meetup already done
    if (meetup.past) {
      return res
        .status(400)
        .json({ message: 'Meetup que já aconteceu não pode ser excluído' });
    }

    await meetup.destroy();

    return res.json({ message: 'Meetup excluído com sucesso' });
  }
}

export default new MeetupController();
