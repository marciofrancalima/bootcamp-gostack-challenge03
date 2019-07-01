import {
  isBefore,
  startOfHour,
  parseISO,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    // Se for passado a data, ajustar filtro
    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          attributes: ['id', 'path', 'url'],
        },
      ],
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    // Não pode cadastrar meetup com uma data que já passou
    const startHour = startOfHour(parseISO(req.body.date));

    if (isBefore(startHour, new Date())) {
      return res
        .status(400)
        .json({ error: 'A data que está tentando cadastrar já passou' });
    }

    // Pega o usuário logado
    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body, // salva todos os campos vindo da requisição
      user_id, // salva o id do usuário que cadastrou o meetup
    });

    return res.json(meetup);
  }

  async update(req, res) {
    // Busca meetup no banco de dados
    const meetup = await Meetup.findByPk(req.params.id);

    // Verifica se meetup existe
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup não existe' });
    }

    // Verifica se o meetup pertence ao usuário logado
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Acesso não autorizado' });
    }

    // Não pode editar meetup com data que já passou
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    // Não pode editar um meetup que já passou
    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Não é possível editar meetup que já passou' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    // Busca meetup no banco de dados
    const meetup = await Meetup.findByPk(req.params.id);

    // Verifica se meetup existe
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup não existe' });
    }

    // Verifica se o meetup pertence ao usuário logado
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Acesso não autorizado' });
    }

    // Verifica se o usuário está tentando deletar um meetup já realizado
    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Não pode deletar meetups realizados' });
    }

    // Exclui do banco de dados
    await meetup.destroy();

    return res.json({ message: 'Meetup excluído com sucesso' });
  }
}

export default new MeetupController();
