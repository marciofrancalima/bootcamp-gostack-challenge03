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
    // O usuário também deve poder editar todos dados de meetups que ainda
    // não aconteceram e que ele é organizador.

    return res.json();
  }
}

export default new MeetupController();
