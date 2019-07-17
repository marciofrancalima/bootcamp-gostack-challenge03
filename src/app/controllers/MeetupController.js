import * as Yup from 'yup';
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

    // If the date has passed, set filter
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
    const schema = Yup.object().shape({
      title: Yup.string().required('Title is required'),
      file_id: Yup.number().required('File is required'),
      description: Yup.string().required('Description is required'),
      location: Yup.string().required('Location is required'),
      date: Yup.date().required('Date is required'),
    });

    // Checks if the given data is valid
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Enter the data correctly' });
    }

    // You can not register meetup with a date that has passed
    const startHour = startOfHour(parseISO(req.body.date));

    if (isBefore(startHour, new Date())) {
      return res
        .status(400)
        .json({ error: 'The date you are trying to register has passed' });
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
      return res.status(400).json({ error: 'Meetup does not exists' });
    }

    // Checks if the meetup belongs to the logged in user
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    // Can not edit meetup with date that has passed
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    // You can not edit a meetup that has passed
    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Can not edit meetup that has passed' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    // Search meetup in the database
    const meetup = await Meetup.findByPk(req.params.id);

    // Checks if meetup exists
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists' });
    }

    // Checks if the meetup belongs to the logged in user
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    // Checks if user is trying to delete a meetup already done
    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Can not delete completed meetups' });
    }

    await meetup.destroy();

    return res.json({ message: 'Successfully deleted Meetup' });
  }
}

export default new MeetupController();
