"use strict";

const DELIVERY_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("deliveries", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      status: {
        type: Sequelize.ENUM(...Object.values(DELIVERY_STATUS)),
      },
      truckId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "trucks",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
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
    await queryInterface.dropTable("deliveries");
  },
};
