import { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    /**
     * Como não há campos a serem gravados no banco além dos relacionamentos,
     * o primeiro argumento é setado como um objeto vazio.
     */
    super.init({}, { sequelize });

    return this;
  }

  // Associando os relacionamentos de Subscription com os models
  static associate(models) {
    this.belongsTo(models.Meetup, { foreignKey: 'meetup_id' });
    this.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default Subscription;
