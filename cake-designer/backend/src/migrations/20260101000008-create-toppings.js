"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("toppings", {
      topping_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      stock_quantity: { type: Sequelize.INTEGER, defaultValue: 0 },
      price_per_item: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("toppings"),
};
