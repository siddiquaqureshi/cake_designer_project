"use strict";
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const modelDefiners = [
  require("./user"),
  require("./userProfile"),
  require("./userAddress"),
  require("./cakeBase"),
  require("./flavor"),
  require("./fondantOption"),
  require("./frostingOption"),
  require("./topping"),
  require("./candleOption"),
  require("./customCake"),
  require("./customCakeTopping"),
  require("./customCakeCandle"),
  require("./coupon"),
  require("./order"),
  require("./orderItem"),
  require("./orderStatusHistory"),
  require("./wishlist"),
  require("./review"),
  require("./payment"),
  require("./notificationLog"),
];

const db = {};

modelDefiners.forEach((definer) => {
  const model = definer(sequelize, DataTypes);
  db[model.name] = model;
});

Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = require("sequelize").Sequelize;

module.exports = db;
