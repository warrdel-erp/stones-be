"use strict";

const CUSTOMER_ADDRESS_TYPES = {
  SHIPPING: "SHIPPING",
  REMIT: "REMIT",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("customer_addresses", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contactName: {
        type: Sequelize.STRING(255),
      },
      contactEmail: {
        type: Sequelize.STRING(255),
      },
      contactNumber: {
        type: Sequelize.STRING(15),
      },
      lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      long: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      addressType: {
        type: Sequelize.ENUM(...Object.values(CUSTOMER_ADDRESS_TYPES)),
        allowNull: false,
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "customers",
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
    await queryInterface.dropTable("customer_addresses");
  },
};
