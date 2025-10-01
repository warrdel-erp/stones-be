"use strict";

const PAYMENT_BILL_REFERENCE_TYPES = {
  SIPL: "sipl",
  BILL: "bill",
  SO_INVOICE: "soInvoice",
  ADVANCED_DEPOSIT: "advancedDeposit",
};

module.exports = {
  up: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.createTable(
      "payment_bills",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        paymentId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "payments",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        referenceId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        referenceType: {
          type: Sequelize.ENUM(...Object.values(PAYMENT_BILL_REFERENCE_TYPES)),
          allowNull: false,
        },
        amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
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
          allowNull: true,
        },
      },

      {
        unique_keys: {
          unique_paymentId_referenceId_referenceType: {
            fields: ["paymentId", "referenceId", "referenceType"],
          },
        },
      }
    );
  },
  down: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.dropTable("payment_bills");
  },
};
