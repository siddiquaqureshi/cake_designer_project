const { Sequelize } = require("sequelize");
// Explicitly require pg so Vercel's serverless bundler (nft) traces it statically.
// Without this, Sequelize's internal dynamic require('pg') is not bundled and
// throws "Please install pg package manually" in the Lambda environment.
const pg = require("pg");
const config = require("./config")[process.env.NODE_ENV || "development"];

// Inject dialectModule so Sequelize uses the pg we explicitly imported
// instead of trying to dynamic-require it at runtime.
const opts = { ...config, dialectModule: pg };

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], opts)
  : new Sequelize(config.database, config.username, config.password, opts);

module.exports = sequelize;
