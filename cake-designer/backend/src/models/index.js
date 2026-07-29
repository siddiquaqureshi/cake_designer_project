"use strict";
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const db = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = require("sequelize").Sequelize;

module.exports = db;
