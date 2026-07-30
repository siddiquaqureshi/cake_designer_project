require("dotenv").config();

// Sequelize-CLI (migrations/seeders) reads this file directly, so it stays
// plain CommonJS returning one config object per environment rather than a
// live Sequelize instance -- src/config/database.js is what the running
// app actually imports.
module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin123",
    database: process.env.DB_NAME || "cake_decorator_db",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin123",
    database: process.env.DB_NAME_TEST || "cake_designer_test",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
  },
  production: {
    use_env_variable: process.env.DATABASE_URL ? "DATABASE_URL" : undefined,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  },
};
