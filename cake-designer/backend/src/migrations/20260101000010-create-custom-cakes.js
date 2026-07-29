"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("custom_cakes", {
      custom_cake_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // nullable for guests, per schema
        references: { model: "users", key: "user_id" },
        onDelete: "SET NULL",
      },
      cake_base_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "cake_bases", key: "cake_base_id" },
      },
      flavor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "flavors", key: "flavor_id" },
      },
      fondant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "fondant_options", key: "fondant_id" },
      },
      frosting_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "frosting_options", key: "frosting_id" },
      },
      layers_count: { type: Sequelize.INTEGER, defaultValue: 1 },
      custom_text: { type: Sequelize.STRING, allowNull: true },
      text_x: { type: Sequelize.INTEGER, allowNull: true },
      text_y: { type: Sequelize.INTEGER, allowNull: true },
      text_rotation: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      canvas_snapshot_url: { type: Sequelize.STRING, allowNull: true },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("custom_cakes"),
};
