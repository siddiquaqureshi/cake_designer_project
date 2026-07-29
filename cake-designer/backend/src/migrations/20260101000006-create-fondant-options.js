"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("fondant_options", {
      fondant_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      color_name: { type: Sequelize.STRING, allowNull: false },
      hex_code: { type: Sequelize.STRING, allowNull: true },
      price_modifier: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("fondant_options"),
};
