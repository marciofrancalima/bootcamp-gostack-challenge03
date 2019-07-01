import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      attributes: ['id', 'user_id', 'meetup_id'],
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(), // greater than
            },
          },
          attributes: ['id', 'title', 'description', 'location', 'date'],
        },
      ],
      order: [[Meetup, 'date']], // Ordenar por meetups mais próximos
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.body.meetupId);

    // Verifica se meetup existe
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup não existe' });
    }

    // Verifica se o meetup pertence ao usuário logado
    if (meetup.user_id === req.userId) {
      return res
        .status(400)
        .json({ error: 'Você não pode se inscrever no meetup que organiza' });
    }

    // Verifica se meetup já aconteceu
    if (meetup.past) {
      return res.status(400).json({ error: 'Esse meetup já aconteceu' });
    }

    // Verifica se usuário já está inscrito no meetup
    const checkSubscription = await Subscription.findOne({
      where: {
        meetup_id: req.body.meetupId,
        user_id: req.userId,
      },
    });

    if (checkSubscription) {
      return res.status(400).json({ error: 'Você já está cadastrado' });
    }

    // Verifica se usuário está inscrito em algum meetup na mesma data/hora
    const sameTime = await Subscription.findOne({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          where: { date: meetup.date },
        },
      ],
    });

    if (sameTime) {
      return res
        .status(400)
        .json({ error: 'Você já está inscrito nesse horário em outro meetup' });
    }

    // Inscreve o usuário logado no meetup informado
    const subscription = await Subscription.create({
      meetup_id: req.body.meetupId,
      user_id: req.userId,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
