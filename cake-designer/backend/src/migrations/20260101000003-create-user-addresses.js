"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_addresses", {
      address_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "user_id" },
        onDelete: "CASCADE",
      },
      address_line: { type: Sequelize.STRING, allowNull: false },
      city: { type: Sequelize.STRING, allowNull: false },
      postal_code: { type: Sequelize.STRING, allowNull: true },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("user_addresses"),
};
