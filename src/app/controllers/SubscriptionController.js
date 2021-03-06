import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import File from '../models/File';

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
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });

    // Checks if meetup exists
    if (!meetup) {
      return res.status(400).json({ message: 'Esse meetup não existe' });
    }

    // Checks if the meetup belongs to the logged in user
    if (meetup.user_id === req.userId) {
      return res.status(400).json({
        message: 'Você não pode se inscrever nos seus próprios meetups',
      });
    }

    // Checks if meetup has already happened
    if (meetup.past) {
      return res.status(400).json({ message: 'Esse meetup já aconteceu' });
    }

    // Checks if user is already enrolled in meetup
    const checkSubscription = await Subscription.findOne({
      where: {
        meetup_id: req.params.meetupId,
        user_id: req.userId,
      },
    });

    if (checkSubscription) {
      return res.status(400).json({ message: 'Você já está inscrito' });
    }

    // Checks if user is enrolled in a meetup on the same date/time
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
      return res.status(400).json({
        message: 'Você já está inscrito no mesmo horário em outro meetup',
      });
    }

    const subscription = await Subscription.create({
      meetup_id: req.params.meetupId,
      user_id: req.userId,
    });

    const user = await User.findByPk(req.userId);

    // Saves notification
    await Notification.create({
      content: `Nova inscrição de ${user.name} para meetapp [${meetup.title}]`,
      user: req.userId,
    });

    // Send email notification to meetup organizer
    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    // Search subscription in the database
    const subscription = await Subscription.findByPk(req.params.id);

    // Checks if subscription exists
    if (!subscription) {
      return res.status(400).json({
        message: 'Você não está inscrito nesse meetup',
      });
    }

    await subscription.destroy();

    return res.json({ message: 'Inscrição cancelada com sucesso' });
  }
}

export default new SubscriptionController();
