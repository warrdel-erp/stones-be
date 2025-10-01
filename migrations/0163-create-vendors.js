"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("vendors", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      printName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parentLocationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "locations",
          key: "id",
        },
      },
      type: {
        type: Sequelize.ENUM("FREIGHT", "SUPPLIER"),
        allowNull: false,
      },
      vendorScope: {
        type: Sequelize.ENUM("1", "2"),
        allowNull: true,
      },
      contactName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vendorSince: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      primaryPhoneNo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      secondaryPhoneNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      landlineNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      accountingEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remitAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remitSuite: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remitCity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      remitState: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remitZip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remitCountry: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shippingAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shippingSuite: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shippingCity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shippingState: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shippingZip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shippingCountry: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentTerms: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "USD",
      },
      defaultPaymentMethod: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      internalNotesId: {
        type: Sequelize.INTEGER,
        references: {
          model: "notes",
          key: "id",
        },
        onDelete: "SET NULL",
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
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("vendors");
  },
};
