import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class OrganizingController {
  async index(req, res) {
    const page = req.query.page || 1;
    const per_page = req.query.per_page || 10;
    const { id } = req.params;

    if (id) {
      const meetup = await Meetup.findOne({
        where: { id, user_id: req.userId },
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

    // If past is informed in the request, show only finished meetups
    const where = {
      user_id: req.userId,
    };

    if (req.query.filter === 'past') {
      where.date = {
        [Op.lte]: Date.now(),
      };
    }

    if (req.query.filter === 'next') {
      where.date = {
        [Op.gte]: Date.now(),
      };
    }

    const meetups = await Meetup.findAndCountAll({
      where,
      order: ['date'],
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
      limit: per_page,
      offset: (page - 1) * per_page,
    });

    return res.json(meetups);
  }
}

export default new OrganizingController();
