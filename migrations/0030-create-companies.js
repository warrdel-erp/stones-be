"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("companies", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      companyAddress: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      zipCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactPersonName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactMobile: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clients",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("companies");
  },
};
