"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("flavors", {
      flavor_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: true },
      price_modifier: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("flavors"),
};
