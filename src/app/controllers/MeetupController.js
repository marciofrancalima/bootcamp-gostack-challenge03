import { isBefore, startOfHour, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: File,
          attributes: ['name', 'path', 'url'],
        },
      ],
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
}

export default new MeetupController();
