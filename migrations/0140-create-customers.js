"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("customers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contactName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      printName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      primaryPhoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      secondaryPhoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      landlineNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      accEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      priceLevel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      taxExempt: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      salesTax: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      paymentTerms: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      exemptCerti: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      exemptExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      internalNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      poRequired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      applyFinanceCharges: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      preferredDocSend: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      daysForGrace: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      daysForHold: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      customerSince: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      einNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      scope: {
        type: Sequelize.ENUM("1", "2"),
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
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      primarySalesPersonId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
    await queryInterface.dropTable("customers");
  },
};
