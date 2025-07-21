const knex = require("knex");

const knexConfig = {
  development: {
    client: "pg",
    connection: {
      host: "localhost",
      user: "postgres",
      password: "D@nth3man",
      database: "neighbors",
    },
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};

module.exports = knexConfig;
