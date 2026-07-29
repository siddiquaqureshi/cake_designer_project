"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("order_items", {
      order_item_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "order_id" },
        onDelete: "CASCADE",
      },
      custom_cake_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "custom_cakes", key: "custom_cake_id" },
      },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      purchase_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("order_items"),
};
