import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

import User from '../models/User';

import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

import Notification from '../schemas/Notification';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      attributes: ['id', 'user_id'],
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
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });

    // Verifica se meetup existe
    if (!meetup) {
      return res.status(400).json({ error: 'Informe um meetup válido' });
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
        meetup_id: req.params.meetupId,
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
      meetup_id: req.params.meetupId,
      user_id: req.userId,
    });

    const user = await User.findByPk(req.userId);

    // Salva a notificação
    await Notification.create({
      content: `Nova inscrição de ${user.name} para meetapp [${meetup.title}]`,
      user: req.userId,
    });

    // Enviar notificação por email para o organizador do meetup
    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
