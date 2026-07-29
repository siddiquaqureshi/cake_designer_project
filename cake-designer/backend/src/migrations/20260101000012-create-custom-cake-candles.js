"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("custom_cake_candles", {
      custom_cake_candle_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      custom_cake_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "custom_cakes", key: "custom_cake_id" },
        onDelete: "CASCADE",
      },
      candle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "candle_options", key: "candle_id" },
      },
      coordinate_x: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      coordinate_y: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("custom_cake_candles"),
};
