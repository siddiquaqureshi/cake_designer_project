"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("candle_options", {
      candle_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: Sequelize.ENUM("Candle", "Sparkler"), allowNull: false },
      color_style: { type: Sequelize.STRING, allowNull: true },
      price_per_item: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("candle_options");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_candle_options_type";');
  },
};
