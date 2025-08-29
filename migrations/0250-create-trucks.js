"use strict";

const VEHICLE_TYPE = {
  LIGHT: "light",
  MEDIUM: "medium",
  HEAVY: "heavy",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("trucks", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      registrationNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      registrationDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      capacity: {
        type: Sequelize.INTEGER,
      },
      vehicleType: {
        type: Sequelize.ENUM(...Object.values(VEHICLE_TYPE)),
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clients",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
    await queryInterface.dropTable("trucks");
  },
};
