require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'neighbors',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'D@nth3man'
    },
    migrations: {
      directory: './migrations'
    }
  }
};