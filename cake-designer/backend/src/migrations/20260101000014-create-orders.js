"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("orders", {
      order_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "user_id" },
        onDelete: "SET NULL",
      },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "user_addresses", key: "address_id" },
        onDelete: "SET NULL",
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "coupons", key: "coupon_id" },
        onDelete: "SET NULL",
      },
      cake_details: { type: Sequelize.JSONB, allowNull: true },
      total_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_status: { type: Sequelize.STRING, defaultValue: "Pending" },
      current_status: { type: Sequelize.STRING, defaultValue: "pending" },
      customer_notes: { type: Sequelize.TEXT, allowNull: true },
      delivery_address: { type: Sequelize.TEXT, allowNull: true },
      reference_image_url: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("orders");
  },
};

