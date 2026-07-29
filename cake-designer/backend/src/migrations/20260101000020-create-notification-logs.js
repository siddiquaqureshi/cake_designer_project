"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("notification_logs", {
      log_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "user_id" },
        onDelete: "CASCADE",
      },
      notification_type: { type: Sequelize.STRING, allowNull: false },
      recipient_number: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.STRING, defaultValue: "pending" },
      sent_at: { type: Sequelize.DATE, allowNull: true },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("notification_logs"),
};
