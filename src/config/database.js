module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  port: '5438',
  username: 'posgres',
  password: 'docker',
  database: 'meetup',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
