"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("clients", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      accountId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "accounts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      userCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("clients");
  },
};
