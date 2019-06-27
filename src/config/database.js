module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  port: '5438',
  username: 'postgres',
  password: 'docker',
  database: 'meetapp',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
