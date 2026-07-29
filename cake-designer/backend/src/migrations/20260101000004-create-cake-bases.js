"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("cake_bases", {
      cake_base_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      shape: { type: Sequelize.STRING, allowNull: false },
      base_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("cake_bases"),
};
