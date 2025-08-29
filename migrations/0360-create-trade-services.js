"use strict";

const TRADE_SERVICE_REFERENCE_TYPES = {
  LOADING_ORDER: "loadingOrder",
  SIPL: "sipl",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("trade_services", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      referenceType: {
        type: Sequelize.ENUM(...Object.values(TRADE_SERVICE_REFERENCE_TYPES)),
        allowNull: false,
      },
      referenceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      serviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "services",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
    await queryInterface.dropTable("trade_services");
  },
};
