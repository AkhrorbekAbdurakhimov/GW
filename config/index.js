const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  APP: {
    PORT: process.env.APP_PORT,
    ENV: process.env.APP_ENV,
    SECRET_KEY: process.env.APP_SECRET_KEY,
    SESSION_TIMEOUT: process.env.APP_SESSION_TIMEOUT,
  },
  DB: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    aplication_name: process.env.DB_APP_NAME,
  },
};
