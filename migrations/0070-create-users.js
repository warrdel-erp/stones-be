"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
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
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "clients",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      defaultLocationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "locations",
          key: "id",
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
    await queryInterface.dropTable("users");
  },
};
