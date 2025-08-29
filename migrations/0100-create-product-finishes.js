"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("product_finishes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clients",
        },
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
        },
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
        },
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
    await queryInterface.dropTable("product_finishes");
  },
};
