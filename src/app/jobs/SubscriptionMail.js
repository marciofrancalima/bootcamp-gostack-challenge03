import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;
    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: `New subscription for meetapp [${meetup.title}]`,
      template: 'subscription',
      context: {
        organizer: meetup.User.name,
        meetup: meetup.title,
        user: user.name,
        email: user.email,
        date: format(
          parseISO(meetup.date),
          "'Day' dd 'of' MMMM', at' H:mm'h'",
          { locale: pt }
        ),
      },
    });
  }
}

export default new SubscriptionMail();
