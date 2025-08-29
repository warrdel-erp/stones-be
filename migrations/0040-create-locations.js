"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("locations", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactMail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      long: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
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
    await queryInterface.dropTable("locations");
  },
};
