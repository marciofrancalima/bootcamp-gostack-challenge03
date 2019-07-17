import { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    /**
     * Since there are no fields to write to the database other than relationships,
     * the first argument is set as an empty object.
     */
    super.init({}, { sequelize });

    return this;
  }

  // Associating Subscription relationships with models
  static associate(models) {
    this.belongsTo(models.Meetup, { foreignKey: 'meetup_id' });
    this.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default Subscription;
